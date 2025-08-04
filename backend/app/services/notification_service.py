from typing import Dict, Any, List, Optional
from .websocket_manager import websocket_manager
import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.image import MIMEImage
import json
import httpx
from datetime import datetime, timedelta
from ..config import get_settings
from ..database import get_database
from bson import ObjectId
import asyncio
import os
import base64

def serialize_datetime_objects(obj):
    """Recursively convert datetime objects to ISO format strings for JSON serialization"""
    if isinstance(obj, datetime):
        return obj.isoformat()
    elif isinstance(obj, dict):
        return {key: serialize_datetime_objects(value) for key, value in obj.items()}
    elif isinstance(obj, list):
        return [serialize_datetime_objects(item) for item in obj]
    else:
        return obj

class NotificationService:
    def __init__(self):
        self.settings = get_settings()
        self.alert_cooldown: Dict[str, datetime] = {}
        
        # Circuit breaker để tránh spam khi SMTP lỗi
        self.smtp_failures: Dict[str, int] = {}  # Track failures per user
        self.smtp_blocked_until: Dict[str, datetime] = {}  # Block until time
        self.max_failures = 3  # Max failures before blocking
        self.block_duration_minutes = 15  # Block for 15 minutes after max failures
        
        # ANTI-SPAM: Lock mechanism để tránh race condition
        self.email_locks: Dict[str, asyncio.Lock] = {}  # Locks per user+camera  # Prevent spam alerts
        
    async def send_stranger_alert_with_frame_analysis(self, user_id: str, camera_id: str, 
                                                     all_detections: List[Dict[str, Any]], 
                                                     image_data: bytes = None):
        """
        Gửi cảnh báo phát hiện người lạ dựa trên phân tích toàn bộ khung hình
        Chỉ gửi nếu trong khung hình chỉ có người lạ (không có người quen)
        """
        
        # ===== ANTI-SPAM LOCK: Ngăn multiple calls cùng lúc =====
        lock_key = f"{user_id}_{camera_id}_email_lock"
        if lock_key not in self.email_locks:
            self.email_locks[lock_key] = asyncio.Lock()
        
        # Dùng lock để đảm bảo chỉ 1 email process chạy tại 1 thời điểm
        async with self.email_locks[lock_key]:
            print(f"🔒 [EMAIL LOCK] Acquired lock for {user_id}_{camera_id}")
            
            try:
                await self._process_stranger_alert_internal(user_id, camera_id, all_detections, image_data)
            finally:
                print(f"🔓 [EMAIL LOCK] Released lock for {user_id}_{camera_id}")
    
    async def _process_stranger_alert_internal(self, user_id: str, camera_id: str, 
                                             all_detections: List[Dict[str, Any]], 
                                             image_data: bytes = None):
        """Internal function để xử lý stranger alert (được bảo vệ bởi lock)"""
        try:
            # Phân tích các detection trong khung hình
            stranger_detections = []
            known_person_detections = []
            
            for detection in all_detections:
                if detection.get('detection_type') == 'stranger':
                    stranger_detections.append(detection)
                elif detection.get('detection_type') == 'known_person':
                    known_person_detections.append(detection)
            
            # ===== LOGIC MỚI: CHỈ GỬI EMAIL NẾU CHỈ CÓ NGƯỜI LẠ =====
            if stranger_detections and not known_person_detections:
                print(f"🚨 [MAIN EMAIL ALERT] Only strangers detected in frame!")
                print(f"   - Strangers: {len(stranger_detections)}")
                print(f"   - Known persons: {len(known_person_detections)}")
                print(f"   - User ID: {user_id}")
                print(f"   - Camera ID: {camera_id}")
                print(f"   - Current Time: {datetime.utcnow().strftime('%H:%M:%S')}")
                
                # ===== HỆ THỐNG EMAIL THÔNG MINH =====
                # Kiểm tra cooldown thông minh dựa trên:
                # - Thời gian: 1 phút cơ bản giữa các email
                # - Mức độ nghiêm trọng: nhiều người lạ = cooldown ngắn hơn
                
                cooldown_key = f"{user_id}_{camera_id}_stranger_email"
                current_time = datetime.utcnow()
                
                # Kiểm tra cooldown cơ bản (30 giây)
                last_alert_time = self.alert_cooldown.get(cooldown_key)
                basic_cooldown_seconds = 30  # 1 phút
                
                # Điều chỉnh cooldown dựa trên số lượng người lạ
                if len(stranger_detections) >= 3:
                    basic_cooldown_seconds = 15  # Nhiều người lạ → 15 giây
                elif len(stranger_detections) == 1:
                    basic_cooldown_seconds = 30  # 1 người lạ → 30 giây
                
                # Check if we should bypass cooldown in development
                should_bypass_cooldown = (
                    self.settings.bypass_email_cooldown and self.settings.development_mode
                )
                
                print(f"[EMAIL DEBUG] Settings - bypass: {self.settings.bypass_email_cooldown}, dev_mode: {self.settings.development_mode}")
                print(f"[EMAIL DEBUG] Cooldown - key: {cooldown_key}, required: {basic_cooldown_seconds}s")
                
                # ===== CIRCUIT BREAKER: Kiểm tra SMTP failures =====
                if not should_bypass_cooldown:
                    # Check if SMTP is blocked due to repeated failures
                    block_key = f"{user_id}_smtp_block"
                    blocked_until = self.smtp_blocked_until.get(block_key)
                    
                    if blocked_until and current_time < blocked_until:
                        remaining_block = (blocked_until - current_time).total_seconds()
                        print(f"[SMTP BLOCKED] ❌ Email blocked due to repeated failures. Wait {remaining_block:.0f}s")
                        return
                    
                    # Reset block if time passed
                    if blocked_until and current_time >= blocked_until:
                        if block_key in self.smtp_blocked_until:
                            del self.smtp_blocked_until[block_key]
                        if block_key in self.smtp_failures:
                            self.smtp_failures[block_key] = 0
                        print(f"[SMTP UNBLOCKED] ✅ SMTP block cleared for user {user_id}")
                
                if not should_bypass_cooldown:
                    if last_alert_time and (current_time - last_alert_time < timedelta(seconds=basic_cooldown_seconds)):
                        remaining_time = timedelta(seconds=basic_cooldown_seconds) - (current_time - last_alert_time)
                        print(f"[EMAIL COOLDOWN] ❌ BLOCKED - Chờ {remaining_time.total_seconds():.0f}s nữa mới gửi email tiếp")
                        return
                    else:
                        if last_alert_time:
                            elapsed = (current_time - last_alert_time).total_seconds()
                            print(f"[EMAIL COOLDOWN] ✅ ALLOWED - {elapsed:.0f}s đã trôi qua (yêu cầu {basic_cooldown_seconds}s)")
                        else:
                            print(f"[EMAIL COOLDOWN] ✅ ALLOWED - Chưa có email nào được gửi")
                else:
                    print(f"[EMAIL COOLDOWN] ⚠️ BYPASSED - Development mode với bypass enabled")
                
                if should_bypass_cooldown:
                    print(f"[DEV MODE] Bypassing email cooldown for testing")
                
                # Get camera info
                camera_info = await self._get_camera_info(camera_id)
                
                # Lưu detection log vào database để theo dõi số liệu thực
                detection_log_id = await self._save_detection_log_with_email_flag(user_id, camera_id, stranger_detections, has_known_person=False)
                
                # Prepare detections data with serializable datetime
                serializable_detections = []
                for detection in stranger_detections:
                    serializable_detection = detection.copy()
                    # Convert datetime objects to ISO format strings
                    if 'timestamp' in serializable_detection and isinstance(serializable_detection['timestamp'], datetime):
                        serializable_detection['timestamp'] = serializable_detection['timestamp'].isoformat()
                    serializable_detections.append(serializable_detection)
                
                # Get system stats with serializable datetime
                system_stats = await self._get_system_detection_stats(user_id, camera_id)
                
                # Prepare alert data với số liệu thực từ hệ thống
                alert_data = {
                    "type": "stranger_only_alert",
                    "severity": "high",
                    "title": "⚠️ NGƯỜI LẠ PHÁT HIỆN",
                    "message": f"Phát hiện {len(stranger_detections)} người lạ tại {camera_info.get('name', 'Camera')} (không có người quen)",
                    "stranger_count": len(stranger_detections),
                    "known_person_count": len(known_person_detections),
                    "detections": serializable_detections,
                    "camera_info": camera_info,
                    "timestamp": datetime.utcnow().isoformat(),
                    "action_required": True,
                    "alert_id": f"stranger_alert_{int(datetime.utcnow().timestamp())}",
                    "detection_log_id": detection_log_id,  # ID của log trong database
                    "system_stats": system_stats  # Thống kê thực của hệ thống
                }
                
                # Ensure all datetime objects are serialized
                alert_data = serialize_datetime_objects(alert_data)
                
                # Send WebSocket notification (real-time)
                await websocket_manager.send_detection_alert(user_id, alert_data)
                
                # Get user notification preferences
                user_settings = await self._get_user_notification_settings(user_id)
                
                # ===== FORCE SEND EMAIL ALWAYS =====
                print(f"🚀 FORCING EMAIL SEND - Settings check: {user_settings.get('email_alerts', True)}")
                print(f"🚀 SMTP Config - Server: {self.settings.smtp_server}, User: {self.settings.smtp_username}")
                
                # Send email if enabled - ALWAYS FOR STRANGER ONLY
                email_sent = False
                email_attempted = False
                try:
                    email_attempted = True
                    email_sent = await self._send_stranger_email_with_image(user_id, alert_data, image_data)
                    print(f"🚀 EMAIL SEND RESULT: {email_sent}")
                    
                    # ===== CIRCUIT BREAKER: Track success/failure =====
                    block_key = f"{user_id}_smtp_block"
                    if email_sent:
                        # Reset failure count on success
                        if block_key in self.smtp_failures:
                            self.smtp_failures[block_key] = 0
                    else:
                        # Increment failure count
                        self.smtp_failures[block_key] = self.smtp_failures.get(block_key, 0) + 1
                        
                        # Block if too many failures
                        if self.smtp_failures[block_key] >= self.max_failures:
                            self.smtp_blocked_until[block_key] = current_time + timedelta(minutes=self.block_duration_minutes)
                            print(f"[SMTP CIRCUIT BREAKER] ⚡ User {user_id} blocked for {self.block_duration_minutes} minutes after {self.max_failures} failures")
                    
                    # Update detection log to mark email sent
                    if email_sent and detection_log_id:
                        await self._update_detection_log_email_status(detection_log_id, True)
                        print(f"✅ Detection log updated with email status")
                except Exception as email_error:
                    email_attempted = True
                    print(f"❌ EMAIL SEND ERROR: {email_error}")
                    
                    # Track SMTP error in circuit breaker
                    block_key = f"{user_id}_smtp_block"
                    self.smtp_failures[block_key] = self.smtp_failures.get(block_key, 0) + 1
                    
                    if self.smtp_failures[block_key] >= self.max_failures:
                        self.smtp_blocked_until[block_key] = current_time + timedelta(minutes=self.block_duration_minutes)
                        print(f"[SMTP CIRCUIT BREAKER] ⚡ User {user_id} blocked for {self.block_duration_minutes} minutes after {self.max_failures} failures")
                    
                    import traceback
                    traceback.print_exc()
                
                # Send webhook if configured
                if user_settings.get("webhook_url"):
                    await self._send_webhook_alert(user_settings["webhook_url"], alert_data)
                
                # ===== QUAN TRỌNG: SET COOLDOWN KHI ĐÃ THỬ GỬI EMAIL =====
                # Để tránh spam, set cooldown ngay cả khi email thất bại
                if email_attempted:
                    self.alert_cooldown[cooldown_key] = current_time
                    
                    if not should_bypass_cooldown:
                        cooldown_info = f"{basic_cooldown_seconds}s"
                        if len(stranger_detections) >= 3:
                            cooldown_info += " (nhiều người lạ - ưu tiên cao)"
                        elif len(stranger_detections) == 1:
                            cooldown_info += " (1 người lạ - bình thường)"
                        
                        result_info = "thành công" if email_sent else "thất bại"
                        print(f"✅ Email cooldown set: {cooldown_info} - Email {result_info}")
                    else:
                        print(f"✅ Email attempted (DEV MODE - không tính cooldown)")
                
                print(f"[SUCCESS] Stranger-only email alert processing completed for user {user_id}")
                
            elif known_person_detections:
                print(f"ℹ️ No email sent: Known persons present in frame ({len(known_person_detections)} known, {len(stranger_detections)} strangers)")
                
                # Still save detection log but mark that known person was present
                if stranger_detections:
                    await self._save_detection_log_with_email_flag(user_id, camera_id, stranger_detections, has_known_person=True)
                    
            elif not stranger_detections:
                print(f"ℹ️ No email sent: No strangers detected")
            
        except Exception as e:
            print(f"[ERROR] Error sending stranger frame analysis alert: {e}")
            import traceback
            traceback.print_exc()
        
    async def send_stranger_alert(self, user_id: str, detection_data: Dict[str, Any]):
        """Gửi cảnh báo phát hiện người lạ - DEPRECATED: Chỉ gửi WebSocket, không gửi email"""
        try:
            # DEPRECATED: Hàm này không còn gửi email để tránh spam
            # Email được xử lý bởi send_stranger_alert_with_frame_analysis()
            
            # Prepare alert data for WebSocket only
            alert_data = {
                "type": "stranger_alert",
                "severity": "high",
                "title": "STRANGER DETECTED",
                "message": f"Unknown person detected at {detection_data.get('camera_name', 'Camera')}",
                "detection_data": detection_data,
                "timestamp": datetime.utcnow().isoformat(),
                "action_required": True,
                "alert_id": f"alert_{int(datetime.utcnow().timestamp())}"
            }
            
            # Send WebSocket notification only (real-time)
            await websocket_manager.send_detection_alert(user_id, alert_data)
            
            # NOTE: Email sending is handled by send_stranger_alert_with_frame_analysis()
            # which has proper cooldown and frame analysis logic
            
            print(f"[SUCCESS] Stranger WebSocket alert sent for user {user_id} (Email handled separately)")
            
        except Exception as e:
            print(f"[ERROR] Error sending stranger alert: {e}")

    async def send_known_person_notification(self, user_id: str, detection_data: Dict[str, Any]):
        """Gửi thông báo phát hiện người quen"""
        try:
            alert_data = {
                "type": "known_person_detected",
                "severity": "info",
                "title": "Known Person Detected",
                "message": f"{detection_data.get('person_name', 'Known Person')} detected at {detection_data.get('camera_name', 'Camera')}",
                "detection_data": detection_data,
                "timestamp": datetime.utcnow().isoformat(),
                "action_required": False
            }
            
            # Send WebSocket notification
            await websocket_manager.send_detection_alert(user_id, alert_data)
            
            # Optional: Send email for known person (usually disabled)
            user_settings = await self._get_user_notification_settings(user_id)
            if user_settings.get("notify_known_persons", False):
                await self._send_email_alert(user_id, alert_data)
            
        except Exception as e:
            print(f"[ERROR] Error sending known person notification: {e}")

    async def _send_stranger_email_with_image(self, user_id: str, alert_data: Dict[str, Any], image_data: bytes = None):
        """Gửi email cảnh báo người lạ với hình ảnh đính kèm"""
        
        # ===== CRITICAL DEBUG: Tìm ai đang gọi function này =====
        import traceback
        caller_info = traceback.extract_stack()[-2]  # Get caller info
        print(f"🔍 [EMAIL CALL] _send_stranger_email_with_image called from:")
        print(f"   File: {caller_info.filename}:{caller_info.lineno}")
        print(f"   Function: {caller_info.name}")
        print(f"   User: {user_id}")
        print(f"   Alert Type: {alert_data.get('type', 'unknown')}")
        
        try:
            user_email = await self._get_user_email(user_id)
            if not user_email:
                print(f"[WARNING] No email found for user {user_id}")
                return
            
            if not self.settings.smtp_username or not self.settings.smtp_password:
                print("[WARNING] SMTP credentials not configured")
                return
            
            # Create email content
            subject = f"🚨 Cảnh báo an ninh - {alert_data['title']}"
            
            # Prepare detection details - Lấy số liệu thực từ hệ thống
            stranger_count = alert_data.get('stranger_count', 0)
            known_person_count = alert_data.get('known_person_count', 0)
            camera_info = alert_data.get('camera_info', {})
            camera_name = camera_info.get('name', 'Camera không xác định')
            camera_location = camera_info.get('location', '')
            alert_id = alert_data.get('alert_id', 'N/A')
            
            timestamp = datetime.fromisoformat(alert_data['timestamp'].replace('Z', '+00:00'))
            formatted_time = timestamp.strftime("%d/%m/%Y lúc %H:%M:%S")
            
            # Chi tiết từng detection thực tế
            stranger_details = ""
            total_confidence = 0
            if alert_data.get('detections'):
                for i, detection in enumerate(alert_data['detections'][:5]):  # Limit to 5 detections
                    confidence = detection.get('confidence', 0) * 100
                    total_confidence += confidence
                    bbox = detection.get('bbox', {})
                    
                    # Handle bbox format - could be dict or list [x, y, w, h]
                    if isinstance(bbox, list) and len(bbox) >= 4:
                        x, y, width, height = bbox[0], bbox[1], bbox[2], bbox[3]
                    elif isinstance(bbox, dict):
                        x = bbox.get('x', 0)
                        y = bbox.get('y', 0)
                        width = bbox.get('width', 0)
                        height = bbox.get('height', 0)
                    else:
                        x = y = width = height = 0
                    
                    stranger_details += f"    • Người lạ #{i+1}:\n"
                    stranger_details += f"      - Độ tin cậy: {confidence:.1f}%\n"
                    stranger_details += f"      - Vị trí trong khung hình: ({x:.0f}, {y:.0f})\n"
                    stranger_details += f"      - Kích thước khung: {width:.0f}x{height:.0f} pixels\n"
                    stranger_details += f"      - Thời gian phát hiện: {detection.get('timestamp', 'N/A')}\n\n"
            
            # Tính độ tin cậy trung bình
            avg_confidence = total_confidence / len(alert_data.get('detections', [])) if alert_data.get('detections') else 0
            
            html_content = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <style>
                    body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }}
                    .container {{ max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); overflow: hidden; }}
                    .header {{ background: linear-gradient(135deg, #dc3545, #c82333); color: white; padding: 20px; text-align: center; }}
                    .header h1 {{ margin: 0; font-size: 24px; font-weight: bold; }}
                    .alert-icon {{ font-size: 48px; margin-bottom: 10px; }}
                    .content {{ padding: 30px; }}
                    .alert-box {{ background-color: #f8d7da; border: 1px solid #f5c6cb; border-radius: 8px; padding: 20px; margin: 20px 0; }}
                    .detail-section {{ background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 15px 0; }}
                    .detail-title {{ font-weight: bold; color: #495057; margin-bottom: 10px; font-size: 16px; }}
                    .detail-content {{ color: #6c757d; line-height: 1.6; }}
                    .timestamp {{ color: #6c757d; font-size: 14px; font-style: italic; }}
                    .footer {{ background-color: #f8f9fa; padding: 20px; text-align: center; color: #6c757d; font-size: 12px; border-top: 1px solid #dee2e6; }}
                    .urgent {{ color: #dc3545; font-weight: bold; }}
                    .image-note {{ background-color: #d1ecf1; border: 1px solid #bee5eb; border-radius: 5px; padding: 15px; margin: 15px 0; color: #0c5460; }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <div class="alert-icon">🚨</div>
                        <h1>CẢNH BÁO AN NINH</h1>
                        <p class="timestamp">Ngày {formatted_time}</p>
                    </div>
                    
                    <div class="content">
                        <div class="alert-box">
                            <h2 class="urgent">⚠️ PHÁT HIỆN NGƯỜI LẠ</h2>
                            <p><strong>Tình huống:</strong> Hệ thống đã phát hiện <strong>{stranger_count} người lạ</strong> tại camera <strong>{camera_name}</strong> mà không có người quen nào trong khung hình.</p>
                        </div>
                        
                        <div class="detail-section">
                            <div class="detail-title">📍 Thông tin hệ thống thực tế:</div>
                            <div class="detail-content">
                                <p><strong>📹 Camera:</strong> {camera_name}</p>
                                {f"<p><strong>� Vị trí:</strong> {camera_location}</p>" if camera_location else ""}
                                <p><strong>🆔 ID Camera:</strong> {camera_info.get('id', 'N/A')}</p>
                                <p><strong>�🕒 Thời gian phát hiện:</strong> {formatted_time}</p>
                                <p><strong>👥 Tổng số người lạ:</strong> {stranger_count}</p>
                                <p><strong>✅ Số người quen:</strong> {known_person_count}</p>
                                <p><strong>🎯 Độ tin cậy trung bình:</strong> {avg_confidence:.1f}%</p>
                                <p><strong>🔢 ID Cảnh báo:</strong> {alert_id}</p>
                                <p><strong>📊 Loại camera:</strong> {camera_info.get('camera_type', 'Không xác định')}</p>
                            </div>
                        </div>
                        
                        {f'''
                        <div class="detail-section">
                            <div class="detail-title">🔍 Chi tiết phát hiện từng người lạ (Dữ liệu thực):</div>
                            <div class="detail-content">
                                <pre style="background-color: #ffffff; padding: 10px; border: 1px solid #dee2e6; border-radius: 5px; font-size: 13px;">{stranger_details}</pre>
                            </div>
                        </div>
                        ''' if stranger_details else ''}
                        
                        <div class="detail-section">
                            <div class="detail-title">📊 Thống kê hệ thống (24h qua):</div>
                            <div class="detail-content">
                                <p><strong>🎯 Tổng số detection:</strong> {len(alert_data.get('detections', []))}</p>
                                <p><strong>⚠️ Mức độ nghiêm trọng:</strong> {alert_data.get('severity', 'N/A').upper()}</p>
                                <p><strong>🔔 Loại cảnh báo:</strong> {alert_data.get('type', 'N/A')}</p>
                                <p><strong>🕐 Timestamp hệ thống:</strong> {alert_data.get('timestamp', 'N/A')}</p>
                                <p><strong>🆔 Log ID:</strong> {alert_data.get('detection_log_id', 'N/A')}</p>
                                {f"<p><strong>📝 Mô tả camera:</strong> {camera_info.get('description', 'Không có')}</p>" if camera_info.get('description') else ""}
                            </div>
                        </div>
                        
                        {f'''
                        <div class="detail-section" style="background-color: #e3f2fd;">
                            <div class="detail-title">📈 Thống kê hệ thống thực tế (24h qua):</div>
                            <div class="detail-content">
                                <p><strong>🔍 Tổng detection 24h:</strong> {alert_data.get('system_stats', {}).get('total_detections_24h', 'N/A')}</p>
                                <p><strong>🚨 Cảnh báo người lạ 24h:</strong> {alert_data.get('system_stats', {}).get('stranger_alerts_24h', 'N/A')}</p>
                                <p><strong>📊 Độ tin cậy TB 24h:</strong> {alert_data.get('system_stats', {}).get('avg_confidence_24h', 'N/A')}%</p>
                                <p><strong>📈 Độ tin cậy cao nhất:</strong> {alert_data.get('system_stats', {}).get('max_confidence_24h', 'N/A')}%</p>
                                <p><strong>📉 Độ tin cậy thấp nhất:</strong> {alert_data.get('system_stats', {}).get('min_confidence_24h', 'N/A')}%</p>
                                <p><strong>📹 Tổng số camera:</strong> {alert_data.get('system_stats', {}).get('total_cameras', 'N/A')}</p>
                                <p><strong>👤 Số người quen đã lưu:</strong> {alert_data.get('system_stats', {}).get('known_persons_count', 'N/A')}</p>
                                <p><strong>🕐 Cập nhật lúc:</strong> {alert_data.get('system_stats', {}).get('last_updated', 'N/A')}</p>
                            </div>
                        </div>
                        ''' if alert_data.get('system_stats') else ''}
                        
                        {'''
                        <div class="image-note">
                            <strong>📸 Hình ảnh:</strong> Hình ảnh hiện trường đã được đính kèm trong email này để bạn có thể xem chi tiết.
                        </div>
                        ''' if image_data else ''}
                        
                        <div class="alert-box">
                            <p class="urgent"><strong>🎯 Hành động cần thiết:</strong></p>
                            <p>Vui lòng kiểm tra camera ngay lập tức và thực hiện các biện pháp an ninh cần thiết.</p>
                        </div>
                    </div>
                    
                    <div class="footer">
                        <p>📱 Đây là cảnh báo tự động từ Hệ thống Nhận diện Khuôn mặt SafeFace.</p>
                        <p>🌐 Đăng nhập vào bảng điều khiển để xem thêm chi tiết và hình ảnh đã lưu.</p>
                        <p>⚙️ Bạn có thể thay đổi cài đặt thông báo trong phần cài đặt tài khoản.</p>
                    </div>
                </div>
            </body>
            </html>
            """
            
            print(f"📧 Sending email to {user_email} with subject: {subject}")
            if image_data:
                print(f"📎 Email includes image attachment ({len(image_data)} bytes)")
            
            # Send email with attachment
            success = await self._send_email_with_image(user_email, subject, html_content, image_data)
            
            if success:
                print(f"✅ Email sent successfully to {user_email}")
                return True
            else:
                print(f"❌ Email sending failed to {user_email}")
                return False
            
        except Exception as e:
            print(f"[ERROR] Error sending stranger email with image: {e}")
            import traceback
            traceback.print_exc()
            return False

    async def _send_email_with_image(self, to_email: str, subject: str, html_content: str, image_data: bytes = None):
        """Send email with image attachment using aiosmtplib"""
        try:
            print(f"🚀 [EMAIL] Starting email send to {to_email}")
            print(f"🚀 [EMAIL] SMTP Config: {self.settings.smtp_server}:{self.settings.smtp_port}")
            print(f"🚀 [EMAIL] Username: {self.settings.smtp_username}")
            
            # Create message
            message = MIMEMultipart("mixed")
            message["Subject"] = subject
            message["From"] = self.settings.smtp_username
            message["To"] = to_email
            
            # Add HTML content
            html_part = MIMEText(html_content, "html", "utf-8")
            message.attach(html_part)
            
            # Add image attachment if provided
            if image_data:
                try:
                    img_attachment = MIMEImage(image_data)
                    img_attachment.add_header(
                        'Content-Disposition',
                        'attachment',
                        filename=f'stranger_detection_{int(datetime.utcnow().timestamp())}.jpg'
                    )
                    message.attach(img_attachment)
                    print(f"📎 Image attachment added to email ({len(image_data)} bytes)")
                except Exception as img_error:
                    print(f"⚠️ Warning: Could not attach image: {img_error}")
            
            print(f"🚀 [EMAIL] Sending email via SMTP...")
            
            # Send email với timeout ngắn hơn để tránh hang
            await aiosmtplib.send(
                message,
                hostname=self.settings.smtp_server,
                port=self.settings.smtp_port,
                start_tls=True,
                username=self.settings.smtp_username,
                password=self.settings.smtp_password,
                timeout=10  # Giảm từ 30s xuống 10s
            )
            
            print(f"✅ [SUCCESS] Email with image sent to {to_email}")
            return True
            
        except asyncio.TimeoutError:
            print(f"❌ [TIMEOUT] SMTP timeout after 10s - Server may be busy")
            return False
        except Exception as e:
            print(f"❌ [ERROR] Error sending email with image: {e}")
            return False
            import traceback
            traceback.print_exc()
            
            # Fallback to sending email without image
            try:
                print(f"🔄 [FALLBACK] Attempting to send email without image...")
                await self._send_email(to_email, subject, html_content)
                print(f"✅ [FALLBACK] Email sent without image to {to_email}")
                return True
            except Exception as fallback_error:
                print(f"❌ [ERROR] Fallback email also failed: {fallback_error}")
                return False

    async def _send_email_alert(self, user_id: str, alert_data: Dict[str, Any]):
        """Gửi email alert với HTML template - Compatible với mọi loại alert_data"""
        try:
            user_email = await self._get_user_email(user_id)
            if not user_email:
                print(f"[WARNING] No email found for user {user_id}")
                return
            
            if not self.settings.smtp_username or not self.settings.smtp_password:
                print("[WARNING] SMTP credentials not configured")
                return
            
            # Create email content
            subject = f"Security Alert - {alert_data['title']}"
            
            # Get camera name from different possible sources
            camera_name = "Unknown"
            if alert_data.get('camera_info', {}).get('name'):
                camera_name = alert_data['camera_info']['name']
            elif alert_data.get('detection_data', {}).get('camera_name'):
                camera_name = alert_data['detection_data']['camera_name']
            
            # Get detection type
            detection_type = alert_data.get('type', alert_data.get('detection_data', {}).get('detection_type', 'Unknown'))
            
            html_content = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {{ font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }}
                    .container {{ max-width: 600px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }}
                    .header {{ background-color: {'#dc3545' if alert_data.get('severity') == 'high' else '#007bff'}; color: white; padding: 15px; border-radius: 5px; margin-bottom: 20px; }}
                    .content {{ padding: 20px 0; }}
                    .detail-box {{ background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 10px 0; }}
                    .footer {{ text-align: center; color: #6c757d; font-size: 12px; margin-top: 30px; }}
                    .timestamp {{ color: #6c757d; font-size: 14px; }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h2>{alert_data['title']}</h2>
                        <p class="timestamp">{alert_data['timestamp']}</p>
                    </div>
                    
                    <div class="content">
                        <p><strong>Alert:</strong> {alert_data['message']}</p>
                        
                        <div class="detail-box">
                            <h4>Detection Details:</h4>
                            <p><strong>Camera:</strong> {camera_name}</p>
                            <p><strong>Detection Type:</strong> {detection_type}</p>
                            <p><strong>Severity:</strong> {alert_data.get('severity', 'Unknown')}</p>
                            {f"<p><strong>Stranger Count:</strong> {alert_data.get('stranger_count', 'N/A')}</p>" if alert_data.get('stranger_count') is not None else ""}
                            {f"<p><strong>Known Persons:</strong> {alert_data.get('known_person_count', 'N/A')}</p>" if alert_data.get('known_person_count') is not None else ""}
                        </div>
                        
                        {f'<p style="color: red;"><strong>Action Required:</strong> Please check your camera feed immediately.</p>' if alert_data.get('action_required') else ''}
                    </div>
                    
                    <div class="footer">
                        <p>This is an automated alert from your Face Recognition Security System.</p>
                        <p>Log in to your dashboard to view more details and captured images.</p>
                    </div>
                </div>
            </body>
            </html>
            """
            
            # Send email
            await self._send_email(user_email, subject, html_content)
            
        except Exception as e:
            print(f"[ERROR] Error sending email alert: {e}")

    async def _send_email(self, to_email: str, subject: str, html_content: str):
        """Send email using aiosmtplib"""
        try:
            # Create message
            message = MIMEMultipart("alternative")
            message["Subject"] = subject
            message["From"] = self.settings.smtp_username
            message["To"] = to_email
            
            # Add HTML content
            html_part = MIMEText(html_content, "html")
            message.attach(html_part)
            
            # Send email
            await aiosmtplib.send(
                message,
                hostname=self.settings.smtp_server,
                port=self.settings.smtp_port,
                start_tls=True,
                username=self.settings.smtp_username,
                password=self.settings.smtp_password,
                timeout=30
            )
            
            print(f"[SUCCESS] Email sent to {to_email}")
            
        except Exception as e:
            print(f"[ERROR] Error sending email: {e}")

    async def _send_webhook_alert(self, webhook_url: str, alert_data: Dict[str, Any]):
        """Send webhook notification"""
        try:
            webhook_payload = {
                "event": "face_detection_alert",
                "data": alert_data,
                "timestamp": datetime.utcnow().isoformat()
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    webhook_url,
                    json=webhook_payload,
                    timeout=10.0,
                    headers={"Content-Type": "application/json"}
                )
                
                if response.status_code == 200:
                    print(f"[SUCCESS] Webhook sent successfully to {webhook_url}")
                else:
                    print(f"[WARNING] Webhook failed with status {response.status_code}")
                    
        except Exception as e:
            print(f"[ERROR] Error sending webhook: {e}")

    async def _get_user_notification_settings(self, user_id: str) -> Dict[str, Any]:
        """Get user notification preferences"""
        try:
            db = get_database()
            settings = await db.user_settings.find_one({"user_id": ObjectId(user_id)})
            
            return {
                "email_alerts": settings.get("email_alerts", True) if settings else True,
                "stranger_only_alerts": settings.get("stranger_only_alerts", True) if settings else True,
                "webhook_url": settings.get("webhook_url") if settings else None,
                "notify_known_persons": settings.get("notify_known_persons", False) if settings else False,
                "alert_cooldown": settings.get("alert_cooldown", 300) if settings else 300
            }
            
        except Exception as e:
            print(f"[ERROR] Error getting user notification settings: {e}")
            return {
                "email_alerts": True, 
                "stranger_only_alerts": True,
                "webhook_url": None, 
                "notify_known_persons": False, 
                "alert_cooldown": 300
            }

    async def _get_user_email(self, user_id: str) -> Optional[str]:
        """Get user email address"""
        try:
            db = get_database()
            user = await db.users.find_one({"_id": ObjectId(user_id)})
            return user.get("email") if user else None
            
        except Exception as e:
            print(f"[ERROR] Error getting user email: {e}")
            return None

    async def _get_camera_info(self, camera_id: str) -> Dict[str, Any]:
        """Get camera information"""
        try:
            db = get_database()
            camera = await db.cameras.find_one({"_id": ObjectId(camera_id)})
            
            if camera:
                return {
                    "id": str(camera["_id"]),
                    "name": camera.get("name", "Camera không xác định"),
                    "camera_type": camera.get("camera_type", "unknown"),
                    "location": camera.get("location", ""),
                    "description": camera.get("description", ""),
                    "created_at": camera.get("created_at").isoformat() if isinstance(camera.get("created_at"), datetime) else str(camera.get("created_at", "")),
                    "status": camera.get("status", "active")
                }
            else:
                return {
                    "id": camera_id,
                    "name": "Camera không xác định",
                    "camera_type": "unknown",
                    "location": "",
                    "description": "",
                    "created_at": "",
                    "status": "unknown"
                }
                
        except Exception as e:
            print(f"[ERROR] Error getting camera info: {e}")
            return {
                "id": camera_id,
                "name": "Camera không xác định",
                "camera_type": "unknown",
                "location": "",
                "description": "",
                "created_at": "",
                "status": "unknown"
            }

    async def _save_detection_log(self, user_id: str, camera_id: str, detections: List[Dict[str, Any]]) -> str:
        """Lưu detection log vào database để theo dõi số liệu thực"""
        try:
            db = get_database()
            
            detection_log = {
                "user_id": ObjectId(user_id),
                "camera_id": ObjectId(camera_id),
                "detection_count": len(detections),
                "detections": detections,
                "detection_type": "stranger",  # Sửa từ "stranger_only_alert" thành "stranger"
                "timestamp": datetime.utcnow(),
                "alert_sent": True,
                "confidence_scores": [d.get('confidence', 0) for d in detections],
                "avg_confidence": sum(d.get('confidence', 0) for d in detections) / len(detections) if detections else 0,
                "alert_type": "stranger_only_alert"  # Thêm field riêng để phân biệt loại alert
            }
            
            result = await db.detection_logs.insert_one(detection_log)
            return str(result.inserted_id)
            
        except Exception as e:
            print(f"[ERROR] Error saving detection log: {e}")
            return "N/A"

    async def _get_system_detection_stats(self, user_id: str, camera_id: str) -> Dict[str, Any]:
        """Lấy thống kê thực của hệ thống detection"""
        try:
            db = get_database()
            
            # Thống kê trong 24h qua
            last_24h = datetime.utcnow() - timedelta(hours=24)
            
            # Đếm tổng số detection trong 24h
            total_detections_24h = await db.detection_logs.count_documents({
                "user_id": ObjectId(user_id),
                "camera_id": ObjectId(camera_id),
                "timestamp": {"$gte": last_24h}
            })
            
            # Đếm số stranger alerts trong 24h
            stranger_alerts_24h = await db.detection_logs.count_documents({
                "user_id": ObjectId(user_id),
                "camera_id": ObjectId(camera_id),
                "alert_type": "stranger_only_alert",  # Sử dụng alert_type thay vì detection_type
                "timestamp": {"$gte": last_24h}
            })
            
            # Lấy confidence trung bình trong 24h
            pipeline = [
                {"$match": {
                    "user_id": ObjectId(user_id),
                    "camera_id": ObjectId(camera_id),
                    "timestamp": {"$gte": last_24h}
                }},
                {"$group": {
                    "_id": None,
                    "avg_confidence": {"$avg": "$avg_confidence"},
                    "max_confidence": {"$max": "$avg_confidence"},
                    "min_confidence": {"$min": "$avg_confidence"}
                }}
            ]
            
            confidence_stats = await db.detection_logs.aggregate(pipeline).to_list(1)
            confidence_data = confidence_stats[0] if confidence_stats else {}
            
            # Thống kê tổng số camera của user
            total_cameras = await db.cameras.count_documents({"user_id": ObjectId(user_id)})
            
            # Thống kê số known persons
            known_persons_count = await db.known_persons.count_documents({"user_id": ObjectId(user_id)})
            
            return {
                "total_detections_24h": total_detections_24h,
                "stranger_alerts_24h": stranger_alerts_24h,
                "avg_confidence_24h": round(confidence_data.get("avg_confidence", 0) * 100, 1),
                "max_confidence_24h": round(confidence_data.get("max_confidence", 0) * 100, 1),
                "min_confidence_24h": round(confidence_data.get("min_confidence", 0) * 100, 1),
                "total_cameras": total_cameras,
                "known_persons_count": known_persons_count,
                "stats_period": "24 hours",
                "last_updated": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            print(f"[ERROR] Error getting system detection stats: {e}")
            return {
                "total_detections_24h": 0,
                "stranger_alerts_24h": 0,
                "avg_confidence_24h": 0,
                "max_confidence_24h": 0,
                "min_confidence_24h": 0,
                "total_cameras": 0,
                "known_persons_count": 0,
                "stats_period": "24 hours",
                "last_updated": datetime.utcnow().isoformat(),
                "error": "Could not retrieve stats"
            }

    async def send_system_notification(self, user_id: str, message: str, notification_type: str = "info"):
        """Send system notification"""
        try:
            notification_data = {
                "type": "system_notification",
                "notification_type": notification_type,
                "message": message,
                "timestamp": datetime.utcnow().isoformat()
            }
            
            await websocket_manager.send_personal_message(
                json.dumps(notification_data), 
                user_id
            )
        except Exception as e:
            print(f"[ERROR] Error sending system notification: {e}")

    async def test_email_configuration(self, user_id: str) -> Dict[str, Any]:
        """Test email configuration by sending a test email"""
        try:
            user_email = await self._get_user_email(user_id)
            if not user_email:
                return {"success": False, "error": "No email found for user"}
            
            if not self.settings.smtp_username or not self.settings.smtp_password:
                return {"success": False, "error": "SMTP credentials not configured"}
            
            # Send test email
            subject = "🧪 Test Email - SafeFace Security System"
            html_content = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <style>
                    body {{ font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }}
                    .container {{ max-width: 600px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }}
                    .header {{ background-color: #28a745; color: white; padding: 15px; border-radius: 5px; margin-bottom: 20px; text-align: center; }}
                    .content {{ padding: 20px 0; }}
                    .footer {{ text-align: center; color: #6c757d; font-size: 12px; margin-top: 30px; }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h2>✅ Email Configuration Test</h2>
                    </div>
                    <div class="content">
                        <p>Congratulations! Your email notification system is working correctly.</p>
                        <p><strong>Test time:</strong> {datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")}</p>
                        <p>You will now receive security alerts when strangers are detected by your cameras.</p>
                    </div>
                    <div class="footer">
                        <p>SafeFace Security System - Email Test</p>
                    </div>
                </div>
            </body>
            </html>
            """
            
            await self._send_email(user_email, subject, html_content)
            
            return {"success": True, "message": f"Test email sent to {user_email}"}
            
        except Exception as e:
            return {"success": False, "error": str(e)}

    async def _save_detection_log_with_email_flag(self, user_id: str, camera_id: str, detections: List[Dict[str, Any]], has_known_person: bool = False) -> str:
        """Lưu detection log với thông tin email và có người quen hay không"""
        try:
            db = get_database()
            
            detection_log = {
                "user_id": ObjectId(user_id),
                "camera_id": ObjectId(camera_id),
                "detection_count": len(detections),
                "detections": detections,
                "detection_type": "stranger",
                "timestamp": datetime.utcnow(),
                "alert_sent": True,
                "confidence_scores": [d.get('confidence', 0) for d in detections],
                "avg_confidence": sum(d.get('confidence', 0) for d in detections) / len(detections) if detections else 0,
                "alert_type": "stranger_only_alert",
                "has_known_person_in_frame": has_known_person,
                "email_sent": not has_known_person,  # Chỉ gửi email nếu không có người quen
                "email_sent_at": datetime.utcnow() if not has_known_person else None
            }
            
            result = await db.detection_logs.insert_one(detection_log)
            return str(result.inserted_id)
            
        except Exception as e:
            print(f"[ERROR] Error saving detection log with email flag: {e}")
            return "N/A"

    async def _update_detection_log_email_status(self, detection_log_id: str, email_sent: bool):
        """Cập nhật trạng thái gửi email cho detection log"""
        try:
            db = get_database()
            
            update_data = {
                "email_sent": email_sent,
                "email_sent_at": datetime.utcnow() if email_sent else None
            }
            
            await db.detection_logs.update_one(
                {"_id": ObjectId(detection_log_id)},
                {"$set": update_data}
            )
            
            print(f"[SUCCESS] Updated email status for detection log {detection_log_id}")
            
        except Exception as e:
            print(f"[ERROR] Error updating detection log email status: {e}")


# Global instance
notification_service = NotificationService()
