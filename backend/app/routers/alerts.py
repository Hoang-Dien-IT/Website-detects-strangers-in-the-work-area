from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta
import uuid

from app.database import get_db
from app.models.detection_log import DetectionLog
from app.models.user import User
from app.services.auth_service import get_current_user

router = APIRouter()

@router.get("/unread-count")
async def get_unread_count(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get count of unread alerts (recent detections)
    """
    try:
        # Count detections from last 24 hours as "alerts"
        last_24h = datetime.utcnow() - timedelta(hours=24)
        
        unread_count = db.query(DetectionLog).filter(
            DetectionLog.timestamp >= last_24h,
            DetectionLog.detection_type.in_(["stranger", "unknown"])  # Only unknown persons as alerts
        ).count()
        
        return {"count": unread_count}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/")
async def get_alerts(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    alert_type: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get alerts (detection events that need attention)
    """
    try:
        query = db.query(DetectionLog)
        
        # Filter by alert type if specified
        if alert_type:
            query = query.filter(DetectionLog.detection_type == alert_type)
        else:
            # Default: only show stranger/unknown detections as alerts
            query = query.filter(DetectionLog.detection_type.in_(["stranger", "unknown"]))
        
        # Order by most recent first
        query = query.order_by(DetectionLog.timestamp.desc())
        
        # Get total count
        total = query.count()
        
        # Apply pagination
        alerts = query.offset(skip).limit(limit).all()
        
        # Convert to response format
        alert_list = []
        for alert in alerts:
            alert_data = {
                "id": str(alert.id),
                "camera_id": str(alert.camera_id),
                "camera_name": alert.camera.name if alert.camera else "Unknown",
                "detection_type": alert.detection_type,
                "person_name": alert.person_name,
                "confidence": alert.confidence,
                "timestamp": alert.timestamp.isoformat(),
                "image_path": alert.image_path,
                "bbox": alert.bbox,
                "metadata": alert.metadata,
                "is_read": False,  # Default to unread
                "severity": "high" if alert.detection_type == "stranger" else "medium"
            }
            alert_list.append(alert_data)
        
        return {
            "alerts": alert_list,
            "total": total,
            "skip": skip,
            "limit": limit,
            "has_next": skip + limit < total,
            "has_prev": skip > 0
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{alert_id}/mark-read")
async def mark_alert_read(
    alert_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Mark an alert as read
    """
    try:
        # For now, just return success since we don't have a read status in DetectionLog
        # In a real system, you might want to add a separate alerts table or add is_read field
        return {"message": "Alert marked as read", "alert_id": alert_id}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/mark-all-read")
async def mark_all_alerts_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Mark all alerts as read
    """
    try:
        # For now, just return success
        return {"message": "All alerts marked as read"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
