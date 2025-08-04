#!/usr/bin/env python3
"""
Test anti-spam email system với debugging chi tiết
"""

import asyncio
import sys
import os
import time
from datetime import datetime
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from app.services.notification_service import notification_service
from app.config import get_settings

settings = get_settings()

async def test_anti_spam_email():
    """Test hệ thống chống spam email"""
    
    print("🧪 TESTING ANTI-SPAM EMAIL SYSTEM")
    print("=" * 60)
    
    # Kiểm tra settings
    print(f"⚙️ Current Settings:")
    print(f"   DEVELOPMENT_MODE: {settings.development_mode}")
    print(f"   BYPASS_EMAIL_COOLDOWN: {settings.bypass_email_cooldown}")
    print(f"   Should bypass: {settings.bypass_email_cooldown and settings.development_mode}")
    print()
    
    # Test data
    user_id = "test_anti_spam"
    camera_id = "camera_spam_test"
    
    # Clear existing cooldowns
    cooldown_key = f"{user_id}_{camera_id}_stranger_email"
    if cooldown_key in notification_service.alert_cooldown:
        del notification_service.alert_cooldown[cooldown_key]
        print(f"🧹 Cleared existing cooldown for {cooldown_key}")
    
    # Mock detections
    single_stranger = [
        {
            "detection_type": "stranger",
            "person_name": "Unknown",
            "confidence": 0.95,
            "bbox": [100, 100, 200, 200],
            "timestamp": datetime.utcnow()
        }
    ]
    
    multiple_strangers = [
        {
            "detection_type": "stranger",
            "person_name": f"Unknown_{i}",
            "confidence": 0.90,
            "bbox": [100 + i*50, 100, 200 + i*50, 200],
            "timestamp": datetime.utcnow()
        }
        for i in range(3)
    ]
    
    print(f"📧 Test 1: Gửi email đầu tiên (1 stranger - 60s cooldown)")
    try:
        await notification_service.send_stranger_alert_with_frame_analysis(
            user_id=user_id,
            camera_id=camera_id,
            all_detections=single_stranger,
            image_data=None
        )
        print(f"✅ Test 1 hoàn thành")
    except Exception as e:
        print(f"❌ Test 1 lỗi: {e}")
    
    print(f"\n⏰ Waiting 2 seconds...")
    time.sleep(2)
    
    print(f"\n📧 Test 2: Gửi email thứ 2 ngay lập tức (should be blocked)")
    try:
        await notification_service.send_stranger_alert_with_frame_analysis(
            user_id=user_id,
            camera_id=camera_id,
            all_detections=single_stranger,
            image_data=None
        )
        print(f"✅ Test 2 hoàn thành")
    except Exception as e:
        print(f"❌ Test 2 lỗi: {e}")
    
    print(f"\n📧 Test 3: Gửi email với nhiều stranger (30s cooldown)")
    try:
        await notification_service.send_stranger_alert_with_frame_analysis(
            user_id=user_id + "_multi",
            camera_id=camera_id,
            all_detections=multiple_strangers,
            image_data=None
        )
        print(f"✅ Test 3 hoàn thành")
    except Exception as e:
        print(f"❌ Test 3 lỗi: {e}")
    
    print(f"\n⏰ Waiting 2 seconds...")
    time.sleep(2)
    
    print(f"\n📧 Test 4: Gửi email nhiều stranger lần 2 (should be blocked)")
    try:
        await notification_service.send_stranger_alert_with_frame_analysis(
            user_id=user_id + "_multi",
            camera_id=camera_id,
            all_detections=multiple_strangers,
            image_data=None
        )
        print(f"✅ Test 4 hoàn thành")
    except Exception as e:
        print(f"❌ Test 4 lỗi: {e}")
    
    # Hiển thị cooldown status
    print(f"\n📊 Current Cooldown Status:")
    for key, last_time in notification_service.alert_cooldown.items():
        if 'test_anti_spam' in key:
            elapsed = (datetime.utcnow() - last_time).total_seconds()
            print(f"   {key}: {elapsed:.1f}s ago")
    
    print(f"\n🎯 KẾT LUẬN:")
    print(f"   • Test 1: Email đầu tiên → SHOULD SEND")
    print(f"   • Test 2: Email 2s sau → SHOULD BE BLOCKED (60s cooldown)")  
    print(f"   • Test 3: Email nhiều stranger → SHOULD SEND")
    print(f"   • Test 4: Email 2s sau → SHOULD BE BLOCKED (30s cooldown)")
    print(f"\n   Nếu vẫn spam = BYPASS_EMAIL_COOLDOWN=true hoặc logic sai!")

if __name__ == "__main__":
    asyncio.run(test_anti_spam_email())
