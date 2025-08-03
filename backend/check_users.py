#!/usr/bin/env python3
"""
Script để kiểm tra users trong hệ thống
"""

import asyncio
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import connect_to_mongo, close_mongo_connection, get_database
from bson import ObjectId

async def check_users():
    """Kiểm tra users trong hệ thống"""
    try:
        # Kết nối database
        await connect_to_mongo()
        db = get_database()
        
        # Lấy danh sách users
        users = []
        async for user in db.users.find({}):
            users.append({
                'id': str(user['_id']),
                'email': user.get('email', 'No email'),
                'username': user.get('username', 'No username'),
                'is_active': user.get('is_active', False),
                'role': user.get('role', 'user')
            })
        
        print(f"✅ Found {len(users)} users in system:")
        for user in users:
            print(f"   - ID: {user['id']}")
            print(f"     Email: {user['email']}")
            print(f"     Username: {user['username']}")
            print(f"     Active: {user['is_active']}")
            print(f"     Role: {user['role']}")
            print()
        
        if users:
            print(f"🔵 Use the first user ID for testing: {users[0]['id']}")
        
        return users
        
    except Exception as e:
        print(f"❌ Error checking users: {e}")
        return []
    finally:
        await close_mongo_connection()

async def check_cameras():
    """Kiểm tra cameras trong hệ thống"""
    try:
        # Kết nối database
        await connect_to_mongo()
        db = get_database()
        
        # Lấy danh sách cameras
        cameras = []
        async for camera in db.cameras.find({}):
            cameras.append({
                'id': str(camera['_id']),
                'name': camera.get('name', 'No name'),
                'user_id': str(camera.get('user_id', 'No user')),
                'camera_type': camera.get('camera_type', 'unknown'),
                'is_active': camera.get('is_active', False)
            })
        
        print(f"✅ Found {len(cameras)} cameras in system:")
        for camera in cameras:
            print(f"   - ID: {camera['id']}")
            print(f"     Name: {camera['name']}")
            print(f"     User ID: {camera['user_id']}")
            print(f"     Type: {camera['camera_type']}")
            print(f"     Active: {camera['is_active']}")
            print()
        
        return cameras
        
    except Exception as e:
        print(f"❌ Error checking cameras: {e}")
        return []
    finally:
        await close_mongo_connection()

if __name__ == "__main__":
    print("🔵 Checking users...")
    asyncio.run(check_users())
    
    print("\n🔵 Checking cameras...")
    asyncio.run(check_cameras()) 