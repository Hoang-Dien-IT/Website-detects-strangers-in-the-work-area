#!/usr/bin/env python3
"""
Test lock mechanism để ngăn spam email
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

async def test_concurrent_emails():
    """Test nhiều email cùng lúc (should be blocked by lock)"""
    
    print("🧪 TESTING CONCURRENT EMAIL PREVENTION")
    print("=" * 50)
    
    user_id = "test_concurrent"
    camera_id = "cam_concurrent"
    
    # Clear any existing state
    cooldown_key = f"{user_id}_{camera_id}_stranger_email"
    if cooldown_key in notification_service.alert_cooldown:
        del notification_service.alert_cooldown[cooldown_key]
    
    # Mock stranger detection
    stranger_detections = [
        {
            "detection_type": "stranger", 
            "person_name": "Unknown",
            "confidence": 0.95,
            "bbox": [100, 100, 200, 200],
            "timestamp": datetime.utcnow()
        }
    ]
    
    print(f"🚀 Starting 5 concurrent email tasks...")
    
    # Create 5 concurrent email tasks (simulating race condition)
    tasks = []
    for i in range(5):
        task = asyncio.create_task(
            notification_service.send_stranger_alert_with_frame_analysis(
                user_id=user_id,
                camera_id=camera_id,
                all_detections=stranger_detections,
                image_data=None
            ),
            name=f"EmailTask-{i+1}"
        )
        tasks.append(task)
    
    # Start all tasks at roughly the same time
    start_time = time.time()
    
    results = await asyncio.gather(*tasks, return_exceptions=True)
    
    elapsed = time.time() - start_time
    
    print(f"\n⏱️ Total time: {elapsed:.2f}s")
    print(f"📊 Results:")
    
    success_count = 0
    error_count = 0
    
    for i, result in enumerate(results, 1):
        if isinstance(result, Exception):
            print(f"   Task {i}: Error - {result}")
            error_count += 1
        else:
            print(f"   Task {i}: Completed")
            success_count += 1
    
    print(f"\n🎯 EXPECTED RESULT:")
    print(f"   • Only 1 email should be processed (due to lock)")
    print(f"   • Other 4 should be skipped/blocked")
    print(f"   • No race condition should occur")
    
    print(f"\n📈 ACTUAL RESULT:")
    print(f"   • {success_count} tasks completed")
    print(f"   • {error_count} tasks errored")
    
    # Check cooldown state
    cooldown = notification_service.alert_cooldown.get(cooldown_key)
    if cooldown:
        elapsed = (datetime.utcnow() - cooldown).total_seconds()
        print(f"   • Cooldown set: {elapsed:.1f}s ago")
    else:
        print(f"   • No cooldown set")

if __name__ == "__main__":
    asyncio.run(test_concurrent_emails())
