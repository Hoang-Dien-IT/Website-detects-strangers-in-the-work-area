#!/usr/bin/env python3
"""
Script tổng hợp để setup và test face capture feature
"""

import asyncio
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import connect_to_mongo, close_mongo_connection, get_database
from app.services.camera_service import camera_service
from app.models.camera import CameraCreate
from bson import ObjectId

async def setup_face_capture():
    """Setup và test face capture feature"""
    try:
        print("🔵 Setting up face capture feature...")
        
        # Kết nối database
        await connect_to_mongo()
        db = get_database()
        
        # 1. Kiểm tra users
        print("\n1. Checking users...")
        users = []
        async for user in db.users.find({}):
            users.append({
                'id': str(user['_id']),
                'email': user.get('email', 'No email'),
                'username': user.get('username', 'No username'),
                'is_active': user.get('is_active', False),
                'role': user.get('role', 'user')
            })
        
        if not users:
            print("❌ No users found in system. Please create a user first.")
            return False
        
        print(f"✅ Found {len(users)} users")
        test_user = users[0]
        print(f"🔵 Using user: {test_user['email']} (ID: {test_user['id']})")
        
        # 2. Kiểm tra cameras
        print("\n2. Checking cameras...")
        existing_cameras = await camera_service.get_user_cameras(test_user['id'])
        
        if existing_cameras:
            print(f"✅ Found {len(existing_cameras)} existing cameras:")
            for camera in existing_cameras:
                print(f"   - {camera.name} (ID: {camera.id}, Type: {camera.camera_type}, Active: {camera.is_active})")
        else:
            print("🔵 No cameras found, creating test camera...")
            
            # Tạo camera test
            test_camera_data = CameraCreate(
                name="Test Webcam",
                description="Camera test cho face capture",
                location="Test Location",
                camera_type="webcam",
                camera_url="0",  # Webcam mặc định
                detection_enabled=True
            )
            
            camera = await camera_service.create_camera(test_user['id'], test_camera_data)
            print(f"✅ Test camera created: {camera.name} (ID: {camera.id})")
            existing_cameras = [camera]
        
        # 3. Test camera connection
        print("\n3. Testing camera connections...")
        for camera in existing_cameras:
            print(f"🔵 Testing camera: {camera.name}")
            try:
                test_result = await camera_service.test_camera_detailed(camera.id, test_user['id'])
                print(f"   Status: {test_result.get('status', 'unknown')}")
                print(f"   Message: {test_result.get('message', 'No message')}")
            except Exception as e:
                print(f"   ❌ Test failed: {e}")
        
        # 4. Test available cameras endpoint
        print("\n4. Testing available cameras endpoint...")
        try:
            # Simulate the endpoint logic
            available_cameras = []
            for camera in existing_cameras:
                if camera.is_active:
                    if camera.camera_type == "webcam":
                        available_cameras.append({
                            'id': camera.id,
                            'name': camera.name,
                            'camera_type': camera.camera_type,
                            'location': camera.location,
                            'description': camera.description
                        })
                        print(f"   ✅ {camera.name} - Webcam (no connection test needed)")
                    else:
                        try:
                            test_result = await camera_service.test_camera_detailed(camera.id, test_user['id'])
                            if test_result.get('status') == 'success':
                                available_cameras.append({
                                    'id': camera.id,
                                    'name': camera.name,
                                    'camera_type': camera.camera_type,
                                    'location': camera.location,
                                    'description': camera.description
                                })
                                print(f"   ✅ {camera.name} - Connection test passed")
                            else:
                                print(f"   ⚠️ {camera.name} - Connection test failed")
                        except Exception as e:
                            print(f"   ❌ {camera.name} - Test error: {e}")
            
            print(f"\n✅ Total available cameras for face capture: {len(available_cameras)}")
            
        except Exception as e:
            print(f"❌ Error testing available cameras: {e}")
        
        # 5. Summary
        print("\n5. Setup Summary:")
        print(f"   Users: {len(users)}")
        print(f"   Cameras: {len(existing_cameras)}")
        print(f"   Available for face capture: {len(available_cameras)}")
        
        if len(available_cameras) > 0:
            print("\n✅ Face capture feature is ready!")
            print("🔵 Next steps:")
            print("   1. Start backend server: python -m uvicorn app.main:app --reload")
            print("   2. Start frontend: npm start")
            print("   3. Login and test face capture feature")
        else:
            print("\n❌ No cameras available for face capture")
            print("🔵 Please check camera setup and try again")
        
        return len(available_cameras) > 0
        
    except Exception as e:
        print(f"❌ Error setting up face capture: {e}")
        return False
    finally:
        await close_mongo_connection()

if __name__ == "__main__":
    success = asyncio.run(setup_face_capture())
    if success:
        print("\n🎉 Setup completed successfully!")
    else:
        print("\n💥 Setup failed. Please check the errors above.")
        sys.exit(1) 