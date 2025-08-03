#!/usr/bin/env python3
"""
Script để tạo camera test cho việc kiểm tra chức năng face capture
"""

import asyncio
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import connect_to_mongo, close_mongo_connection
from app.services.camera_service import camera_service
from app.models.camera import CameraCreate
from bson import ObjectId

async def create_test_camera():
    """Tạo camera test cho việc kiểm tra face capture"""
    try:
        # Kết nối database
        await connect_to_mongo()
        
        # Tạo camera test
        test_camera_data = CameraCreate(
            name="Test Webcam",
            description="Camera test cho face capture",
            location="Test Location",
            camera_type="webcam",
            camera_url="0",  # Webcam mặc định
            detection_enabled=True
        )
        
        # Sử dụng user ID test (thay đổi theo user thực tế)
        test_user_id = "507f1f77bcf86cd799439011"  # ObjectId test
        
        print("🔵 Creating test camera...")
        camera = await camera_service.create_camera(test_user_id, test_camera_data)
        
        print(f"✅ Test camera created successfully:")
        print(f"   ID: {camera.id}")
        print(f"   Name: {camera.name}")
        print(f"   Type: {camera.camera_type}")
        print(f"   URL: {camera.camera_url}")
        print(f"   Active: {camera.is_active}")
        
        return camera
        
    except Exception as e:
        print(f"❌ Error creating test camera: {e}")
        return None
    finally:
        await close_mongo_connection()

async def list_user_cameras(user_id: str):
    """Liệt kê camera của user"""
    try:
        await connect_to_mongo()
        
        print(f"🔵 Getting cameras for user: {user_id}")
        cameras = await camera_service.get_user_cameras(user_id)
        
        print(f"✅ Found {len(cameras)} cameras:")
        for camera in cameras:
            print(f"   - {camera.name} (ID: {camera.id}, Type: {camera.camera_type}, Active: {camera.is_active})")
        
        return cameras
        
    except Exception as e:
        print(f"❌ Error listing cameras: {e}")
        return []
    finally:
        await close_mongo_connection()

async def test_camera_connection(camera_id: str, user_id: str):
    """Test kết nối camera"""
    try:
        await connect_to_mongo()
        
        print(f"🔵 Testing camera connection: {camera_id}")
        result = await camera_service.test_camera_detailed(camera_id, user_id)
        
        print(f"✅ Test result: {result}")
        return result
        
    except Exception as e:
        print(f"❌ Error testing camera: {e}")
        return None
    finally:
        await close_mongo_connection()

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Camera test setup")
    parser.add_argument("--action", choices=["create", "list", "test"], default="create", 
                       help="Action to perform")
    parser.add_argument("--user-id", default="507f1f77bcf86cd799439011",
                       help="User ID to work with")
    parser.add_argument("--camera-id", help="Camera ID for testing")
    
    args = parser.parse_args()
    
    if args.action == "create":
        asyncio.run(create_test_camera())
    elif args.action == "list":
        asyncio.run(list_user_cameras(args.user_id))
    elif args.action == "test":
        if not args.camera_id:
            print("❌ Camera ID required for testing")
            sys.exit(1)
        asyncio.run(test_camera_connection(args.camera_id, args.user_id)) 