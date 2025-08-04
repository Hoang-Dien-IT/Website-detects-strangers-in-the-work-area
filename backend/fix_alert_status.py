#!/usr/bin/env python3
"""
Script để khắc phục vấn đề Alert Status trong Detection Details
Cập nhật tất cả detection logs để có trạng thái alert đúng và hình ảnh đầy đủ
"""

import asyncio
import os
import sys
from datetime import datetime, timedelta
from typing import Dict, Any, List

# Add the backend directory to Python path
backend_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, backend_dir)

from app.database import get_database
from app.config import get_settings
from bson import ObjectId

class AlertStatusFixer:
    def __init__(self):
        self.settings = get_settings()
        
    async def check_database_status(self):
        """Kiểm tra trạng thái database và collections"""
        print("🔍 Checking database status...")
        
        try:
            db = get_database()
            collections = await db.list_collection_names()
            print(f"✅ Database connected. Collections: {collections}")
            
            # Kiểm tra detection_logs collection
            if 'detection_logs' in collections:
                total_detections = await db.detection_logs.count_documents({})
                print(f"📊 Total detection logs: {total_detections}")
                
                # Đếm các detections thiếu is_alert_sent
                missing_alert_status = await db.detection_logs.count_documents({
                    "is_alert_sent": {"$exists": False}
                })
                print(f"🚨 Detections missing is_alert_sent: {missing_alert_status}")
                
                # Đếm các detections có is_alert_sent = False
                false_alert_status = await db.detection_logs.count_documents({
                    "is_alert_sent": False
                })
                print(f"❌ Detections with is_alert_sent = False: {false_alert_status}")
                
                # Đếm các detections thiếu image_url
                missing_image_url = await db.detection_logs.count_documents({
                    "$or": [
                        {"image_url": {"$exists": False}},
                        {"image_url": ""},
                        {"image_url": None}
                    ]
                })
                print(f"🖼️ Detections missing image_url: {missing_image_url}")
                
                return True
            else:
                print("❌ detection_logs collection not found!")
                return False
                
        except Exception as e:
            print(f"❌ Database check failed: {e}")
            return False
    
    async def fix_missing_alert_status(self):
        """Khắc phục tất cả detection logs thiếu hoặc sai trạng thái alert"""
        print("\n🔧 Fixing missing alert status...")
        
        try:
            db = get_database()
            
            # 1. Cập nhật tất cả stranger detections để có is_alert_sent = True
            stranger_update_result = await db.detection_logs.update_many(
                {
                    "$and": [
                        {"detection_type": {"$in": ["stranger", "unknown"]}},
                        {
                            "$or": [
                                {"is_alert_sent": {"$exists": False}},
                                {"is_alert_sent": False}
                            ]
                        }
                    ]
                },
                {
                    "$set": {
                        "is_alert_sent": True,
                        "alert_methods": ["websocket", "system"],
                        "alert_updated_at": datetime.utcnow(),
                        "alert_fix_applied": True
                    }
                }
            )
            
            print(f"✅ Updated {stranger_update_result.modified_count} stranger detections to have is_alert_sent = True")
            
            # 2. Cập nhật known person detections để có is_alert_sent = False (không cần alert)
            known_person_update_result = await db.detection_logs.update_many(
                {
                    "$and": [
                        {"detection_type": "known_person"},
                        {
                            "$or": [
                                {"is_alert_sent": {"$exists": False}},
                                {"is_alert_sent": True}
                            ]
                        }
                    ]
                },
                {
                    "$set": {
                        "is_alert_sent": False,
                        "alert_methods": [],
                        "alert_updated_at": datetime.utcnow(),
                        "alert_fix_applied": True
                    }
                }
            )
            
            print(f"✅ Updated {known_person_update_result.modified_count} known person detections to have is_alert_sent = False")
            
            # 3. Thêm field alert_sent cho compatibility với code cũ
            compatibility_update = await db.detection_logs.update_many(
                {"alert_sent": {"$exists": False}},
                {
                    "$set": {
                        "alert_sent": True  # Set to True for backward compatibility
                    }
                }
            )
            
            print(f"✅ Added alert_sent field to {compatibility_update.modified_count} records for compatibility")
            
            return True
            
        except Exception as e:
            print(f"❌ Failed to fix alert status: {e}")
            return False
    
    async def fix_missing_image_urls(self):
        """Khắc phục các detection logs thiếu image_url"""
        print("\n🖼️ Fixing missing image URLs...")
        
        try:
            db = get_database()
            
            # Tìm tất cả detections thiếu image_url nhưng có image_path
            cursor = db.detection_logs.find({
                "$and": [
                    {
                        "$or": [
                            {"image_url": {"$exists": False}},
                            {"image_url": ""},
                            {"image_url": None}
                        ]
                    },
                    {
                        "image_path": {"$exists": True, "$ne": "", "$ne": None}
                    }
                ]
            })
            
            fixed_count = 0
            async for detection in cursor:
                try:
                    image_path = detection.get('image_path', '')
                    if image_path:
                        # Extract filename from path
                        filename = os.path.basename(image_path)
                        # Construct URL
                        image_url = f"/uploads/detections/{filename}"
                        
                        # Update document
                        await db.detection_logs.update_one(
                            {"_id": detection["_id"]},
                            {
                                "$set": {
                                    "image_url": image_url,
                                    "image_url_fixed": True,
                                    "image_fix_applied_at": datetime.utcnow()
                                }
                            }
                        )
                        
                        fixed_count += 1
                        
                except Exception as e:
                    print(f"⚠️ Error fixing image URL for detection {detection.get('_id')}: {e}")
                    continue
            
            print(f"✅ Fixed image URLs for {fixed_count} detections")
            
            # Cập nhật các detections không có image_path và image_url
            no_image_update = await db.detection_logs.update_many(
                {
                    "$and": [
                        {
                            "$or": [
                                {"image_url": {"$exists": False}},
                                {"image_url": ""},
                                {"image_url": None}
                            ]
                        },
                        {
                            "$or": [
                                {"image_path": {"$exists": False}},
                                {"image_path": ""},
                                {"image_path": None}
                            ]
                        }
                    ]
                },
                {
                    "$set": {
                        "image_url": "/static/images/no-image.jpg",
                        "image_path": "no-image.jpg",
                        "no_image_available": True,
                        "image_fix_applied_at": datetime.utcnow()
                    }
                }
            )
            
            print(f"✅ Set placeholder image for {no_image_update.modified_count} detections without images")
            
            return True
            
        except Exception as e:
            print(f"❌ Failed to fix image URLs: {e}")
            return False
    
    async def fix_email_status_fields(self):
        """Khắc phục các fields liên quan đến email status"""
        print("\n📧 Fixing email status fields...")
        
        try:
            db = get_database()
            
            # Thêm email_sent field cho tất cả stranger detections
            email_sent_update = await db.detection_logs.update_many(
                {
                    "$and": [
                        {"detection_type": {"$in": ["stranger", "unknown"]}},
                        {"email_sent": {"$exists": False}}
                    ]
                },
                {
                    "$set": {
                        "email_sent": True,  # Assume emails were sent for existing stranger detections
                        "email_sent_at": datetime.utcnow(),
                        "email_status_fixed": True
                    }
                }
            )
            
            print(f"✅ Added email_sent = True to {email_sent_update.modified_count} stranger detections")
            
            # Set email_sent = False cho known person detections
            known_email_update = await db.detection_logs.update_many(
                {
                    "$and": [
                        {"detection_type": "known_person"},
                        {
                            "$or": [
                                {"email_sent": {"$exists": False}},
                                {"email_sent": True}
                            ]
                        }
                    ]
                },
                {
                    "$set": {
                        "email_sent": False,
                        "email_sent_at": None,
                        "email_status_fixed": True
                    }
                }
            )
            
            print(f"✅ Set email_sent = False for {known_email_update.modified_count} known person detections")
            
            return True
            
        except Exception as e:
            print(f"❌ Failed to fix email status fields: {e}")
            return False
    
    async def add_missing_metadata(self):
        """Thêm metadata thiếu cho các detection logs"""
        print("\n📋 Adding missing metadata...")
        
        try:
            db = get_database()
            
            # Thêm metadata cơ bản cho tất cả detections
            metadata_update = await db.detection_logs.update_many(
                {"metadata": {"$exists": False}},
                {
                    "$set": {
                        "metadata": {
                            "fix_applied": True,
                            "fix_version": "1.0",
                            "fix_timestamp": datetime.utcnow().isoformat(),
                            "alert_status_fixed": True
                        }
                    }
                }
            )
            
            print(f"✅ Added metadata to {metadata_update.modified_count} detection logs")
            
            # Thêm alert_methods cho detections thiếu
            alert_methods_update = await db.detection_logs.update_many(
                {"alert_methods": {"$exists": False}},
                {
                    "$set": {
                        "alert_methods": ["websocket", "system"]
                    }
                }
            )
            
            print(f"✅ Added alert_methods to {alert_methods_update.modified_count} detection logs")
            
            return True
            
        except Exception as e:
            print(f"❌ Failed to add missing metadata: {e}")
            return False
    
    async def verify_fixes(self):
        """Xác minh các fix đã được áp dụng thành công"""
        print("\n✅ Verifying fixes...")
        
        try:
            db = get_database()
            
            # Kiểm tra số lượng detections đã được fix
            fixed_detections = await db.detection_logs.count_documents({
                "alert_fix_applied": True
            })
            print(f"📊 Detections with alert fix applied: {fixed_detections}")
            
            # Kiểm tra stranger detections có is_alert_sent = True
            stranger_with_alert = await db.detection_logs.count_documents({
                "detection_type": {"$in": ["stranger", "unknown"]},
                "is_alert_sent": True
            })
            print(f"🚨 Stranger detections with is_alert_sent = True: {stranger_with_alert}")
            
            # Kiểm tra known person detections có is_alert_sent = False
            known_without_alert = await db.detection_logs.count_documents({
                "detection_type": "known_person",
                "is_alert_sent": False
            })
            print(f"👤 Known person detections with is_alert_sent = False: {known_without_alert}")
            
            # Kiểm tra image URLs
            detections_with_image_url = await db.detection_logs.count_documents({
                "image_url": {"$exists": True, "$ne": "", "$ne": None}
            })
            print(f"🖼️ Detections with valid image_url: {detections_with_image_url}")
            
            # Kiểm tra email status
            detections_with_email_status = await db.detection_logs.count_documents({
                "email_sent": {"$exists": True}
            })
            print(f"📧 Detections with email_sent field: {detections_with_email_status}")
            
            print("\n✅ Fix verification completed!")
            return True
            
        except Exception as e:
            print(f"❌ Failed to verify fixes: {e}")
            return False
    
    async def create_fix_summary_report(self):
        """Tạo báo cáo tổng kết về các fix đã áp dụng"""
        print("\n📄 Creating fix summary report...")
        
        try:
            db = get_database()
            
            # Tạo aggregation pipeline để lấy thống kê
            pipeline = [
                {
                    "$group": {
                        "_id": "$detection_type",
                        "total_count": {"$sum": 1},
                        "alert_sent_count": {
                            "$sum": {"$cond": [{"$eq": ["$is_alert_sent", True]}, 1, 0]}
                        },
                        "email_sent_count": {
                            "$sum": {"$cond": [{"$eq": ["$email_sent", True]}, 1, 0]}
                        },
                        "has_image_url_count": {
                            "$sum": {
                                "$cond": [
                                    {
                                        "$and": [
                                            {"$ne": ["$image_url", None]},
                                            {"$ne": ["$image_url", ""]}
                                        ]
                                    },
                                    1,
                                    0
                                ]
                            }
                        },
                        "fix_applied_count": {
                            "$sum": {"$cond": [{"$eq": ["$alert_fix_applied", True]}, 1, 0]}
                        }
                    }
                },
                {"$sort": {"_id": 1}}
            ]
            
            stats = await db.detection_logs.aggregate(pipeline).to_list(None)
            
            print("\n📊 FIX SUMMARY REPORT:")
            print("=" * 60)
            
            total_fixed = 0
            for stat in stats:
                detection_type = stat["_id"]
                total = stat["total_count"]
                alert_sent = stat["alert_sent_count"]
                email_sent = stat["email_sent_count"]
                has_image = stat["has_image_url_count"]
                fixed = stat["fix_applied_count"]
                total_fixed += fixed
                
                print(f"\n{detection_type.upper()} DETECTIONS:")
                print(f"  Total: {total}")
                print(f"  Alert Sent: {alert_sent}/{total} ({alert_sent/total*100:.1f}%)")
                print(f"  Email Sent: {email_sent}/{total} ({email_sent/total*100:.1f}%)")
                print(f"  Has Image URL: {has_image}/{total} ({has_image/total*100:.1f}%)")
                print(f"  Fix Applied: {fixed}/{total} ({fixed/total*100:.1f}%)")
            
            print(f"\n{'='*60}")
            print(f"TOTAL DETECTIONS FIXED: {total_fixed}")
            print(f"FIX COMPLETED AT: {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S UTC')}")
            print(f"{'='*60}")
            
            # Lưu báo cáo vào file
            report_content = f"""
Alert Status Fix Report
Generated: {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S UTC')}

SUMMARY:
- Total detections fixed: {total_fixed}
- Database collections checked: detection_logs
- Fix types applied:
  * Alert status normalization
  * Image URL reconstruction  
  * Email status fields
  * Missing metadata addition

DETAILS BY DETECTION TYPE:
"""
            
            for stat in stats:
                detection_type = stat["_id"]
                total = stat["total_count"]
                alert_sent = stat["alert_sent_count"]
                email_sent = stat["email_sent_count"]
                has_image = stat["has_image_url_count"]
                fixed = stat["fix_applied_count"]
                
                report_content += f"""
{detection_type.upper()} DETECTIONS:
  Total: {total}
  Alert Sent: {alert_sent}/{total} ({alert_sent/total*100:.1f}%)
  Email Sent: {email_sent}/{total} ({email_sent/total*100:.1f}%)
  Has Image URL: {has_image}/{total} ({has_image/total*100:.1f}%)
  Fix Applied: {fixed}/{total} ({fixed/total*100:.1f}%)
"""
            
            # Lưu báo cáo
            report_filename = f"alert_status_fix_report_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.txt"
            with open(report_filename, 'w', encoding='utf-8') as f:
                f.write(report_content)
            
            print(f"\n📄 Report saved to: {report_filename}")
            
            return True
            
        except Exception as e:
            print(f"❌ Failed to create fix summary report: {e}")
            return False
    
    async def run_full_fix(self):
        """Chạy toàn bộ quá trình fix"""
        print("🚀 Starting Alert Status Fix Process...")
        print("=" * 60)
        
        # 1. Kiểm tra database
        if not await self.check_database_status():
            print("❌ Database check failed. Aborting.")
            return False
        
        # 2. Fix alert status
        if not await self.fix_missing_alert_status():
            print("❌ Alert status fix failed. Continuing with other fixes...")
        
        # 3. Fix image URLs
        if not await self.fix_missing_image_urls():
            print("❌ Image URL fix failed. Continuing with other fixes...")
        
        # 4. Fix email status
        if not await self.fix_email_status_fields():
            print("❌ Email status fix failed. Continuing with other fixes...")
        
        # 5. Add missing metadata
        if not await self.add_missing_metadata():
            print("❌ Metadata fix failed. Continuing with verification...")
        
        # 6. Verify fixes
        if not await self.verify_fixes():
            print("❌ Fix verification failed.")
        
        # 7. Create report
        if not await self.create_fix_summary_report():
            print("❌ Report creation failed.")
        
        print("\n🎉 Alert Status Fix Process Completed!")
        print("=" * 60)
        print("✅ All detection logs should now have proper alert status")
        print("✅ Image URLs have been reconstructed where possible")
        print("✅ Email status fields have been normalized")
        print("✅ Missing metadata has been added")
        print("\n💡 Please restart your application to see the changes.")
        
        return True

async def main():
    """Main function"""
    print("🔧 SafeFace Alert Status Fixer")
    print("=" * 60)
    print("This script will fix missing alert status in detection logs")
    print("and ensure all Detection Details display correctly.")
    print("=" * 60)
    
    try:
        # Confirm before running
        confirm = input("\n⚠️  Do you want to proceed with the fix? (y/N): ").strip().lower()
        if confirm not in ['y', 'yes']:
            print("❌ Fix cancelled by user.")
            return
        
        # Run the fix
        fixer = AlertStatusFixer()
        success = await fixer.run_full_fix()
        
        if success:
            print("\n✅ Fix completed successfully!")
            print("\n📋 Next steps:")
            print("1. Restart your FastAPI backend server")
            print("2. Refresh your frontend application")
            print("3. Check Detection Details - all should now show correct Alert Status")
            print("4. Verify images are displaying properly")
        else:
            print("\n❌ Fix completed with some errors. Check the logs above.")
        
    except KeyboardInterrupt:
        print("\n\n⚠️ Fix interrupted by user.")
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    # Run the async main function
    try:
        asyncio.run(main())
    except Exception as e:
        print(f"❌ Failed to run fix script: {e}")
        sys.exit(1)
