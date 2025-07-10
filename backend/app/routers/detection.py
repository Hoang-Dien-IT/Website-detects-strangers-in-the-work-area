from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from ..models.detection_log import DetectionLogCreate, DetectionLogResponse, DetectionStats, DetectionFilter
from ..models.user import User
from ..services.detection_service import detection_service
from ..services.auth_service import get_current_active_user

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
            "success": True,
            "message": "Detection logged successfully",
            "detection_id": detection_id
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        print(f"❌ Error creating detection: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to create detection: {str(e)}")
    
# ✅ MAIN ROUTE - với trailing slash
@router.get("/", response_model=List[DetectionLogResponse])
async def get_detections(
    camera_id: Optional[str] = Query(None),
    detection_type: Optional[str] = Query(None),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=1000),  # Tăng limit lên 1000
    offset: int = Query(0, ge=0),
    current_user: User = Depends(get_current_active_user)
):
    """Lấy danh sách detection logs"""
    try:
        print(f"🔵 Getting detections for user: {current_user.id}")
        print(f"🔵 Filters: camera_id={camera_id}, type={detection_type}, limit={limit}")
        
        # Parse date strings if provided
        start_datetime = None
        end_datetime = None
        
        if start_date:
            try:
                start_datetime = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
            except:
                start_datetime = datetime.fromisoformat(start_date)
        if end_date:
            try:
                end_datetime = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
            except:
                end_datetime = datetime.fromisoformat(end_date)
        
        # Convert detection_type to proper enum value if provided
        detection_type_enum = None
        if detection_type:
            try:
                from ..models.detection_log import DetectionType
                # Check if it's a valid enum value
                if detection_type in [e.value for e in DetectionType]:
                    detection_type_enum = detection_type
                print(f"🔵 Converted detection_type: {detection_type} -> {detection_type_enum}")
            except Exception as e:
                print(f"❌ Error converting detection_type: {e}")

        filter_data = DetectionFilter(
            camera_id=camera_id,
            detection_type=detection_type_enum,
            start_date=start_datetime,
            end_date=end_datetime,
            limit=limit,
            offset=offset
        )
        
        detections = await detection_service.get_user_detections(str(current_user.id), filter_data)
        print(f"✅ Found {len(detections)} detections")
        return detections
    except Exception as e:
        print(f"❌ Error getting detections: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Failed to get detections")


@router.get("/stats/overview")
async def get_detection_stats_overview(
    current_user: User = Depends(get_current_active_user)
):
    """Lấy thống kê tổng quan chi tiết"""
    try:
        print(f"🔵 Getting stats overview for user: {current_user.id}")
        stats = await detection_service.get_stats_overview(str(current_user.id))
        print(f"✅ Stats overview loaded successfully")
        return stats
    except Exception as e:
        print(f"❌ Error getting stats overview: {e}")
        import traceback
        traceback.print_exc()
        # Return default stats on error
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

@router.get("/stats")
async def get_detection_stats(
    time_range: str = Query("7d", regex="^(24h|7d|30d|90d)$"),
    current_user: User = Depends(get_current_active_user)
):
    """Lấy thống kê detection tổng quan"""
    try:
        return await detection_service.get_detection_stats(str(current_user.id), time_range)
    except Exception as e:
        print(f"❌ Error getting detection stats: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{detection_id}", response_model=DetectionLogResponse)
async def get_detection_by_id(
    detection_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """Lấy detection log theo ID"""
    try:
        detection = await detection_service.get_detection_by_id(detection_id, str(current_user.id))
        if not detection:
            raise HTTPException(status_code=404, detail="Detection not found")
        return detection
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error getting detection by ID: {e}")
        raise HTTPException(status_code=500, detail="Failed to get detection")

@router.delete("/{detection_id}")
async def delete_detection(
    detection_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """Xóa detection log"""
    try:
        success = await detection_service.delete_detection(detection_id, str(current_user.id))
        if not success:
            raise HTTPException(status_code=404, detail="Detection not found")
        return {"message": "Detection deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error deleting detection: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete detection")

@router.post("/cleanup")
async def cleanup_old_detections(
    days_to_keep: int = Query(30, ge=1, le=365),
    current_user: User = Depends(get_current_active_user)
):
    """Dọn dẹp detection logs cũ"""
    try:
        deleted_count = await detection_service.cleanup_old_detections(str(current_user.id), days_to_keep)
        return {
            "message": f"Cleaned up {deleted_count} old detection logs",
            "deleted_count": deleted_count
        }
    except Exception as e:
        print(f"❌ Error cleaning up detections: {e}")
        raise HTTPException(status_code=500, detail="Failed to cleanup detections")

@router.get("/stats/chart")
async def get_detection_chart_data(
    time_range: str = Query("7d", regex="^(24h|7d|30d|90d)$"),
    chart_type: str = Query("area", regex="^(area|line|bar)$"),
    current_user: User = Depends(get_current_active_user)
):
    """Lấy dữ liệu cho charts"""
    try:
        data = await detection_service.get_chart_data(
            str(current_user.id), 
            time_range, 
            chart_type
        )
        return data
    except Exception as e:
        print(f"❌ Error getting chart data: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/stats/export")
async def export_detection_stats(
    time_range: str = Query("7d", regex="^(24h|7d|30d|90d)$"),
    format: str = Query("csv", regex="^(csv|json)$"),
    camera_id: Optional[str] = Query(None),
    detection_type: Optional[str] = Query(None),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    current_user: User = Depends(get_current_active_user)
):
    """Export thống kê detection"""
    try:
        from fastapi.responses import Response
        
        data = await detection_service.export_stats(
            str(current_user.id), 
            time_range, 
            format,
            camera_id,
            detection_type,
            start_date,
            end_date
        )
        
        if format == "csv":
            return Response(
                content=data,
                media_type="text/csv",
                headers={
                    "Content-Disposition": f"attachment; filename=detections_{time_range}.csv"
                }
            )
        else:
            return Response(
                content=data,
                media_type="application/json",
                headers={
                    "Content-Disposition": f"attachment; filename=detections_{time_range}.json"
                }
            )
            
    except Exception as e:
        print(f"❌ Error exporting stats: {e}")
        raise HTTPException(status_code=500, detail=str(e))