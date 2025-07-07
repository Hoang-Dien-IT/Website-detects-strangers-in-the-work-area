#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Test script để kiểm tra face recognition system với hỗ trợ tiếng Việt
"""
import asyncio
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import get_database
from app.services.face_processor import face_processor
from app.services.stream_processor import stream_processor

async def test_vietnamese_support():
    """Test Vietnamese text support"""
    try:
        print("🔵 Testing Vietnamese text support...")
        
        # Test Vietnamese names
        vietnamese_names = ["Hoàng Nguyên", "Trần Thị Lan", "Nguyễn Văn Minh", "Phạm Thị Hương"]
        
        for name in vietnamese_names:
            print(f"✅ Vietnamese name test: {name}")
            # Test encoding
            encoded = name.encode('utf-8')
            decoded = encoded.decode('utf-8')
            assert name == decoded, f"Encoding test failed for {name}"
        
        print("✅ Vietnamese text encoding/decoding successful!")
        
    except Exception as e:
        print(f"❌ Error in Vietnamese support test: {e}")

async def test_known_persons():
    """Test loading known persons from database"""
    try:
        print("\n🔵 Testing known persons loading...")
        
        db = get_database()
        
        # Count total persons
        total_persons = await db.known_persons.count_documents({})
        print(f"📊 Total persons in database: {total_persons}")
        
        # Count active persons
        active_persons = await db.known_persons.count_documents({"is_active": True})
        print(f"📊 Active persons in database: {active_persons}")
        
        # List all persons with embeddings info
        print("\n📋 Person details:")
        async for person_data in db.known_persons.find({"is_active": True}):
            name = person_data.get('name', 'Unknown')
            face_images = person_data.get('face_images', [])
            face_embeddings = person_data.get('face_embeddings', [])
            
            print(f"  👤 {name}:")
            print(f"    - Face images: {len(face_images)}")
            print(f"    - Face embeddings: {len(face_embeddings)}")
            
            # Check embedding quality
            valid_embeddings = 0
            for emb in face_embeddings:
                if isinstance(emb, list) and len(emb) > 0:
                    valid_embeddings += 1
                elif isinstance(emb, str) and emb:
                    valid_embeddings += 1
            
            print(f"    - Valid embeddings: {valid_embeddings}")
        
        # Test stream processor method
        print("\n🔧 Testing stream processor method...")
        known_persons = await stream_processor._get_known_persons_for_camera("test_camera")
        print(f"✅ Stream processor loaded {len(known_persons)} known persons")
        
        for person in known_persons:
            print(f"  👤 {person['name']}: {len(person['embeddings'])} embeddings")
        
    except Exception as e:
        print(f"❌ Error in test: {e}")
        import traceback
        traceback.print_exc()

async def test_face_detection():
    """Test face detection với một ảnh test"""
    try:
        print("\n🔵 Testing face detection...")
        
        # Tạo một frame test (dummy)
        import numpy as np
        import cv2
        
        # Tạo frame test với kích thước 640x480
        test_frame = np.zeros((480, 640, 3), dtype=np.uint8)
        cv2.putText(test_frame, "Test Frame", (200, 240), cv2.FONT_HERSHEY_SIMPLEX, 2, (255, 255, 255), 3)
        
        # Test face detection
        detections = await face_processor.detect_faces_in_frame(test_frame)
        print(f"✅ Face detection completed: {len(detections)} faces detected")
        
        # Test với known persons
        known_persons = await stream_processor._get_known_persons_for_camera("test_camera")
        detections_with_recognition = await face_processor.detect_and_recognize_faces(test_frame, known_persons)
        print(f"✅ Face recognition completed: {len(detections_with_recognition)} faces processed")
        
    except Exception as e:
        print(f"❌ Error in face detection test: {e}")
        import traceback
        traceback.print_exc()

async def test_vietnamese_text_rendering():
    """Test Vietnamese text rendering với PIL"""
    try:
        print("\n🔵 Testing Vietnamese text rendering...")
        
        # Test stream processor Vietnamese method
        import numpy as np
        test_frame = np.zeros((480, 640, 3), dtype=np.uint8)
        
        # Test rendering Vietnamese text
        vietnamese_text = "Hoàng Nguyên (0.95)"
        
        # This should not crash
        result_frame = stream_processor._put_vietnamese_text(
            test_frame, vietnamese_text, (50, 50), 
            font_size=20, color=(0, 255, 0)
        )
        
        print(f"✅ Vietnamese text rendering successful: '{vietnamese_text}'")
        
    except Exception as e:
        print(f"❌ Error in Vietnamese text rendering: {e}")
        import traceback
        traceback.print_exc()

async def main():
    """Main test function"""
    print("🚀 Starting Face Recognition System Test với hỗ trợ tiếng Việt\n")
    
    await test_vietnamese_support()
    await test_known_persons()
    await test_face_detection()
    await test_vietnamese_text_rendering()
    
    print("\n✅ Test completed!")

if __name__ == "__main__":
    asyncio.run(main())
