#!/usr/bin/env python3
"""
Test cooldown đơn giản không cần database
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

async def test_cooldown_simple():
    """Test cooldown đơn giản"""
    
    print("🧪 SIMPLE COOLDOWN TEST")
    print("=" * 40)
    
    user_id = "test_simple"
    camera_id = "cam_simple"
    cooldown_key = f"{user_id}_{camera_id}_stranger_email"
    
    # Clear cooldown
    if cooldown_key in notification_service.alert_cooldown:
        del notification_service.alert_cooldown[cooldown_key]
    
    # Mock stranger detection (1 stranger = 60s cooldown)
    stranger_detections = [
        {
            "detection_type": "stranger",
            "person_name": "Unknown",
            "confidence": 0.95,
            "bbox": [100, 100, 200, 200],
            "timestamp": datetime.utcnow()
        }
    ]
    
    print(f"📧 Test 1: Lần đầu gửi email")
    await notification_service.send_stranger_alert_with_frame_analysis(
        user_id=user_id,
        camera_id=camera_id,
        all_detections=stranger_detections,
        image_data=None
    )
    
    # Check cooldown
    last_time = notification_service.alert_cooldown.get(cooldown_key)
    if last_time:
        print(f"✅ Cooldown được set: {last_time}")
    else:
        print(f"❌ Cooldown KHÔNG được set!")
    
    print(f"\n📧 Test 2: Gửi email ngay lập tức (should be blocked)")
    await notification_service.send_stranger_alert_with_frame_analysis(
        user_id=user_id,
        camera_id=camera_id,
        all_detections=stranger_detections,
        image_data=None
    )
    
    print(f"\n📊 Cooldown Status:")
    for key, last_time in notification_service.alert_cooldown.items():
        if 'test_simple' in key:
            elapsed = (datetime.utcnow() - last_time).total_seconds()
            print(f"   {key}: {elapsed:.1f}s ago")

if __name__ == "__main__":
    asyncio.run(test_cooldown_simple())
