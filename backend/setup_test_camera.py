#!/usr/bin/env python3
"""
Script đơn giản để setup camera test cho face capture
"""

import asyncio
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import connect_to_mongo, close_mongo_connection
from app.services.camera_service import camera_service
from app.models.camera import CameraCreate
from bson import ObjectId

async def setup_test_camera():
    """Setup camera test cho face capture"""
    try:
        # Kết nối database
        await connect_to_mongo()
        
        # User ID test (thay đổi theo user thực tế trong hệ thống)
        test_user_id = "507f1f77bcf86cd799439011"
        
        # Kiểm tra xem đã có camera nào chưa
        existing_cameras = await camera_service.get_user_cameras(test_user_id)
        
        if existing_cameras:
            print(f"✅ Found {len(existing_cameras)} existing cameras:")
            for camera in existing_cameras:
                print(f"   - {camera.name} (ID: {camera.id}, Type: {camera.camera_type}, Active: {camera.is_active})")
            return existing_cameras[0]  # Trả về camera đầu tiên
        
        # Tạo camera test nếu chưa có
        print("🔵 No cameras found, creating test camera...")
        
        test_camera_data = CameraCreate(
            name="Test Webcam",
            description="Camera test cho face capture",
            location="Test Location",
            camera_type="webcam",
            camera_url="0",  # Webcam mặc định
            detection_enabled=True
        )
        
        camera = await camera_service.create_camera(test_user_id, test_camera_data)
        
        print(f"✅ Test camera created successfully:")
        print(f"   ID: {camera.id}")
        print(f"   Name: {camera.name}")
        print(f"   Type: {camera.camera_type}")
        print(f"   URL: {camera.camera_url}")
        print(f"   Active: {camera.is_active}")
        
        return camera
        
    except Exception as e:
        print(f"❌ Error setting up test camera: {e}")
        return None
    finally:
        await close_mongo_connection()

if __name__ == "__main__":
    asyncio.run(setup_test_camera()) 