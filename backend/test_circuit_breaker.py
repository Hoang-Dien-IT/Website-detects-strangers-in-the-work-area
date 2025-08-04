#!/usr/bin/env python3
"""
Test circuit breaker cho SMTP failures
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

async def test_circuit_breaker():
    """Test circuit breaker khi SMTP fail liên tục"""
    
    print("🧪 TESTING SMTP CIRCUIT BREAKER")
    print("=" * 50)
    print(f"⚙️ Circuit Breaker Settings:")
    print(f"   Max failures: {notification_service.max_failures}")
    print(f"   Block duration: {notification_service.block_duration_minutes} minutes")
    print(f"   SMTP timeout: 10 seconds")
    print()
    
    user_id = "test_circuit"
    camera_id = "cam_circuit"
    
    # Clear any existing state
    cooldown_key = f"{user_id}_{camera_id}_stranger_email"
    block_key = f"{user_id}_smtp_block"
    
    if cooldown_key in notification_service.alert_cooldown:
        del notification_service.alert_cooldown[cooldown_key]
    if block_key in notification_service.smtp_failures:
        del notification_service.smtp_failures[block_key]
    if block_key in notification_service.smtp_blocked_until:
        del notification_service.smtp_blocked_until[block_key]
    
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
    
    # Test multiple email attempts (will likely fail due to SMTP timeout)
    for i in range(5):
        print(f"\n📧 Attempt {i+1}: Sending email (will likely timeout)")
        
        start_time = time.time()
        
        await notification_service.send_stranger_alert_with_frame_analysis(
            user_id=user_id,
            camera_id=camera_id,
            all_detections=stranger_detections,
            image_data=None
        )
        
        elapsed = time.time() - start_time
        print(f"   ⏱️ Time taken: {elapsed:.1f}s")
        
        # Check circuit breaker status
        failures = notification_service.smtp_failures.get(block_key, 0)
        blocked_until = notification_service.smtp_blocked_until.get(block_key)
        
        print(f"   📊 Failures: {failures}/{notification_service.max_failures}")
        
        if blocked_until:
            remaining = (blocked_until - datetime.utcnow()).total_seconds()
            if remaining > 0:
                print(f"   🚫 BLOCKED for {remaining:.0f}s more")
                break
            else:
                print(f"   ✅ Block expired")
        
        # Short delay between attempts
        if i < 4:  # Don't wait after last attempt
            time.sleep(1)
    
    print(f"\n🎯 TEST COMPLETED")
    print(f"📊 Final State:")
    print(f"   Failures: {notification_service.smtp_failures.get(block_key, 0)}")
    
    blocked_until = notification_service.smtp_blocked_until.get(block_key)
    if blocked_until:
        remaining = (blocked_until - datetime.utcnow()).total_seconds()
        print(f"   Block: {remaining:.0f}s remaining" if remaining > 0 else "   Block: Expired")
    else:
        print(f"   Block: None")

if __name__ == "__main__":
    asyncio.run(test_circuit_breaker())
