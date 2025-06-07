from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional
from ..models.detection_log import DetectionLogCreate, DetectionLogResponse, DetectionStats, DetectionFilter
from ..models.user import User
from ..services.detection_service import detection_service
from ..services.auth_service import get_current_active_user
from datetime import datetime

router = APIRouter(prefix="/detections", tags=["detections"])

@router.post("/", response_model=dict)
async def create_detection(
    detection_data: DetectionLogCreate,
    current_user: User = Depends(get_current_active_user)
):
    """Tạo detection log mới"""
    try:
        detection_id = await detection_service.create_detection(str(current_user.id), detection_data)
        return {
            "message": "Detection logged successfully",
            "detection_id": detection_id
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/", response_model=List[DetectionLogResponse])
async def get_detections(
    camera_id: Optional[str] = Query(None),
    detection_type: Optional[str] = Query(None),
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    current_user: User = Depends(get_current_active_user)
):
    """Lấy danh sách detection logs"""
    filter_data = DetectionFilter(
        camera_id=camera_id,
        detection_type=detection_type,
        start_date=start_date,
        end_date=end_date,
        limit=limit,
        offset=offset
    )
    return await detection_service.get_user_detections(str(current_user.id), filter_data)

@router.get("/stats", response_model=DetectionStats)
async def get_detection_stats(
    current_user: User = Depends(get_current_active_user)
):
    """Lấy thống kê detection"""
    return await detection_service.get_detection_stats(str(current_user.id))

@router.post("/filter", response_model=List[DetectionLogResponse])
async def filter_detections(
    filter_data: DetectionFilter,
    current_user: User = Depends(get_current_active_user)
):
    """Filter detections với điều kiện chi tiết"""
    return await detection_service.get_user_detections(str(current_user.id), filter_data)

@router.get("/{detection_id}", response_model=DetectionLogResponse)
async def get_detection_by_id(
    detection_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """Lấy detection log theo ID"""
    # TODO: Implement get_detection_by_id in service
    raise HTTPException(status_code=501, detail="Not implemented yet")

@router.delete("/{detection_id}")
async def delete_detection(
    detection_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """Xóa detection log"""
    # TODO: Implement delete_detection in service
    raise HTTPException(status_code=501, detail="Not implemented yet")