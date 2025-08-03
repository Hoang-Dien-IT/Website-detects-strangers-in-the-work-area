#!/usr/bin/env python3
"""
Check user email in database
"""

import asyncio
import os
import sys
from datetime import datetime

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import get_database
from app.config import get_settings
from bson import ObjectId

async def check_user_email():
    """Check if user exists and has email"""
    print("🔍 Checking user email in database...")
    
    try:
        db = get_database()
        settings = get_settings()
        
        # Find user by email
        target_email = settings.smtp_username
        user = await db.users.find_one({"email": target_email})
        
        if user:
            print(f"✅ User found in database:")
            print(f"   - ID: {user['_id']}")
            print(f"   - Email: {user.get('email', 'NO EMAIL')}")
            print(f"   - Username: {user.get('username', 'NO USERNAME')}")
            print(f"   - Full name: {user.get('full_name', 'NO NAME')}")
            print(f"   - Created: {user.get('created_at', 'NO DATE')}")
            return str(user['_id'])
        else:
            print(f"❌ User with email {target_email} not found in database")
            
            # List all users
            users = await db.users.find().to_list(10)
            print(f"\n📋 Available users in database:")
            for u in users:
                print(f"   - {u.get('email', 'NO EMAIL')} (ID: {u['_id']})")
                
            return None
            
    except Exception as e:
        print(f"❌ Error checking database: {e}")
        return None

async def create_test_user():
    """Create test user if not exists"""
    print("🚀 Creating test user...")
    
    try:
        db = get_database()
        settings = get_settings()
        
        # Create test user
        test_user = {
            "email": settings.smtp_username,
            "username": "test_user",
            "full_name": "Test User",
            "password_hash": "dummy_hash",  # Not used for email test
            "is_active": True,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        result = await db.users.insert_one(test_user)
        print(f"✅ Test user created with ID: {result.inserted_id}")
        return str(result.inserted_id)
        
    except Exception as e:
        print(f"❌ Error creating test user: {e}")
        return None

async def main():
    """Main function"""
    print("🔍 Database User Email Check")
    print("=" * 40)
    
    user_id = await check_user_email()
    
    if not user_id:
        print("\n🚀 Creating test user for email testing...")
        user_id = await create_test_user()
    
    if user_id:
        print(f"\n✅ User ready for email testing: {user_id}")
    else:
        print(f"\n❌ Could not prepare user for email testing")

if __name__ == "__main__":
    asyncio.run(main())
