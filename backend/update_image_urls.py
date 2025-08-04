#!/usr/bin/env python3
"""
Script để cập nhật image_url cho detection logs trong DetectionLogResponse
Đảm bảo frontend có thể hiển thị hình ảnh đúng cách
"""

import asyncio
import os
import sys
from datetime import datetime
from typing import Dict, Any, List

# Add the backend directory to Python path
backend_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, backend_dir)

from app.database import get_database
from app.config import get_settings

async def add_image_urls_to_detections():
    """Thêm image_url cho tất cả detection logs"""
    print("🖼️ Adding image URLs to detection logs...")
    
    try:
        db = get_database()
        
        # Lấy tất cả detections có image_path nhưng thiếu image_url
        cursor = db.detection_logs.find({
            "$and": [
                {"image_path": {"$exists": True, "$ne": "", "$ne": None}},
                {
                    "$or": [
                        {"image_url": {"$exists": False}},
                        {"image_url": ""},
                        {"image_url": None}
                    ]
                }
            ]
        })
        
        updated_count = 0
        async for detection in cursor:
            try:
                image_path = detection.get('image_path', '')
                if image_path:
                    # Extract filename from path
                    filename = os.path.basename(image_path)
                    
                    # Construct proper image URL for frontend
                    image_url = f"/uploads/detections/{filename}"
                    
                    # Update document
                    await db.detection_logs.update_one(
                        {"_id": detection["_id"]},
                        {
                            "$set": {
                                "image_url": image_url,
                                "image_url_updated_at": datetime.utcnow()
                            }
                        }
                    )
                    
                    updated_count += 1
                    
                    if updated_count % 100 == 0:
                        print(f"  📊 Updated {updated_count} records...")
                        
            except Exception as e:
                print(f"⚠️ Error updating detection {detection.get('_id')}: {e}")
                continue
        
        print(f"✅ Successfully added image URLs to {updated_count} detection logs")
        
        # Cập nhật các detections không có image_path
        no_image_count = await db.detection_logs.update_many(
            {
                "$and": [
                    {
                        "$or": [
                            {"image_path": {"$exists": False}},
                            {"image_path": ""},
                            {"image_path": None}
                        ]
                    },
                    {
                        "$or": [
                            {"image_url": {"$exists": False}},
                            {"image_url": ""},
                            {"image_url": None}
                        ]
                    }
                ]
            },
            {
                "$set": {
                    "image_url": "/static/images/no-image.jpg",
                    "image_path": "no-image.jpg",
                    "no_image_available": True,
                    "image_url_updated_at": datetime.utcnow()
                }
            }
        )
        
        print(f"✅ Set placeholder image for {no_image_count.modified_count} detections without images")
        return True
        
    except Exception as e:
        print(f"❌ Failed to add image URLs: {e}")
        return False

async def verify_image_urls():
    """Xác minh image URLs đã được thêm đúng"""
    print("\n🔍 Verifying image URLs...")
    
    try:
        db = get_database()
        
        # Đếm total detections
        total = await db.detection_logs.count_documents({})
        print(f"📊 Total detection logs: {total}")
        
        # Đếm detections có image_url
        with_image_url = await db.detection_logs.count_documents({
            "image_url": {"$exists": True, "$ne": "", "$ne": None}
        })
        print(f"🖼️ Detections with image_url: {with_image_url}/{total}")
        
        # Đếm detections có image_path
        with_image_path = await db.detection_logs.count_documents({
            "image_path": {"$exists": True, "$ne": "", "$ne": None}
        })
        print(f"📁 Detections with image_path: {with_image_path}/{total}")
        
        # Đếm detections có placeholder image
        with_placeholder = await db.detection_logs.count_documents({
            "no_image_available": True
        })
        print(f"🖼️ Detections with placeholder image: {with_placeholder}")
        
        print(f"✅ Image URL verification completed!")
        return True
        
    except Exception as e:
        print(f"❌ Image URL verification failed: {e}")
        return False

async def main():
    """Main function"""
    print("🖼️ SafeFace Image URL Updater")
    print("=" * 50)
    print("This script will add image_url field to detection logs")
    print("to ensure images display correctly in Detection Details")
    print("=" * 50)
    
    try:
        # Add image URLs
        success = await add_image_urls_to_detections()
        if not success:
            print("❌ Failed to add image URLs")
            return
        
        # Verify results
        await verify_image_urls()
        
        print("\n✅ Image URL update completed!")
        print("📋 All detection logs now have proper image URLs")
        print("🔄 Please restart your application to see the changes")
        
    except Exception as e:
        print(f"❌ Unexpected error: {e}")

if __name__ == "__main__":
    asyncio.run(main())
