from fastapi import APIRouter, Depends, HTTPException, Response
from fastapi.responses import StreamingResponse
from typing import Dict, Any
from ..models.user import User
from ..models.camera import CameraResponse
from ..services.auth_service import get_current_active_user
from ..services.camera_service import camera_service
from ..services.stream_processor import stream_processor
import cv2
import asyncio
from io import BytesIO

router = APIRouter(prefix="/stream", tags=["stream"])

@router.get("/{camera_id}")
async def get_stream_info(
    camera_id: str,
    current_user: User = Depends(get_current_active_user)
) -> Dict[str, Any]:
    """Lấy thông tin stream của camera"""
    try:
        # Verify camera ownership
        camera = await camera_service.get_camera_by_id(camera_id, str(current_user.id))
        if not camera:
            raise HTTPException(status_code=404, detail="Camera not found")
        
        # Get stream info
        stream_info = await stream_processor.get_stream_info(camera_id)
        
        return {
            "camera_id": camera_id,
            "camera_name": camera.name,
            "camera_type": camera.camera_type,
            "camera_url": camera.camera_url,
            "is_streaming": stream_info.get("is_streaming", False),
            "stream_url": f"/api/stream/{camera_id}/video",
            "websocket_url": f"/api/ws/{current_user.id}",
            "stream_settings": camera.stream_settings,
            "detection_enabled": camera.detection_enabled,
            "status": stream_info.get("status", "offline")
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{camera_id}/video")
async def stream_video(
    camera_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """Stream video từ camera"""
    try:
        # Verify camera ownership
        camera = await camera_service.get_camera_by_id(camera_id, str(current_user.id))
        if not camera:
            raise HTTPException(status_code=404, detail="Camera not found")
        
        # Start video stream
        return StreamingResponse(
            stream_processor.generate_video_stream(camera_id, camera),
            media_type="multipart/x-mixed-replace; boundary=frame"
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{camera_id}/start")
async def start_stream(
    camera_id: str,
    current_user: User = Depends(get_current_active_user)
) -> Dict[str, Any]:
    """Bắt đầu stream camera"""
    try:
        # Verify camera ownership
        camera = await camera_service.get_camera_by_id(camera_id, str(current_user.id))
        if not camera:
            raise HTTPException(status_code=404, detail="Camera not found")
        
        # Start stream
        success = await stream_processor.start_stream(camera_id, camera)
        
        if success:
            return {
                "message": "Stream started successfully",
                "camera_id": camera_id,
                "camera_name": camera.name,
                "stream_url": f"/api/stream/{camera_id}/video",
                "status": "streaming"
            }
        else:
            raise HTTPException(status_code=400, detail="Failed to start stream")
            
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{camera_id}/stop")
async def stop_stream(
    camera_id: str,
    current_user: User = Depends(get_current_active_user)
) -> Dict[str, Any]:
    """Dừng stream camera"""
    try:
        # Verify camera ownership
        camera = await camera_service.get_camera_by_id(camera_id, str(current_user.id))
        if not camera:
            raise HTTPException(status_code=404, detail="Camera not found")
        
        # Stop stream
        success = await stream_processor.stop_stream(camera_id)
        
        if success:
            return {
                "message": "Stream stopped successfully",
                "camera_id": camera_id,
                "camera_name": camera.name,
                "status": "stopped"
            }
        else:
            raise HTTPException(status_code=400, detail="Failed to stop stream")
            
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{camera_id}/snapshot")
async def capture_snapshot(
    camera_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """Chụp ảnh snapshot từ camera"""
    try:
        # Verify camera ownership
        camera = await camera_service.get_camera_by_id(camera_id, str(current_user.id))
        if not camera:
            raise HTTPException(status_code=404, detail="Camera not found")
        
        # Capture snapshot
        image_bytes = await stream_processor.capture_snapshot(camera_id, camera)
        
        if image_bytes:
            return Response(
                content=image_bytes,
                media_type="image/jpeg",
                headers={"Content-Disposition": f"attachment; filename=snapshot_{camera_id}.jpg"}
            )
        else:
            raise HTTPException(status_code=400, detail="Failed to capture snapshot")
            
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{camera_id}/status")
async def get_stream_status(
    camera_id: str,
    current_user: User = Depends(get_current_active_user)
) -> Dict[str, Any]:
    """Lấy trạng thái stream"""
    try:
        # Verify camera ownership
        camera = await camera_service.get_camera_by_id(camera_id, str(current_user.id))
        if not camera:
            raise HTTPException(status_code=404, detail="Camera not found")
        
        # Get stream status
        status = await stream_processor.get_stream_status(camera_id)
        
        return {
            "camera_id": camera_id,
            "camera_name": camera.name,
            "is_streaming": status.get("is_streaming", False),
            "is_recording": status.get("is_recording", False),
            "detection_enabled": camera.detection_enabled,
            "viewers_count": status.get("viewers_count", 0),
            "uptime": status.get("uptime", 0),
            "frame_rate": status.get("frame_rate", 0),
            "resolution": status.get("resolution", "Unknown")
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))