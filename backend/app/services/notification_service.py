from typing import Dict, Any, List
from .websocket_manager import websocket_manager
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

class NotificationService:
    async def send_detection_alert(self, user_id: str, detection_data: Dict[str, Any]):
        """Gửi thông báo phát hiện"""
        try:
            # Send WebSocket notification
            await websocket_manager.send_detection_alert(user_id, detection_data)
            
            # TODO: Send email notification if enabled
            # await self._send_email_notification(user_id, detection_data)
            
        except Exception as e:
            print(f"Error sending detection alert: {e}")

    async def _send_email_notification(self, user_id: str, detection_data: Dict[str, Any]):
        """Gửi email thông báo (placeholder)"""
        # TODO: Implement email sending
        pass

    async def send_system_notification(self, user_id: str, message: str, notification_type: str = "info"):
        """Gửi thông báo hệ thống"""
        try:
            notification_data = {
                "type": "system_notification",
                "notification_type": notification_type,
                "message": message,
                "timestamp": "2024-01-01T00:00:00Z"
            }
            
            await websocket_manager.send_personal_message(
                str(notification_data), 
                user_id
            )
        except Exception as e:
            print(f"Error sending system notification: {e}")

# Global instance
notification_service = NotificationService()