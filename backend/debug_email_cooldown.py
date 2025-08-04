#!/usr/bin/env python3
"""
Debug script để kiểm tra cooldown email
"""

import asyncio
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from app.services.notification_service import notification_service
from app.config import settings
from datetime import datetime, timedelta

async def debug_email_cooldown():
    """Debug email cooldown system"""
    
    print("🔍 EMAIL COOLDOWN DEBUG")
    print("=" * 50)
    
    # Kiểm tra settings
    print(f"📧 Email Settings:")
    print(f"   DEVELOPMENT_MODE: {settings.development_mode}")
    print(f"   BYPASS_EMAIL_COOLDOWN: {settings.bypass_email_cooldown}")
    print(f"   SMTP_SERVER: {settings.smtp_server}")
    print(f"   SMTP_USERNAME: {settings.smtp_username}")
    
    # Kiểm tra cooldown dictionary
    print(f"\n⏰ Active Cooldowns:")
    if notification_service.alert_cooldown:
        for key, last_time in notification_service.alert_cooldown.items():
            remaining = (datetime.utcnow() - last_time).total_seconds()
            print(f"   {key}: {remaining:.1f}s ago")
    else:
        print("   No active cooldowns")
    
    # Test data
    user_id = "debug_user"
    camera_id = "debug_camera"
    cooldown_key = f"{user_id}_{camera_id}_stranger_email"
    
    # Simulate stranger detection
    stranger_detections = [
        {
            "detection_type": "stranger",
            "person_name": "Unknown",
            "confidence": 0.95,
            "bbox": [100, 100, 200, 200],
            "timestamp": datetime.utcnow()
        }
    ]
    
    print(f"\n🧪 Testing Email Send:")
    print(f"   User ID: {user_id}")
    print(f"   Camera ID: {camera_id}")
    print(f"   Cooldown Key: {cooldown_key}")
    print(f"   Stranger Count: {len(stranger_detections)}")
    
    # Check current cooldown status
    last_alert_time = notification_service.alert_cooldown.get(cooldown_key)
    if last_alert_time:
        time_since = (datetime.utcnow() - last_alert_time).total_seconds()
        print(f"   Last Email: {time_since:.1f}s ago")
        
        # Calculate required cooldown
        basic_cooldown_seconds = 60
        if len(stranger_detections) >= 3:
            basic_cooldown_seconds = 30
        elif len(stranger_detections) == 1:
            basic_cooldown_seconds = 60
            
        print(f"   Required Cooldown: {basic_cooldown_seconds}s")
        
        if time_since < basic_cooldown_seconds:
            remaining = basic_cooldown_seconds - time_since
            print(f"   ❌ BLOCKED: {remaining:.1f}s remaining")
        else:
            print(f"   ✅ ALLOWED: Cooldown expired")
    else:
        print(f"   ✅ ALLOWED: No previous email")
    
    # Test bypass logic
    should_bypass = (
        settings.bypass_email_cooldown and settings.development_mode
    )
    print(f"   Bypass Logic: {should_bypass}")
    
    print(f"\n📋 Recommendation:")
    if settings.bypass_email_cooldown and settings.development_mode:
        print(f"   ⚠️  BYPASS is ENABLED - tất cả email sẽ được gửi!")
        print(f"   💡 Set BYPASS_EMAIL_COOLDOWN=false trong .env để bật cooldown")
    else:
        print(f"   ✅ Cooldown system is ACTIVE")
        if not last_alert_time:
            print(f"   💌 Next email will be sent immediately")
        else:
            basic_cooldown_seconds = 60 if len(stranger_detections) <= 2 else 30
            next_allowed = last_alert_time + timedelta(seconds=basic_cooldown_seconds)
            if datetime.utcnow() >= next_allowed:
                print(f"   💌 Next email can be sent NOW")
            else:
                wait_time = (next_allowed - datetime.utcnow()).total_seconds()
                print(f"   ⏰ Next email in {wait_time:.0f} seconds")

if __name__ == "__main__":
    asyncio.run(debug_email_cooldown())
