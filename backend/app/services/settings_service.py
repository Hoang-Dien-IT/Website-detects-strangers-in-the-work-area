from typing import Dict, Any
from bson import ObjectId
from ..database import get_database
from datetime import datetime

class SettingsService:
    @property
    def db(self):
        return get_database()
    
    @property
    def collection(self):
        return self.db.user_settings

    async def get_user_settings(self, user_id: str) -> Dict[str, Any]:
        """Lấy cài đặt của user"""
        try:
            settings_data = await self.collection.find_one({"user_id": ObjectId(user_id)})
            
            if settings_data:
                # Remove MongoDB fields and return settings
                settings_data.pop("_id", None)
                settings_data.pop("user_id", None)
                settings_data.pop("created_at", None)
                settings_data.pop("updated_at", None)
                return settings_data
            else:
                # Return default settings
                return self._get_default_settings()
        except Exception as e:
            print(f"Error getting user settings: {e}")
            return self._get_default_settings()

    async def update_user_settings(self, user_id: str, settings_data: Dict[str, Any]) -> Dict[str, Any]:
        """Cập nhật cài đặt của user"""
        try:
            settings_doc = {
                **settings_data,
                "user_id": ObjectId(user_id),
                "updated_at": datetime.utcnow()
            }
            
            # Upsert settings
            result = await self.collection.update_one(
                {"user_id": ObjectId(user_id)},
                {
                    "$set": settings_doc,
                    "$setOnInsert": {"created_at": datetime.utcnow()}
                },
                upsert=True
            )
            
            return settings_data
        except Exception as e:
            raise ValueError(f"Failed to update settings: {str(e)}")

    async def reset_user_settings(self, user_id: str) -> bool:
        """Reset cài đặt về mặc định"""
        try:
            default_settings = self._get_default_settings()
            await self.update_user_settings(user_id, default_settings)
            return True
        except Exception as e:
            print(f"Error resetting user settings: {e}")
            return False

    def _get_default_settings(self) -> Dict[str, Any]:
        """Lấy cài đặt mặc định"""
        return {
            "email_notifications": True,
            "web_notifications": True,
            "detection_sensitivity": 0.7,
            "auto_delete_logs": False,
            "log_retention_days": 30,
            "stream_quality": "medium",
            "max_cameras": 5,
            "timezone": "UTC",
            "language": "en"
        }

# Global instance
settings_service = SettingsService()