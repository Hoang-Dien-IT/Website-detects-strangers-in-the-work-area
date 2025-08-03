#!/usr/bin/env python3
"""
Script để reset email cooldown cho test
"""

import asyncio
import sys
import os

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.services.notification_service import notification_service

async def reset_email_cooldown():
    """Reset tất cả email cooldown"""
    print("🔄 Resetting email cooldown...")
    
    # Clear all cooldown
    notification_service.alert_cooldown.clear()
    
    print("✅ Email cooldown reset successfully!")
    print("📧 Next stranger detection will trigger email immediately")

if __name__ == "__main__":
    asyncio.run(reset_email_cooldown())
