#!/usr/bin/env python3
"""
Script test email notification cho SafeFace system
Chạy script này để test email notification trực tiếp
"""

import asyncio
import os
import sys
from datetime import datetime

# Add parent directory to path to import modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.services.notification_service import notification_service
from app.config import get_settings

async def test_email_basic():
    """Test cơ bản gửi email"""
    print("🧪 Testing basic email functionality...")
    
    settings = get_settings()
    print(f"📧 SMTP Server: {settings.smtp_server}:{settings.smtp_port}")
    print(f"📧 SMTP Username: {settings.smtp_username}")
    print(f"📧 SMTP Password: {'*' * len(settings.smtp_password) if settings.smtp_password else 'NOT SET'}")
    
    if not settings.smtp_username or not settings.smtp_password:
        print("❌ SMTP credentials not configured! Please set SMTP_USERNAME and SMTP_PASSWORD in .env file")
        return False
    
    # Test basic email
    try:
        test_email = settings.smtp_username  # Use same email as sender for test
        subject = "🧪 SafeFace Email Test"
        html_content = """
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"></head>
        <body style="font-family: Arial, sans-serif; padding: 20px;">
            <h2 style="color: #28a745;">✅ Email Test Successful!</h2>
            <p>This is a test email from SafeFace security system.</p>
            <p><strong>Test time:</strong> """ + datetime.now().strftime("%Y-%m-%d %H:%M:%S") + """</p>
            <p>If you receive this email, your SMTP configuration is working correctly.</p>
        </body>
        </html>
        """
        
        await notification_service._send_email(test_email, subject, html_content)
        print(f"✅ Basic email test successful! Email sent to {test_email}")
        return True
        
    except Exception as e:
        print(f"❌ Basic email test failed: {e}")
        return False

async def test_stranger_alert_email():
    """Test stranger alert email với sample data"""
    print("\n🚨 Testing stranger alert email...")
    
    # Sample data
    user_id = "test_user_id"
    sample_alert_data = {
        "type": "stranger_only_alert",
        "severity": "high",
        "title": "⚠️ NGƯỜI LẠ PHÁT HIỆN (TEST)",
        "message": "Test email - Phát hiện 1 người lạ tại Camera Test",
        "stranger_count": 1,
        "known_person_count": 0,
        "detections": [
            {
                "detection_type": "stranger",
                "person_name": "Unknown",
                "confidence": 0.85,
                "bbox": {"x": 100, "y": 50, "width": 200, "height": 250},
                "timestamp": datetime.now().isoformat()
            }
        ],
        "camera_info": {
            "id": "test_camera_123",
            "name": "Camera Test Email",
            "location": "Cửa chính",
            "camera_type": "IP Camera",
            "description": "Test camera để kiểm tra email notification"
        },
        "timestamp": datetime.now().isoformat(),
        "action_required": True,
        "alert_id": f"test_alert_{int(datetime.now().timestamp())}",
        "detection_log_id": "test_log_123",
        "system_stats": {
            "total_detections_24h": 5,
            "stranger_alerts_24h": 2,
            "avg_confidence_24h": 82.5,
            "max_confidence_24h": 95.0,
            "min_confidence_24h": 70.0,
            "total_cameras": 1,
            "known_persons_count": 3,
            "last_updated": datetime.now().isoformat()
        }
    }
    
    try:
        # Mock user email (sử dụng SMTP username cho test)
        settings = get_settings()
        test_email = settings.smtp_username
        
        # Monkey patch _get_user_email to return test email
        original_get_user_email = notification_service._get_user_email
        async def mock_get_user_email(user_id):
            return test_email
        notification_service._get_user_email = mock_get_user_email
        
        # Send test stranger alert
        email_sent = await notification_service._send_stranger_email_with_image(
            user_id=user_id,
            alert_data=sample_alert_data,
            image_data=None  # No image for test
        )
        
        # Restore original method
        notification_service._get_user_email = original_get_user_email
        
        if email_sent:
            print(f"✅ Stranger alert email test successful! Email sent to {test_email}")
            return True
        else:
            print("❌ Stranger alert email test failed")
            return False
            
    except Exception as e:
        print(f"❌ Stranger alert email test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

async def main():
    """Main test function"""
    print("🚀 SafeFace Email Notification Test")
    print("=" * 50)
    
    # Test 1: Basic email
    basic_success = await test_email_basic()
    
    if basic_success:
        # Test 2: Stranger alert email  
        alert_success = await test_stranger_alert_email()
        
        if alert_success:
            print("\n🎉 All email tests passed!")
            print("📧 Your email notification system is working correctly!")
        else:
            print("\n⚠️ Basic email works but stranger alert email failed")
    else:
        print("\n❌ Basic email test failed. Please check your SMTP configuration.")
        print("\n📝 To fix:")
        print("1. Create .env file in backend/ directory")
        print("2. Add these settings to .env:")
        print("   SMTP_USERNAME=your_email@gmail.com")
        print("   SMTP_PASSWORD=your_app_password")
        print("3. For Gmail, use App Password instead of regular password")

if __name__ == "__main__":
    asyncio.run(main())
