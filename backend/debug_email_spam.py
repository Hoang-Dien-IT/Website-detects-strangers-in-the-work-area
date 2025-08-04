#!/usr/bin/env python3
"""
Debug script để kiểm tra tại sao email vẫn spam liên tục
"""

import asyncio
import sys
import os
from datetime import datetime, timedelta
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from app.services.notification_service import notification_service
from app.config import settings

async def debug_email_spam():
    """Debug tại sao email vẫn spam"""
    
    print("🔍 DEBUG EMAIL SPAM ISSUE")
    print("=" * 60)
    
    # 1. Kiểm tra settings
    print("📋 1. Kiểm tra settings:")
    print(f"   DEVELOPMENT_MODE: {settings.development_mode}")
    print(f"   BYPASS_EMAIL_COOLDOWN: {settings.bypass_email_cooldown}")
    print(f"   SMTP_SERVER: {settings.smtp_server}")
    print(f"   SMTP_USERNAME: {settings.smtp_username}")
    
    # 2. Kiểm tra cooldown dictionary
    print(f"\n📋 2. Cooldown dictionary hiện tại:")
    if notification_service.alert_cooldown:
        for key, last_time in notification_service.alert_cooldown.items():
            time_diff = datetime.utcnow() - last_time
            print(f"   {key}: {time_diff.total_seconds():.1f}s ago")
    else:
        print("   Không có cooldown nào")
    
    # 3. Test logic cooldown
    print(f"\n📋 3. Test cooldown logic:")
    user_id = "debug_user"
    camera_id = "debug_camera"
    cooldown_key = f"{user_id}_{camera_id}_stranger_email"
    
    # Simulate detection với 1 người lạ
    stranger_detections = [{"detection_type": "stranger", "person_name": "Unknown"}]
    
    current_time = datetime.utcnow()
    last_alert_time = notification_service.alert_cooldown.get(cooldown_key)
    basic_cooldown_seconds = 60  # 1 phút cho 1 người lạ
    
    # Logic tương tự như trong notification_service
    should_bypass_cooldown = (
        settings.bypass_email_cooldown and settings.development_mode
    )
    
    print(f"   should_bypass_cooldown: {should_bypass_cooldown}")
    print(f"   last_alert_time: {last_alert_time}")
    print(f"   basic_cooldown_seconds: {basic_cooldown_seconds}")
    
    if last_alert_time:
        time_since_last = current_time - last_alert_time
        print(f"   time_since_last: {time_since_last.total_seconds():.1f}s")
        print(f"   cooldown_remaining: {max(0, basic_cooldown_seconds - time_since_last.total_seconds()):.1f}s")
    
    # 4. Tạo mock cooldown và test
    print(f"\n📋 4. Test với mock cooldown:")
    notification_service.alert_cooldown[cooldown_key] = datetime.utcnow()
    print(f"   Đã set cooldown cho {cooldown_key}")
    
    # Simulate email send attempt
    current_time = datetime.utcnow()
    last_alert_time = notification_service.alert_cooldown.get(cooldown_key)
    
    should_bypass = settings.bypass_email_cooldown and settings.development_mode
    
    if not should_bypass:
        if last_alert_time and (current_time - last_alert_time < timedelta(seconds=basic_cooldown_seconds)):
            remaining_time = timedelta(seconds=basic_cooldown_seconds) - (current_time - last_alert_time)
            print(f"   ✅ COOLDOWN HOẠT ĐỘNG: Chờ {remaining_time.total_seconds():.0f}s nữa")
        else:
            print(f"   ❌ COOLDOWN KHÔNG HOẠT ĐỘNG: Email sẽ được gửi")
    else:
        print(f"   ⚠️ BYPASS ACTIVE: Cooldown bị bỏ qua")
    
    # 5. Kiểm tra các detection logs gần đây
    print(f"\n📋 5. Kiểm tra detection trong stream processor:")
    print("   Cần kiểm tra xem có phải do stream processor gọi quá nhiều lần không")
    
    print("\n🎯 TỔNG KẾT:")
    print(f"   - Settings bypass: {should_bypass}")
    print(f"   - Cooldown dictionary size: {len(notification_service.alert_cooldown)}")
    print(f"   - Nếu vẫn spam → Kiểm tra stream_processor gọi notification quá nhiều")

if __name__ == "__main__":
    asyncio.run(debug_email_spam())
