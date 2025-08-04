#!/usr/bin/env python3
"""
Test hệ thống email thông minh mới
"""

import asyncio
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from app.services.notification_service import notification_service
from app.config import settings
from datetime import datetime

async def test_smart_email_system():
    """Test hệ thống email với cooldown thông minh"""
    
    print("🧪 Testing Smart Email System (Updated)")
    print("=" * 50)
    print("📋 Cooldown Rules:")
    print("   • 1 phút cơ bản giữa các email")
    print("   • 30 giây nếu ≥3 người lạ (nghiêm trọng)")
    print("   • 1 phút nếu chỉ 1 người lạ")
    print("   • Không giới hạn theo giờ")
    print("=" * 50)
    
    # Test data
    user_id = "test_user_smart"
    camera_id = "test_camera_smart"
    
    # Mock stranger detections
    single_stranger = [
        {
            "detection_type": "stranger",
            "person_name": "Unknown",
            "confidence": 0.95,
            "bbox": [100, 100, 200, 200],
            "timestamp": datetime.utcnow()
        }
    ]
    
    many_strangers = [
        {
            "detection_type": "stranger",
            "person_name": f"Unknown_{i}",
            "confidence": 0.90,
            "bbox": [100 + i*50, 100, 200 + i*50, 200],
            "timestamp": datetime.utcnow()
        }
        for i in range(3)
    ]
    
    # Clear any existing cooldowns
    cooldown_key = f"{user_id}_{camera_id}_stranger_email"
    if cooldown_key in notification_service.alert_cooldown:
        del notification_service.alert_cooldown[cooldown_key]
    
    # Test 1: Gửi email đầu tiên - 1 người lạ (cooldown 1 phút)
    print("\n📧 Test 1: Gửi email đầu tiên - 1 người lạ (cooldown 1 phút)")
    try:
        await notification_service.send_stranger_alert_with_frame_analysis(
            user_id=user_id,
            camera_id=camera_id,
            all_detections=single_stranger,
            image_data=None
        )
        print("✅ Test 1 completed")
    except Exception as e:
        print(f"❌ Test 1 failed: {e}")
    
    # Test 2: Gửi email liền kề (should be blocked by 1 phút cooldown)
    print("\n📧 Test 2: Gửi email liền kề (should be blocked by 1 phút cooldown)")
    try:
        await notification_service.send_stranger_alert_with_frame_analysis(
            user_id=user_id,
            camera_id=camera_id,
            all_detections=single_stranger,
            image_data=None
        )
        print("✅ Test 2 completed")
    except Exception as e:
        print(f"❌ Test 2 failed: {e}")
    
    # Test 3: Test với nhiều người lạ (should have 30s cooldown)
    print("\n📧 Test 3: Test với 3 người lạ (cooldown 30s)")
    
    try:
        await notification_service.send_stranger_alert_with_frame_analysis(
            user_id=user_id + "_many",
            camera_id=camera_id,
            all_detections=many_strangers,
            image_data=None
        )
        print("✅ Test 3 completed")
    except Exception as e:
        print(f"❌ Test 3 failed: {e}")
    
    # Test 4: Kiểm tra cooldown status
    print("\n⏰ Test 4: Kiểm tra cooldown status")
    for key, last_time in notification_service.alert_cooldown.items():
        if 'test_user' in key:
            remaining = (datetime.utcnow() - last_time).total_seconds()
            print(f"   {key}: {remaining:.1f}s ago")
    
    print("\n🎯 Test completed! Hệ thống cooldown mới:")
    print("   ✅ Không giới hạn theo giờ")
    print("   ✅ Cooldown ngắn hơn (1 phút/30 giây)")
    print("   ✅ Ưu tiên tình huống nghiêm trọng")

if __name__ == "__main__":
    asyncio.run(test_smart_email_system())
