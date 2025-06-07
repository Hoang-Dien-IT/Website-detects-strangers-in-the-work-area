from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from typing import List
from datetime import datetime
from bson import ObjectId
from ..models.camera import CameraCreate, CameraUpdate, CameraResponse
from ..models.user import User
from ..services.camera_service import camera_service  # Import instance thay vì class
from ..services.auth_service import get_current_active_user

router = APIRouter(prefix="/cameras", tags=["cameras"])

@router.post("/", response_model=CameraResponse)
async def create_camera(
    camera_data: CameraCreate,
    current_user: User = Depends(get_current_active_user)
):
    """Tạo camera mới"""
    try:
        # Sửa: sử dụng instance và đúng thứ tự parameters
        return await camera_service.create_camera(str(current_user.id), camera_data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/", response_model=List[CameraResponse])
async def get_my_cameras(current_user: User = Depends(get_current_active_user)):
    """Lấy danh sách camera của user"""
    return await camera_service.get_user_cameras(str(current_user.id))

@router.get("/{camera_id}", response_model=CameraResponse)
async def get_camera(
    camera_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """Lấy thông tin camera theo ID"""
    camera = await camera_service.get_camera_by_id(camera_id, str(current_user.id))
    if not camera:
        raise HTTPException(status_code=404, detail="Camera not found")
    return camera

@router.put("/{camera_id}", response_model=CameraResponse)
async def update_camera(
    camera_id: str,
    update_data: CameraUpdate,
    current_user: User = Depends(get_current_active_user)
):
    """Cập nhật camera"""
    try:
        camera = await camera_service.update_camera(camera_id, str(current_user.id), update_data)
        if not camera:
            raise HTTPException(status_code=404, detail="Camera not found")
        return camera
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{camera_id}")
async def delete_camera(
    camera_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """Xóa camera"""
    success = await camera_service.delete_camera(camera_id, str(current_user.id))
    if not success:
        raise HTTPException(status_code=404, detail="Camera not found")
    return {"message": "Camera deleted successfully"}

@router.post("/{camera_id}/test")
async def test_camera_connection(
    camera_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """Test kết nối camera"""
    camera = await camera_service.get_camera_by_id(camera_id, str(current_user.id))
    if not camera:
        raise HTTPException(status_code=404, detail="Camera not found")
    
    try:
        # ✅ Xử lý đặc biệt cho webcam
        if camera.camera_type == "webcam":
            return {
                "camera_id": camera_id,
                "is_connected": True,
                "message": "Webcam - no network test needed",
                "camera_type": "webcam"
            }
        
        # ✅ Kiểm tra camera_url có tồn tại không
        if not camera.camera_url:
            return {
                "camera_id": camera_id,
                "is_connected": False,
                "message": "No camera URL configured",
                "camera_type": camera.camera_type
            }
        
        # ✅ Sử dụng method đúng tên
        is_connected = await camera_service._async_test_camera_connection(camera.camera_url)
        
        if is_connected:
            # Update last_online nếu kết nối thành công
            await camera_service.collection.update_one(
                {"_id": ObjectId(camera_id)},
                {"$set": {"last_online": datetime.utcnow()}}
            )
        
        return {
            "camera_id": camera_id,
            "is_connected": is_connected,
            "message": "Connection successful" if is_connected else "Connection failed",
            "camera_type": camera.camera_type,
            "camera_url": camera.camera_url
        }
    except Exception as e:
        return {
            "camera_id": camera_id,
            "is_connected": False,
            "message": f"Connection error: {str(e)}",
            "camera_type": camera.camera_type if camera else "unknown"
        }
@router.post("/{camera_id}/start-detection")
async def start_detection(
    camera_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """Bắt đầu face detection cho camera"""
    camera = await camera_service.get_camera_by_id(camera_id, str(current_user.id))
    if not camera:
        raise HTTPException(status_code=404, detail="Camera not found")
    
    success = await camera_service.start_detection(camera_id, str(current_user.id))
    if not success:
        raise HTTPException(status_code=400, detail="Failed to start detection")
    
    return {"message": "Detection started successfully", "camera_id": camera_id}

@router.post("/{camera_id}/stop-detection")
async def stop_detection(
    camera_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """Dừng face detection cho camera"""
    camera = await camera_service.get_camera_by_id(camera_id, str(current_user.id))
    if not camera:
        raise HTTPException(status_code=404, detail="Camera not found")
    
    success = await camera_service.stop_detection(camera_id)
    if not success:
        raise HTTPException(status_code=400, detail="Failed to stop detection")
    
    return {"message": "Detection stopped successfully", "camera_id": camera_id}