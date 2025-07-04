from typing import List, Optional, Dict, Any
from bson import ObjectId
from ..database import get_database
from ..models.detection_log import (
    DetectionLog, 
    DetectionLogCreate, 
    DetectionLogResponse, 
    DetectionStats,
    DetectionFilter
)
from datetime import datetime, timedelta
import asyncio
import base64
import os
import uuid

class DetectionService:
    @property
    def db(self):
        return get_database()
    
    @property
    def collection(self):
        return self.db.detection_logs

    async def create_detection(self, user_id: str, detection_data: DetectionLogCreate) -> str:
        """Tạo detection log mới - method được gọi từ router"""
        try:
            # Validate camera exists and belongs to user
            camera = await self.db.cameras.find_one({
                "_id": ObjectId(detection_data.camera_id),
                "user_id": ObjectId(user_id)
            })
            
            if not camera:
                raise ValueError("Camera not found or access denied")
            
            # Save image to file system
            image_filename = await self._save_detection_image(detection_data.image_base64)
            
            # Prepare detection document
            detection_dict = {
                "user_id": ObjectId(user_id),
                "camera_id": ObjectId(detection_data.camera_id),
                "detection_type": detection_data.detection_type,
                "person_id": ObjectId(detection_data.person_id) if detection_data.person_id else None,
                "person_name": detection_data.person_name,
                "confidence": detection_data.confidence,
                "similarity_score": detection_data.similarity_score,
                "image_path": image_filename,
                "image_base64": detection_data.image_base64,  # Keep for quick access
                "bbox": detection_data.bbox,
                "timestamp": datetime.utcnow(),
                "is_alert_sent": False,
                "alert_methods": [],
                "metadata": {}
            }
            
            # Insert to database
            result = await self.collection.insert_one(detection_dict)
            
            # Send notification if stranger detected
            if detection_data.detection_type == "stranger":
                await self._send_stranger_alert(user_id, {
                    "detection_id": str(result.inserted_id),
                    "camera_name": camera["name"],
                    "camera_id": str(camera["_id"]),
                    "confidence": detection_data.confidence,
                    "timestamp": detection_dict["timestamp"]
                })
            
            return str(result.inserted_id)
            
        except Exception as e:
            raise ValueError(f"Failed to create detection: {str(e)}")

    async def _save_detection_image(self, image_base64: str) -> str:
        """Lưu ảnh detection vào file system"""
        try:
            # Ensure upload directory exists
            upload_dir = "uploads/detections"
            os.makedirs(upload_dir, exist_ok=True)
            
            # Generate unique filename
            image_filename = f"{uuid.uuid4()}.jpg"
            image_path = os.path.join(upload_dir, image_filename)
            
            # Decode base64 and save
            if image_base64.startswith('data:image/'):
                image_data = base64.b64decode(image_base64.split(',')[1])
            else:
                image_data = base64.b64decode(image_base64)
            
            with open(image_path, 'wb') as f:
                f.write(image_data)
            
            return image_path
            
        except Exception as e:
            print(f"Error saving detection image: {e}")
            return ""

    async def _send_stranger_alert(self, user_id: str, detection_data: Dict[str, Any]):
        """Gửi cảnh báo stranger (sẽ integrate với notification service sau)"""
        try:
            # Import here to avoid circular import
            from .notification_service import notification_service
            
            await notification_service.send_stranger_alert(user_id, detection_data)
            
            # Update detection log to mark alert sent
            await self.collection.update_one(
                {"_id": ObjectId(detection_data["detection_id"])},
                {
                    "$set": {
                        "is_alert_sent": True,
                        "alert_methods": ["websocket", "email"]
                    }
                }
            )
            
        except Exception as e:
            print(f"Error sending stranger alert: {e}")

    async def get_user_detections(self, user_id: str, filter_data: DetectionFilter) -> List[DetectionLogResponse]:
        """Lấy danh sách detection logs với filter"""
        try:
            query = {"user_id": ObjectId(user_id)}
            
            # Apply filters
            if filter_data.camera_id:
                query["camera_id"] = ObjectId(filter_data.camera_id)
            
            if filter_data.detection_type:
                query["detection_type"] = filter_data.detection_type
            
            if filter_data.start_date and filter_data.end_date:
                query["timestamp"] = {
                    "$gte": filter_data.start_date,
                    "$lte": filter_data.end_date
                }
            
            # Execute query
            logs = []
            cursor = self.collection.find(query).sort("timestamp", -1).skip(filter_data.offset).limit(filter_data.limit)
            
            async for log_data in cursor:
                # Get camera name
                camera = await self.db.cameras.find_one({"_id": log_data["camera_id"]})
                camera_name = camera["name"] if camera else "Unknown Camera"
                
                logs.append(DetectionLogResponse(
                    id=str(log_data["_id"]),
                    camera_name=camera_name,
                    detection_type=log_data["detection_type"],
                    person_name=log_data.get("person_name"),
                    confidence=log_data["confidence"],
                    similarity_score=log_data.get("similarity_score"),
                    image_url=f"/uploads/detections/{os.path.basename(log_data.get('image_path', ''))}" if log_data.get("image_path") else "",
                    bbox=log_data.get("bbox", []),
                    timestamp=log_data["timestamp"],
                    is_alert_sent=log_data.get("is_alert_sent", False)
                ))
            
            return logs
            
        except Exception as e:
            print(f"Error getting user detections: {e}")
            return []

    async def get_detection_stats(self, user_id: str) -> DetectionStats:
        """Lấy thống kê detection"""
        try:
            query = {"user_id": ObjectId(user_id)}
            
            # Basic counts
            total_detections = await self.collection.count_documents(query)
            stranger_detections = await self.collection.count_documents({
                **query, "detection_type": "stranger"
            })
            known_person_detections = await self.collection.count_documents({
                **query, "detection_type": "known_person"
            })
            
            # Time-based counts
            now = datetime.utcnow()
            today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
            week_start = now - timedelta(days=7)
            month_start = now - timedelta(days=30)
            
            today_detections = await self.collection.count_documents({
                **query, "timestamp": {"$gte": today_start}
            })
            
            this_week_detections = await self.collection.count_documents({
                **query, "timestamp": {"$gte": week_start}
            })
            
            this_month_detections = await self.collection.count_documents({
                **query, "timestamp": {"$gte": month_start}
            })
            
            # Active cameras count
            cameras_active = await self.db.cameras.count_documents({
                "user_id": ObjectId(user_id),
                "is_active": True
            })
            
            return DetectionStats(
                total_detections=total_detections,
                stranger_detections=stranger_detections,
                known_person_detections=known_person_detections,
                today_detections=today_detections,
                this_week_detections=this_week_detections,
                this_month_detections=this_month_detections,
                cameras_active=cameras_active
            )
            
        except Exception as e:
            print(f"Error getting detection stats: {e}")
            return DetectionStats(
                total_detections=0,
                stranger_detections=0,
                known_person_detections=0,
                today_detections=0,
                this_week_detections=0,
                this_month_detections=0,
                cameras_active=0
            )

    async def get_detection_by_id(self, detection_id: str, user_id: str) -> Optional[DetectionLogResponse]:
        """Lấy detection log theo ID"""
        try:
            log_data = await self.collection.find_one({
                "_id": ObjectId(detection_id),
                "user_id": ObjectId(user_id)
            })
            
            if not log_data:
                return None
            
            # Get camera name
            camera = await self.db.cameras.find_one({"_id": log_data["camera_id"]})
            camera_name = camera["name"] if camera else "Unknown Camera"
            
            return DetectionLogResponse(
                id=str(log_data["_id"]),
                camera_name=camera_name,
                detection_type=log_data["detection_type"],
                person_name=log_data.get("person_name"),
                confidence=log_data["confidence"],
                similarity_score=log_data.get("similarity_score"),
                image_url=f"/uploads/detections/{os.path.basename(log_data.get('image_path', ''))}" if log_data.get("image_path") else "",
                bbox=log_data.get("bbox", []),
                timestamp=log_data["timestamp"],
                is_alert_sent=log_data.get("is_alert_sent", False)
            )
            
        except Exception as e:
            print(f"Error getting detection by ID: {e}")
            return None

    async def delete_detection(self, detection_id: str, user_id: str) -> bool:
        """Xóa detection log"""
        try:
            # Get detection to delete image file
            detection = await self.collection.find_one({
                "_id": ObjectId(detection_id),
                "user_id": ObjectId(user_id)
            })
            
            if not detection:
                return False
            
            # Delete image file if exists
            if detection.get("image_path") and os.path.exists(detection["image_path"]):
                try:
                    os.remove(detection["image_path"])
                except:
                    pass
            
            # Delete from database
            result = await self.collection.delete_one({
                "_id": ObjectId(detection_id),
                "user_id": ObjectId(user_id)
            })
            
            return result.deleted_count > 0
            
        except Exception as e:
            print(f"Error deleting detection: {e}")
            return False

    async def cleanup_old_detections(self, user_id: str, days_to_keep: int = 30) -> int:
        """Dọn dẹp detection logs cũ"""
        try:
            cutoff_date = datetime.utcnow() - timedelta(days=days_to_keep)
            
            # Get old detections to delete image files
            old_detections = []
            async for detection in self.collection.find({
                "user_id": ObjectId(user_id),
                "timestamp": {"$lt": cutoff_date}
            }):
                old_detections.append(detection)
            
            # Delete image files
            for detection in old_detections:
                if detection.get("image_path") and os.path.exists(detection["image_path"]):
                    try:
                        os.remove(detection["image_path"])
                    except:
                        pass
            
            # Delete from database
            result = await self.collection.delete_many({
                "user_id": ObjectId(user_id),
                "timestamp": {"$lt": cutoff_date}
            })
            
            return result.deleted_count
            
        except Exception as e:
            print(f"Error cleaning up old detections: {e}")
            return 0
        
    async def get_stats_overview(self, user_id: str) -> Dict[str, Any]:
        """Lấy thống kê tổng quan chi tiết"""
        try:
            query = {"user_id": ObjectId(user_id)}
            
            # Basic counts
            total_detections = await self.collection.count_documents(query)
            stranger_detections = await self.collection.count_documents({
                **query, "detection_type": "stranger"
            })
            known_person_detections = await self.collection.count_documents({
                **query, "detection_type": "known_person"
            })
            
            # Time-based statistics
            now = datetime.utcnow()
            today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
            week_start = now - timedelta(days=7)
            month_start = now - timedelta(days=30)
            
            today_detections = await self.collection.count_documents({
                **query, "timestamp": {"$gte": today_start}
            })
            
            this_week_detections = await self.collection.count_documents({
                **query, "timestamp": {"$gte": week_start}
            })
            
            this_month_detections = await self.collection.count_documents({
                **query, "timestamp": {"$gte": month_start}
            })
            
            # Camera statistics
            total_cameras = await self.db.cameras.count_documents({
                "user_id": ObjectId(user_id)
            })
            
            active_cameras = await self.db.cameras.count_documents({
                "user_id": ObjectId(user_id),
                "is_active": True
            })
            
            streaming_cameras = await self.db.cameras.count_documents({
                "user_id": ObjectId(user_id),
                "is_streaming": True
            })
            
            # Person statistics
            total_persons = await self.db.known_persons.count_documents({
                "user_id": ObjectId(user_id),
                "is_active": True
            })
            
            # Recent activity (last 24 hours)
            yesterday = now - timedelta(hours=24)
            recent_stranger_alerts = await self.collection.count_documents({
                **query, 
                "detection_type": "stranger",
                "timestamp": {"$gte": yesterday}
            })
            
            # Detection accuracy (simple calculation)
            detection_accuracy = 0.0
            if total_detections > 0:
                detection_accuracy = (known_person_detections / total_detections) * 100
            
            # Alert statistics
            alerts_sent = await self.collection.count_documents({
                **query, 
                "is_alert_sent": True
            })
            
            # Top cameras by detections
            top_cameras = []
            camera_stats = await self.collection.aggregate([
                {"$match": query},
                {"$group": {
                    "_id": "$camera_id",
                    "detection_count": {"$sum": 1},
                    "stranger_count": {
                        "$sum": {"$cond": [{"$eq": ["$detection_type", "stranger"]}, 1, 0]}
                    }
                }},
                {"$sort": {"detection_count": -1}},
                {"$limit": 5}
            ]).to_list(length=5)
            
            for stat in camera_stats:
                camera_data = await self.db.cameras.find_one({"_id": stat["_id"]})
                if camera_data:
                    top_cameras.append({
                        "camera_id": str(stat["_id"]),
                        "camera_name": camera_data["name"],
                        "detection_count": stat["detection_count"],
                        "stranger_count": stat["stranger_count"]
                    })
            
            # Hourly detection pattern (last 24 hours)
            hourly_pattern = {}
            for hour in range(24):
                hour_start = today_start + timedelta(hours=hour)
                hour_end = hour_start + timedelta(hours=1)
                
                count = await self.collection.count_documents({
                    **query,
                    "timestamp": {"$gte": hour_start, "$lt": hour_end}
                })
                
                hourly_pattern[f"{hour:02d}:00"] = count
            
            return {
                "overview": {
                    "total_detections": total_detections,
                    "stranger_detections": stranger_detections,
                    "known_person_detections": known_person_detections,
                    "detection_accuracy": round(detection_accuracy, 2),
                    "alerts_sent": alerts_sent
                },
                "time_based": {
                    "today": today_detections,
                    "this_week": this_week_detections,
                    "this_month": this_month_detections,
                    "last_24h_strangers": recent_stranger_alerts
                },
                "camera_stats": {
                    "total_cameras": total_cameras,
                    "active_cameras": active_cameras,
                    "streaming_cameras": streaming_cameras,
                    "offline_cameras": total_cameras - active_cameras
                },
                "person_stats": {
                    "total_known_persons": total_persons
                },
                "top_cameras": top_cameras,
                "hourly_pattern": hourly_pattern,
                "last_updated": now.isoformat()
            }
            
        except Exception as e:
            print(f"Error getting stats overview: {e}")
            return {
                "overview": {
                    "total_detections": 0,
                    "stranger_detections": 0,
                    "known_person_detections": 0,
                    "detection_accuracy": 0.0,
                    "alerts_sent": 0
                },
                "time_based": {
                    "today": 0,
                    "this_week": 0,
                    "this_month": 0,
                    "last_24h_strangers": 0
                },
                "camera_stats": {
                    "total_cameras": 0,
                    "active_cameras": 0,
                    "streaming_cameras": 0,
                    "offline_cameras": 0
                },
                "person_stats": {
                    "total_known_persons": 0
                },
                "top_cameras": [],
                "hourly_pattern": {},
                "last_updated": datetime.utcnow().isoformat()
            }

    async def get_stats_by_camera(self, user_id: str, camera_id: str, time_range: str = "7d") -> Dict[str, Any]:
        """Lấy thống kê theo camera cụ thể"""
        try:
            # Parse time range
            days = {"24h": 1, "7d": 7, "30d": 30, "90d": 90}.get(time_range, 7)
            start_date = datetime.utcnow() - timedelta(days=days)
            
            query = {
                "user_id": ObjectId(user_id),
                "camera_id": ObjectId(camera_id),
                "timestamp": {"$gte": start_date}
            }
            
            # Get camera info
            camera_data = await self.db.cameras.find_one({
                "_id": ObjectId(camera_id),
                "user_id": ObjectId(user_id)
            })
            
            if not camera_data:
                raise ValueError("Camera not found")
            
            # Basic stats
            total_detections = await self.collection.count_documents(query)
            stranger_detections = await self.collection.count_documents({
                **query, "detection_type": "stranger"
            })
            known_person_detections = await self.collection.count_documents({
                **query, "detection_type": "known_person"
            })
            
            return {
                "camera_info": {
                    "id": str(camera_data["_id"]),
                    "name": camera_data["name"],
                    "location": camera_data.get("location"),
                    "is_active": camera_data["is_active"],
                    "is_streaming": camera_data.get("is_streaming", False)
                },
                "time_range": time_range,
                "period": f"Last {days} days",
                "summary": {
                    "total_detections": total_detections,
                    "stranger_detections": stranger_detections,
                    "known_person_detections": known_person_detections,
                    "avg_detections_per_day": round(total_detections / days, 2)
                }
            }
            
        except Exception as e:
            print(f"Error getting camera stats: {e}")
            return {
                "error": str(e),
                "camera_info": None,
                "summary": {
                    "total_detections": 0,
                    "stranger_detections": 0,
                    "known_person_detections": 0,
                    "avg_detections_per_day": 0
                }
            }
        
    async def get_chart_data(self, user_id: str, time_range: str = "7d", chart_type: str = "area") -> Dict[str, Any]:
        """Lấy dữ liệu cho charts"""
        try:
            days = {"24h": 1, "7d": 7, "30d": 30, "90d": 90}.get(time_range, 7)
            start_date = datetime.utcnow() - timedelta(days=days)
            
            query = {
                "user_id": ObjectId(user_id),
                "timestamp": {"$gte": start_date}
            }
            
            # Generate chart data based on time range
            if time_range == "24h":
                # Hourly data
                labels = []
                stranger_data = []
                known_data = []
                
                for hour in range(24):
                    hour_start = start_date + timedelta(hours=hour)
                    hour_end = hour_start + timedelta(hours=1)
                    
                    hour_query = {**query, "timestamp": {"$gte": hour_start, "$lt": hour_end}}
                    
                    strangers = await self.collection.count_documents({
                        **hour_query, "detection_type": "stranger"
                    })
                    known = await self.collection.count_documents({
                        **hour_query, "detection_type": "known_person"
                    })
                    
                    labels.append(f"{hour:02d}:00")
                    stranger_data.append(strangers)
                    known_data.append(known)
            else:
                # Daily data
                labels = []
                stranger_data = []
                known_data = []
                
                for i in range(days):
                    day_start = start_date + timedelta(days=i)
                    day_end = day_start + timedelta(days=1)
                    
                    day_query = {**query, "timestamp": {"$gte": day_start, "$lt": day_end}}
                    
                    strangers = await self.collection.count_documents({
                        **day_query, "detection_type": "stranger"
                    })
                    known = await self.collection.count_documents({
                        **day_query, "detection_type": "known_person"
                    })
                    
                    labels.append(day_start.strftime("%m/%d"))
                    stranger_data.append(strangers)
                    known_data.append(known)
            
            return {
                "chart_type": chart_type,
                "time_range": time_range,
                "labels": labels,
                "datasets": [
                    {
                        "label": "Stranger Detections",
                        "data": stranger_data,
                        "backgroundColor": "rgba(255, 99, 132, 0.2)",
                        "borderColor": "rgba(255, 99, 132, 1)",
                        "borderWidth": 2
                    },
                    {
                        "label": "Known Person Detections",
                        "data": known_data,
                        "backgroundColor": "rgba(54, 162, 235, 0.2)",
                        "borderColor": "rgba(54, 162, 235, 1)",
                        "borderWidth": 2
                    }
                ]
            }
            
        except Exception as e:
            print(f"Error getting chart data: {e}")
            return {
                "chart_type": chart_type,
                "time_range": time_range,
                "labels": [],
                "datasets": []
            }

    async def get_hourly_stats(self, user_id: str, date: str = None) -> Dict[str, Any]:
        """Lấy thống kê theo giờ cho một ngày cụ thể"""
        try:
            if date:
                target_date = datetime.strptime(date, "%Y-%m-%d")
            else:
                target_date = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
            
            day_start = target_date.replace(hour=0, minute=0, second=0, microsecond=0)
            day_end = day_start + timedelta(days=1)
            
            hourly_data = []
            for hour in range(24):
                hour_start = day_start + timedelta(hours=hour)
                hour_end = hour_start + timedelta(hours=1)
                
                query = {
                    "user_id": ObjectId(user_id),
                    "timestamp": {"$gte": hour_start, "$lt": hour_end}
                }
                
                total = await self.collection.count_documents(query)
                strangers = await self.collection.count_documents({
                    **query, "detection_type": "stranger"
                })
                known = await self.collection.count_documents({
                    **query, "detection_type": "known_person"
                })
                
                hourly_data.append({
                    "hour": f"{hour:02d}:00",
                    "total_detections": total,
                    "stranger_detections": strangers,
                    "known_person_detections": known
                })
            
            return {
                "date": target_date.strftime("%Y-%m-%d"),
                "hourly_stats": hourly_data,
                "daily_summary": {
                    "total_detections": sum(h["total_detections"] for h in hourly_data),
                    "stranger_detections": sum(h["stranger_detections"] for h in hourly_data),
                    "known_person_detections": sum(h["known_person_detections"] for h in hourly_data)
                }
            }
            
        except Exception as e:
            print(f"Error getting hourly stats: {e}")
            return {
                "date": date or datetime.utcnow().strftime("%Y-%m-%d"),
                "hourly_stats": [],
                "daily_summary": {
                    "total_detections": 0,
                    "stranger_detections": 0,
                    "known_person_detections": 0
                }
            }

    async def get_realtime_stats(self, user_id: str) -> Dict[str, Any]:
        """Lấy thống kê real-time (last 30 minutes)"""
        try:
            now = datetime.utcnow()
            last_30_min = now - timedelta(minutes=30)
            last_5_min = now - timedelta(minutes=5)
            
            query_30min = {
                "user_id": ObjectId(user_id),
                "timestamp": {"$gte": last_30_min}
            }
            
            query_5min = {
                "user_id": ObjectId(user_id),
                "timestamp": {"$gte": last_5_min}
            }
            
            # Last 30 minutes
            detections_30min = await self.collection.count_documents(query_30min)
            strangers_30min = await self.collection.count_documents({
                **query_30min, "detection_type": "stranger"
            })
            
            # Last 5 minutes
            detections_5min = await self.collection.count_documents(query_5min)
            strangers_5min = await self.collection.count_documents({
                **query_5min, "detection_type": "stranger"
            })
            
            # Active cameras
            active_cameras = await self.db.cameras.count_documents({
                "user_id": ObjectId(user_id),
                "is_active": True
            })
            
            streaming_cameras = await self.db.cameras.count_documents({
                "user_id": ObjectId(user_id),
                "is_streaming": True
            })
            
            return {
                "timestamp": now.isoformat(),
                "last_30_minutes": {
                    "total_detections": detections_30min,
                    "stranger_detections": strangers_30min,
                    "known_person_detections": detections_30min - strangers_30min
                },
                "last_5_minutes": {
                    "total_detections": detections_5min,
                    "stranger_detections": strangers_5min,
                    "known_person_detections": detections_5min - strangers_5min
                },
                "system_status": {
                    "active_cameras": active_cameras,
                    "streaming_cameras": streaming_cameras,
                    "detection_active": streaming_cameras > 0
                }
            }
            
        except Exception as e:
            print(f"Error getting realtime stats: {e}")
            return {
                "timestamp": datetime.utcnow().isoformat(),
                "last_30_minutes": {
                    "total_detections": 0,
                    "stranger_detections": 0,
                    "known_person_detections": 0
                },
                "last_5_minutes": {
                    "total_detections": 0,
                    "stranger_detections": 0,
                    "known_person_detections": 0
                },
                "system_status": {
                    "active_cameras": 0,
                    "streaming_cameras": 0,
                    "detection_active": False
                }
            }

    async def export_stats(self, user_id: str, time_range: str = "7d", format: str = "csv") -> str:
        """Export thống kê detection"""
        try:
            days = {"24h": 1, "7d": 7, "30d": 30, "90d": 90}.get(time_range, 7)
            start_date = datetime.utcnow() - timedelta(days=days)
            
            query = {
                "user_id": ObjectId(user_id),
                "timestamp": {"$gte": start_date}
            }
            
            # Get detection data
            detections = []
            async for detection in self.collection.find(query).sort("timestamp", -1):
                # Get camera name
                camera = await self.db.cameras.find_one({"_id": detection["camera_id"]})
                camera_name = camera["name"] if camera else "Unknown"
                
                detections.append({
                    "timestamp": detection["timestamp"].isoformat(),
                    "camera_name": camera_name,
                    "detection_type": detection["detection_type"],
                    "person_name": detection.get("person_name", "Unknown"),
                    "confidence": detection["confidence"],
                    "similarity_score": detection.get("similarity_score", 0)
                })
            
            if format == "csv":
                import csv
                import io
                
                output = io.StringIO()
                writer = csv.DictWriter(output, fieldnames=[
                    "timestamp", "camera_name", "detection_type", 
                    "person_name", "confidence", "similarity_score"
                ])
                writer.writeheader()
                writer.writerows(detections)
                return output.getvalue()
            
            elif format == "json":
                import json
                return json.dumps(detections, indent=2)
            
            else:
                return "Unsupported format"
                
        except Exception as e:
            print(f"Error exporting stats: {e}")
            return ""

# Global instance
detection_service = DetectionService()