#!/usr/bin/env python3
"""
Test script để kiểm tra face recognition system
"""
import asyncio
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import get_database
from app.services.face_processor import face_processor
from app.services.stream_processor import stream_processor

async def test_known_persons():
    """Test loading known persons from database"""
    try:
        print("🔵 Testing known persons loading...")
        
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

async def main():
    """Main test function"""
    print("🚀 Starting Face Recognition System Test\n")
    
    await test_known_persons()
    await test_face_detection()
    
    print("\n✅ Test completed!")

if __name__ == "__main__":
    asyncio.run(main())
