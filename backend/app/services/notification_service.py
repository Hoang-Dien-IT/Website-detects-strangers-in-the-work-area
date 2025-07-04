from typing import Dict, Any, List, Optional
from .websocket_manager import websocket_manager
import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import json
import httpx
from datetime import datetime, timedelta
from ..config import get_settings
from ..database import get_database
from bson import ObjectId
import asyncio

class NotificationService:
    def __init__(self):
        self.settings = get_settings()
        self.alert_cooldown: Dict[str, datetime] = {}  # Prevent spam alerts
        
    async def send_stranger_alert(self, user_id: str, detection_data: Dict[str, Any]):
        """Gửi cảnh báo phát hiện người lạ"""
        try:
            # Check cooldown to prevent spam
            cooldown_key = f"{user_id}_{detection_data.get('camera_id', '')}_stranger"
            last_alert = self.alert_cooldown.get(cooldown_key)
            
            if last_alert and datetime.utcnow() - last_alert < timedelta(minutes=5):
                print(f"[COOLDOWN] Alert cooldown active for {cooldown_key}")
                return
            
            # Prepare alert data
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
            
            # Send WebSocket notification (real-time)
            await websocket_manager.send_detection_alert(user_id, alert_data)
            
            # Get user notification preferences
            user_settings = await self._get_user_notification_settings(user_id)
            
            # Send email if enabled
            if user_settings.get("email_alerts", True):
                await self._send_email_alert(user_id, alert_data)
            
            # Send webhook if configured
            if user_settings.get("webhook_url"):
                await self._send_webhook_alert(user_settings["webhook_url"], alert_data)
            
            # Update cooldown
            self.alert_cooldown[cooldown_key] = datetime.utcnow()
            
            print(f"[SUCCESS] Stranger alert sent for user {user_id}")
            
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

    async def _send_email_alert(self, user_id: str, alert_data: Dict[str, Any]):
        """Gửi email alert với HTML template"""
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
            
            html_content = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {{ font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }}
                    .container {{ max-width: 600px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }}
                    .header {{ background-color: {'#dc3545' if alert_data['severity'] == 'high' else '#007bff'}; color: white; padding: 15px; border-radius: 5px; margin-bottom: 20px; }}
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
                            <p><strong>Camera:</strong> {alert_data['detection_data'].get('camera_name', 'Unknown')}</p>
                            <p><strong>Detection Type:</strong> {alert_data['detection_data'].get('detection_type', 'Unknown')}</p>
                            <p><strong>Confidence:</strong> {alert_data['detection_data'].get('confidence', 0) * 100:.1f}%</p>
                            {f"<p><strong>Person:</strong> {alert_data['detection_data'].get('person_name', 'Unknown')}</p>" if alert_data['detection_data'].get('person_name') else ""}
                        </div>
                        
                        {f'<p style="color: red;"><strong>Action Required:</strong> Please check your camera feed immediately.</p>' if alert_data['action_required'] else ''}
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
                "webhook_url": settings.get("webhook_url") if settings else None,
                "notify_known_persons": settings.get("notify_known_persons", False) if settings else False,
                "alert_cooldown": settings.get("alert_cooldown", 300) if settings else 300
            }
            
        except Exception as e:
            print(f"[ERROR] Error getting user notification settings: {e}")
            return {"email_alerts": True, "webhook_url": None, "notify_known_persons": False, "alert_cooldown": 300}

    async def _get_user_email(self, user_id: str) -> Optional[str]:
        """Get user email address"""
        try:
            db = get_database()
            user = await db.users.find_one({"_id": ObjectId(user_id)})
            return user.get("email") if user else None
            
        except Exception as e:
            print(f"[ERROR] Error getting user email: {e}")
            return None

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

    async def send_camera_status_alert(self, user_id: str, camera_name: str, status: str):
        """Send camera status alert (online/offline)"""
        try:
            alert_data = {
                "type": "camera_status",
                "severity": "warning" if status == "offline" else "info",
                "title": f"Camera {status.title()}",
                "message": f"Camera '{camera_name}' is now {status}",
                "timestamp": datetime.utcnow().isoformat(),
                "action_required": status == "offline"
            }
            
            await websocket_manager.send_detection_alert(user_id, alert_data)
            
        except Exception as e:
            print(f"[ERROR] Error sending camera status alert: {e}")

    async def send_test_notification(self, user_id: str):
        """Send test notification to user"""
        try:
            # Get user notification settings
            settings = await self._get_user_notification_settings(user_id)
            
            test_data = {
                "type": "test",
                "title": "Test Notification",
                "message": "This is a test notification from your Face Recognition system",
                "timestamp": datetime.utcnow().isoformat(),
                "severity": "info"
            }
            
            # Send email if enabled
            if settings.get("email_notifications", False):
                await self._send_email_alert(user_id, test_data)
            
            # Send WebSocket notification
            from ..services.websocket_manager import websocket_manager
            await websocket_manager.send_personal_message(
                json.dumps(test_data), 
                user_id
            )
            
        except Exception as e:
            print(f"Error sending test notification: {e}")
            raise

    async def cleanup_old_cooldowns(self):
        """Cleanup old cooldown entries"""
        try:
            cutoff_time = datetime.utcnow() - timedelta(hours=1)
            keys_to_remove = [
                key for key, timestamp in self.alert_cooldown.items()
                if timestamp < cutoff_time
            ]
            
            for key in keys_to_remove:
                del self.alert_cooldown[key]
                
            print(f"[CLEANUP] Cleaned up {len(keys_to_remove)} old cooldown entries")
            
        except Exception as e:
            print(f"[ERROR] Error cleaning up cooldowns: {e}")

# Global instance
notification_service = NotificationService()