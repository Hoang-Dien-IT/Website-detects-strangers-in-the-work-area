from fastapi import APIRouter, Depends, HTTPException
from typing import Dict, Any
from ..models.user import User
from ..services.auth_service import get_current_active_user
from ..services.settings_service import settings_service
from pydantic import BaseModel

router = APIRouter(prefix="/settings", tags=["settings"])

class UserSettings(BaseModel):
    email_notifications: bool = True
    web_notifications: bool = True
    detection_sensitivity: float = 0.7
    auto_delete_logs: bool = False
    log_retention_days: int = 30
    stream_quality: str = "medium"
    max_cameras: int = 5
    timezone: str = "UTC"
    language: str = "en"

@router.get("/", response_model=UserSettings)
async def get_user_settings(
    current_user: User = Depends(get_current_active_user)
) -> UserSettings:
    """Lấy cài đặt của user"""
    settings = await settings_service.get_user_settings(str(current_user.id))
    return UserSettings(**settings)

@router.put("/", response_model=UserSettings)
async def update_user_settings(
    settings_data: UserSettings,
    current_user: User = Depends(get_current_active_user)
) -> UserSettings:
    """Cập nhật cài đặt của user"""
    try:
        updated_settings = await settings_service.update_user_settings(
            str(current_user.id), 
            settings_data.model_dump()
        )
        return UserSettings(**updated_settings)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/default")
async def get_default_settings() -> UserSettings:
    """Lấy cài đặt mặc định"""
    return UserSettings()

@router.post("/reset")
async def reset_user_settings(
    current_user: User = Depends(get_current_active_user)
) -> Dict[str, Any]:
    """Reset cài đặt về mặc định"""
    try:
        success = await settings_service.reset_user_settings(str(current_user.id))
        if success:
            return {"message": "Settings reset to default successfully"}
        else:
            raise HTTPException(status_code=400, detail="Failed to reset settings")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))