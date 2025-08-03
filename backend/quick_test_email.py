#!/usr/bin/env python3
"""
Script test email notification nhanh
"""

import asyncio
import os
import sys
from datetime import datetime

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.services.notification_service import notification_service
from app.config import get_settings

async def quick_test_email():
    """Test nhanh email với mock user"""
    print("🚀 Quick Email Test for SafeFace")
    print("=" * 50)
    
    settings = get_settings()
    
    # Check SMTP config
    print(f"📧 SMTP Server: {settings.smtp_server}:{settings.smtp_port}")
    print(f"📧 SMTP Username: {settings.smtp_username}")
    print(f"📧 SMTP Password: {'SET' if settings.smtp_password else 'NOT SET'}")
    print(f"📧 Development Mode: {settings.development_mode}")
    print(f"📧 Bypass Cooldown: {settings.bypass_email_cooldown}")
    
    if not settings.smtp_username or not settings.smtp_password:
        print("❌ SMTP credentials not configured!")
        return
    
    # Reset all cooldowns
    notification_service.alert_cooldown.clear()
    print("✅ Cooldowns cleared")
    
    # Sample alert data
    alert_data = {
        "type": "stranger_only_alert",
        "severity": "high",
        "title": "⚠️ NGƯỜI LẠ PHÁT HIỆN (TEST)",
        "message": "Test email - Phát hiện người lạ",
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
            "name": "Camera Test Quick",
            "location": "Test Location",
            "camera_type": "IP Camera",
            "description": "Quick test camera"
        },
        "timestamp": datetime.now().isoformat(),
        "action_required": True,
        "alert_id": f"quick_test_{int(datetime.now().timestamp())}",
        "detection_log_id": "quick_test_log",
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
    
    # Mock user email function
    original_get_user_email = notification_service._get_user_email
    async def mock_get_user_email(user_id):
        print(f"🔍 [MOCK] Getting email for user_id: {user_id}")
        email = settings.smtp_username
        print(f"🔍 [MOCK] Returning email: {email}")
        return email
    
    notification_service._get_user_email = mock_get_user_email
    
    try:
        print(f"🚀 Sending test email...")
        
        # Send email directly
        email_sent = await notification_service._send_stranger_email_with_image(
            user_id="test_user_quick",
            alert_data=alert_data,
            image_data=None  # No image for quick test
        )
        
        print(f"🔍 Email send result: {email_sent} (type: {type(email_sent)})")
        
        if email_sent:
            print(f"✅ SUCCESS! Test email sent to {settings.smtp_username}")
            print(f"📧 Check your email inbox (including Spam folder)")
        else:
            print(f"❌ FAILED! Email was not sent (function returned: {email_sent})")
            
    except Exception as e:
        print(f"❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
    finally:
        # Restore original function
        notification_service._get_user_email = original_get_user_email

if __name__ == "__main__":
    asyncio.run(quick_test_email())
