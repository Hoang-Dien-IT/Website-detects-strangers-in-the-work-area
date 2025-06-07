from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Dict, Any
from ..models.user import User
from ..services.admin_service import admin_service
from ..services.auth_service import get_admin_user
from pydantic import BaseModel

router = APIRouter(prefix="/admin", tags=["admin"])

class ToggleStatusRequest(BaseModel):
    is_active: bool

class ToggleAdminRequest(BaseModel):
    is_admin: bool

@router.get("/dashboard")
async def get_dashboard_stats(
    current_admin: User = Depends(get_admin_user)
) -> Dict[str, Any]:
    """Lấy thống kê tổng quan cho admin dashboard"""
    return await admin_service.get_dashboard_stats()

@router.get("/users")
async def get_all_users(
    current_admin: User = Depends(get_admin_user)
) -> List[Dict[str, Any]]:
    """Lấy danh sách tất cả users"""
    return await admin_service.get_all_users()

@router.get("/system/health")
async def get_system_health(
    current_admin: User = Depends(get_admin_user)
) -> Dict[str, Any]:
    """Lấy thông tin sức khỏe hệ thống"""
    return await admin_service.get_system_health()

@router.post("/users/{user_id}/toggle-status")
async def toggle_user_status(
    user_id: str,
    request: ToggleStatusRequest,
    current_admin: User = Depends(get_admin_user)
):
    """Kích hoạt/Vô hiệu hóa user"""
    try:
        success = await admin_service.toggle_user_status(user_id, request.is_active)
        if not success:
            raise HTTPException(
                status_code=404, 
                detail="User not found"
            )
        
        status_text = "activated" if request.is_active else "deactivated"
        return {
            "message": f"User {status_text} successfully",
            "user_id": user_id,
            "is_active": request.is_active
        }
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Failed to update user status: {str(e)}"
        )

@router.post("/users/{user_id}/toggle-admin")
async def toggle_admin_role(
    user_id: str,
    request: ToggleAdminRequest,
    current_admin: User = Depends(get_admin_user)
):
    """Cấp/Thu hồi quyền admin"""
    try:
        success = await admin_service.toggle_admin_role(user_id, request.is_admin)
        if not success:
            raise HTTPException(
                status_code=404, 
                detail="User not found"
            )
        
        role_text = "granted" if request.is_admin else "revoked"
        return {
            "message": f"Admin role {role_text} successfully",
            "user_id": user_id,
            "is_admin": request.is_admin
        }
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Failed to update admin role: {str(e)}"
        )

@router.get("/system/logs")
async def get_system_logs(
    limit: int = 100,
    current_admin: User = Depends(get_admin_user)
) -> List[Dict[str, Any]]:
    """Lấy system logs"""
    return await admin_service.get_system_logs(limit)

@router.get("/users/{user_id}/details")
async def get_user_details(
    user_id: str,
    current_admin: User = Depends(get_admin_user)
) -> Dict[str, Any]:
    """Lấy thông tin chi tiết user"""
    try:
        user_details = await admin_service.get_user_details(user_id)
        if not user_details:
            raise HTTPException(status_code=404, detail="User not found")
        return user_details
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Failed to get user details: {str(e)}"
        )