from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from typing import List
from ..models.known_person import KnownPersonCreate, KnownPersonUpdate, KnownPersonResponse, AddFaceImageRequest  # ✅ Sửa import
from ..models.user import User
from ..services.person_service import person_service
from ..services.auth_service import get_current_active_user

router = APIRouter(prefix="/persons", tags=["persons"])

@router.post("/", response_model=KnownPersonResponse)  # ✅ Sửa response model
async def create_person(
    person_data: KnownPersonCreate,  # ✅ Sửa parameter type
    current_user: User = Depends(get_current_active_user)
):
    """Tạo known person mới"""
    try:
        return await person_service.create_person(str(current_user.id), person_data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/", response_model=List[KnownPersonResponse])  # ✅ Sửa response model
async def get_my_persons(current_user: User = Depends(get_current_active_user)):
    """Lấy danh sách known persons của user"""
    return await person_service.get_user_persons(str(current_user.id))

@router.get("/{person_id}", response_model=KnownPersonResponse)  # ✅ Sửa response model
async def get_person(
    person_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """Lấy thông tin person theo ID"""
    person = await person_service.get_person_by_id(person_id, str(current_user.id))
    if not person:
        raise HTTPException(status_code=404, detail="Person not found")
    return person

@router.put("/{person_id}", response_model=KnownPersonResponse)  # ✅ Sửa response model
async def update_person(
    person_id: str,
    update_data: KnownPersonUpdate,  # ✅ Sửa parameter type
    current_user: User = Depends(get_current_active_user)
):
    """Cập nhật person"""
    try:
        person = await person_service.update_person(person_id, str(current_user.id), update_data)
        if not person:
            raise HTTPException(status_code=404, detail="Person not found")
        return person
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{person_id}")
async def delete_person(
    person_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """Xóa person"""
    success = await person_service.delete_person(person_id, str(current_user.id))
    if not success:
        raise HTTPException(status_code=404, detail="Person not found")
    return {"message": "Person deleted successfully"}

@router.post("/{person_id}/images")
async def add_face_image(
    person_id: str,
    image_data: AddFaceImageRequest,
    current_user: User = Depends(get_current_active_user)
):
    """Thêm face image cho person"""
    try:
        result = await person_service.add_face_image(person_id, str(current_user.id), image_data.image_base64)
        if not result:
            raise HTTPException(status_code=404, detail="Person not found")
        return {"message": "Face image added successfully", "image_id": result}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{person_id}/images/{image_index}")
async def remove_face_image(
    person_id: str,
    image_index: int,
    current_user: User = Depends(get_current_active_user)
):
    """Xóa face image"""
    success = await person_service.remove_face_image(person_id, str(current_user.id), image_index)
    if not success:
        raise HTTPException(status_code=404, detail="Person or image not found")
    return {"message": "Face image removed successfully"}