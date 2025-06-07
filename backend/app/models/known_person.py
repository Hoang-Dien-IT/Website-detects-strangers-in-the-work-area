from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from datetime import datetime

class FaceImage(BaseModel):
    image_path: str
    image_url: str
    uploaded_at: datetime
    embedding: Optional[List[float]] = None

class FaceImageResponse(BaseModel):
    image_url: str
    uploaded_at: datetime

class KnownPersonCreate(BaseModel):  # ✅ Đổi từ PersonCreate thành KnownPersonCreate
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = {}

class KnownPersonUpdate(BaseModel):  # ✅ Đổi từ PersonUpdate thành KnownPersonUpdate
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None
    is_active: Optional[bool] = None

class KnownPersonResponse(BaseModel):  # ✅ Đổi từ PersonResponse thành KnownPersonResponse
    id: str
    name: str
    description: Optional[str] = None
    is_active: bool
    created_at: datetime
    face_images_count: int = 0

class PersonDetailResponse(BaseModel):  # ✅ Thêm class này
    id: str
    name: str
    description: Optional[str] = None
    is_active: bool
    created_at: datetime
    updated_at: datetime
    face_images: List[FaceImageResponse] = []
    metadata: Dict[str, Any] = {}

class AddFaceImageRequest(BaseModel):
    image_base64: str = Field(..., description="Base64 encoded image")

class KnownPerson(BaseModel):
    id: str
    user_id: str
    name: str
    description: Optional[str] = None
    face_images: List[FaceImage] = []
    is_active: bool = True
    metadata: Dict[str, Any] = {}
    created_at: datetime
    updated_at: datetime