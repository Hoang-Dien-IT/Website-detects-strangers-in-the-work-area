# app/services/detection_service.py
from typing import List, Optional, Dict, Any
from bson import ObjectId
from ..database import get_database
from ..models.detection_log import DetectionLogCreate, DetectionLogResponse, DetectionStats, DetectionFilter
import base64
import uuid
from pathlib import Path
from datetime import datetime, timedelta
import aiofiles
import os

class DetectionService:
    def __init__(self):
        self.upload_dir = Path("uploads/detections")
        self.upload_dir.mkdir(parents=True, exist_ok=True)

    @property
    def db(self):
        return get_database()
    
    @property
    def collection(self):
        return self.db.detection_logs

    async def create_detection(self, user_id: str, detection_data: DetectionLogCreate) -> str:
        """Tạo detection log mới"""
        try:
            # Decode và lưu ảnh
            image_data = base64.b64decode(detection_data.image_base64)
            image_filename = f"detection_{uuid.uuid4()}.jpg"
            image_path = self.upload_dir / image_filename
            
            # Sử dụng cách đồng bộ để lưu file (đơn giản hơn)
            with open(image_path, "wb") as f:
                f.write(image_data)
            
            # Tạo detection log
            detection_dict = {
                "user_id": ObjectId(user_id),
                "camera_id": ObjectId(detection_data.camera_id),
                "detection_type": detection_data.detection_type,
                "person_id": ObjectId(detection_data.person_id) if detection_data.person_id else None,
                "person_name": detection_data.person_name,
                "confidence": detection_data.confidence,
                "similarity_score": detection_data.similarity_score,
                "image_path": str(image_path),
                "bbox": detection_data.bbox,
                "timestamp": datetime.utcnow(),
                "is_alert_sent": False,
                "alert_methods": [],
                "metadata": {}
            }
            
            result = await self.collection.insert_one(detection_dict)
            return str(result.inserted_id)
        except Exception as e:
            raise ValueError(f"Failed to create detection: {str(e)}")

    async def get_user_detections(self, user_id: str, filter_data: DetectionFilter) -> List[DetectionLogResponse]:
        """Lấy danh sách detection của user"""
        # Build query
        query = {"user_id": ObjectId(user_id)}
        
        if filter_data.camera_id:
            query["camera_id"] = ObjectId(filter_data.camera_id)
        
        if filter_data.detection_type:
            query["detection_type"] = filter_data.detection_type
            
        if filter_data.start_date:
            query.setdefault("timestamp", {})["$gte"] = filter_data.start_date
            
        if filter_data.end_date:
            query.setdefault("timestamp", {})["$lte"] = filter_data.end_date

        # Execute query
        cursor = self.collection.find(query).sort("timestamp", -1).limit(filter_data.limit).skip(filter_data.offset)
        
        detections = []
        async for detection in cursor:
            # Get camera name
            from ..services.camera_service import camera_service
            camera = await camera_service.get_camera_by_id(str(detection["camera_id"]), user_id)
            camera_name = camera.name if camera else "Unknown Camera"
            
            detections.append(DetectionLogResponse(
                id=str(detection["_id"]),
                camera_name=camera_name,
                detection_type=detection["detection_type"],
                person_name=detection.get("person_name"),
                confidence=detection["confidence"],
                similarity_score=detection.get("similarity_score"),
                image_url=f"/uploads/detections/{Path(detection['image_path']).name}",
                bbox=detection["bbox"],
                timestamp=detection["timestamp"],
                is_alert_sent=detection["is_alert_sent"]
            ))
        
        return detections

    async def get_detection_stats(self, user_id: str) -> DetectionStats:
        """Lấy thống kê detection"""
        now = datetime.utcnow()
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        week_start = today_start - timedelta(days=7)
        month_start = today_start - timedelta(days=30)
        
        pipeline = [
            {"$match": {"user_id": ObjectId(user_id)}},
            {"$facet": {
                "total": [{"$count": "count"}],
                "strangers": [{"$match": {"detection_type": "stranger"}}, {"$count": "count"}],
                "known": [{"$match": {"detection_type": "known_person"}}, {"$count": "count"}],
                "today": [{"$match": {"timestamp": {"$gte": today_start}}}, {"$count": "count"}],
                "week": [{"$match": {"timestamp": {"$gte": week_start}}}, {"$count": "count"}],
                "month": [{"$match": {"timestamp": {"$gte": month_start}}}, {"$count": "count"}]
            }}
        ]
        
        result = await self.collection.aggregate(pipeline).to_list(1)
        stats = result[0] if result else {}
        
        # Get active cameras count
        from ..services.camera_service import camera_service
        cameras = await camera_service.get_user_cameras(user_id)
        active_cameras = len([c for c in cameras if c.is_active])
        
        return DetectionStats(
            total_detections=stats.get("total", [{}])[0].get("count", 0),
            stranger_detections=stats.get("strangers", [{}])[0].get("count", 0),
            known_person_detections=stats.get("known", [{}])[0].get("count", 0),
            today_detections=stats.get("today", [{}])[0].get("count", 0),
            this_week_detections=stats.get("week", [{}])[0].get("count", 0),
            this_month_detections=stats.get("month", [{}])[0].get("count", 0),
            cameras_active=active_cameras
        )

# Global instance
detection_service = DetectionService()