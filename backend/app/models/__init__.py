from .user import User, UserCreate, UserResponse, Token, UserUpdate
from .camera import Camera, CameraCreate, CameraUpdate, CameraResponse, CameraStreamInfo
from .known_person import KnownPerson, KnownPersonCreate, KnownPersonUpdate, KnownPersonResponse, FaceImage, AddFaceImageRequest, FaceImageResponse, PersonDetailResponse  # ✅ Sửa tên cho đúng
from .detection_log import DetectionLog, DetectionLogCreate, DetectionLogResponse, DetectionStats, DetectionFilter

__all__ = [
    "User", "UserCreate", "UserUpdate", "UserResponse", "Token",
    "Camera", "CameraCreate", "CameraUpdate", "CameraResponse", "CameraStreamInfo",
    "KnownPerson", "KnownPersonCreate", "KnownPersonUpdate", "KnownPersonResponse", "FaceImage", "AddFaceImageRequest", "FaceImageResponse", "PersonDetailResponse",  # ✅ Sửa tên
    "DetectionLog", "DetectionLogCreate", "DetectionLogResponse", "DetectionStats", "DetectionFilter"
]