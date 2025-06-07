from typing import List, Optional, Dict
from bson import ObjectId
from ..database import get_database
from ..models.known_person import KnownPersonCreate, KnownPersonUpdate, KnownPersonResponse, FaceImage, FaceImageResponse  # ✅ Sửa import
import base64
import os
from datetime import datetime
import uuid

class PersonService:
    @property
    def db(self):
        return get_database()
    
    @property
    def collection(self):
        return self.db.known_persons

    async def create_person(self, user_id: str, person_data: KnownPersonCreate) -> KnownPersonResponse:  # ✅ Sửa type
        """Tạo known person mới"""
        try:
            # Create person document
            person_dict = {
                "user_id": ObjectId(user_id),
                "name": person_data.name,
                "description": person_data.description,
                "face_images": [],  # Sẽ thêm image sau
                "is_active": True,
                "metadata": person_data.metadata or {},
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
            
            result = await self.collection.insert_one(person_dict)
            
            return KnownPersonResponse(  # ✅ Sửa response type
                id=str(result.inserted_id),
                name=person_dict["name"],
                description=person_dict["description"],
                is_active=person_dict["is_active"],
                created_at=person_dict["created_at"],
                face_images_count=0
            )
        except Exception as e:
            raise ValueError(f"Failed to create person: {str(e)}")

    async def get_user_persons(self, user_id: str) -> List[KnownPersonResponse]:  # ✅ Sửa return type
        """Lấy danh sách persons của user"""
        persons = []
        async for person_data in self.collection.find({"user_id": ObjectId(user_id), "is_active": True}).sort("created_at", -1):
            persons.append(KnownPersonResponse(  # ✅ Sửa response type
                id=str(person_data["_id"]),
                name=person_data["name"],
                description=person_data.get("description"),
                is_active=person_data["is_active"],
                created_at=person_data["created_at"],
                face_images_count=len(person_data.get("face_images", []))
            ))
        return persons

    async def get_person_by_id(self, person_id: str, user_id: str) -> Optional[KnownPersonResponse]:  # ✅ Sửa return type
        """Lấy person theo ID"""
        try:
            person_data = await self.collection.find_one({
                "_id": ObjectId(person_id),
                "user_id": ObjectId(user_id)
            })
            
            if person_data:
                return KnownPersonResponse(  # ✅ Sửa response type
                    id=str(person_data["_id"]),
                    name=person_data["name"],
                    description=person_data.get("description"),
                    is_active=person_data["is_active"],
                    created_at=person_data["created_at"],
                    face_images_count=len(person_data.get("face_images", []))
                )
        except Exception as e:
            print(f"Error getting person: {e}")
        return None

    async def update_person(self, person_id: str, user_id: str, update_data: KnownPersonUpdate) -> Optional[KnownPersonResponse]:  # ✅ Sửa type
        """Cập nhật person"""
        try:
            update_dict = {k: v for k, v in update_data.model_dump().items() if v is not None}
            if not update_dict:
                return await self.get_person_by_id(person_id, user_id)
            
            update_dict["updated_at"] = datetime.utcnow()
            
            result = await self.collection.find_one_and_update(
                {"_id": ObjectId(person_id), "user_id": ObjectId(user_id)},
                {"$set": update_dict},
                return_document=True
            )
            
            if result:
                return KnownPersonResponse(  # ✅ Sửa response type
                    id=str(result["_id"]),
                    name=result["name"],
                    description=result.get("description"),
                    is_active=result["is_active"],
                    created_at=result["created_at"],
                    face_images_count=len(result.get("face_images", []))
                )
        except Exception as e:
            print(f"Error updating person: {e}")
        return None

    async def delete_person(self, person_id: str, user_id: str) -> bool:
        """Xóa person (soft delete)"""
        try:
            result = await self.collection.update_one(
                {"_id": ObjectId(person_id), "user_id": ObjectId(user_id)},
                {"$set": {"is_active": False, "updated_at": datetime.utcnow()}}
            )
            return result.modified_count > 0
        except Exception:
            return False

    async def add_face_image(self, person_id: str, user_id: str, image_base64: str) -> Optional[str]:
        """Thêm face image cho person"""
        try:
            # Decode base64 image
            image_data = base64.b64decode(image_base64)
            
            # Generate unique filename
            image_id = str(uuid.uuid4())
            filename = f"{image_id}.jpg"
            image_path = f"uploads/faces/{filename}"
            
            # Ensure directory exists
            os.makedirs("uploads/faces", exist_ok=True)
            
            # Save image
            with open(image_path, "wb") as f:
                f.write(image_data)
            
            # Create face image record
            face_image = {
                "image_path": image_path,
                "image_url": f"/uploads/faces/{filename}",
                "uploaded_at": datetime.utcnow(),
                "embedding": None  # Sẽ được generate bởi face processor
            }
            
            # Update person document
            result = await self.collection.update_one(
                {"_id": ObjectId(person_id), "user_id": ObjectId(user_id)},
                {
                    "$push": {"face_images": face_image},
                    "$set": {"updated_at": datetime.utcnow()}
                }
            )
            
            return image_id if result.modified_count > 0 else None
        except Exception as e:
            print(f"Error adding face image: {e}")
            return None

    async def remove_face_image(self, person_id: str, user_id: str, image_index: int) -> bool:
        """Xóa face image"""
        try:
            # Get person to find image path
            person = await self.collection.find_one({
                "_id": ObjectId(person_id),
                "user_id": ObjectId(user_id)
            })
            
            if not person or len(person.get("face_images", [])) <= image_index:
                return False
            
            # Get image path for file deletion
            image_path = person["face_images"][image_index]["image_path"]
            
            # Remove from database
            result = await self.collection.update_one(
                {"_id": ObjectId(person_id), "user_id": ObjectId(user_id)},
                {
                    "$unset": {f"face_images.{image_index}": 1},
                    "$set": {"updated_at": datetime.utcnow()}
                }
            )
            
            # Remove null elements
            await self.collection.update_one(
                {"_id": ObjectId(person_id)},
                {"$pull": {"face_images": None}}
            )
            
            # Delete file
            try:
                os.remove(image_path)
            except:
                pass
            
            return result.modified_count > 0
        except Exception:
            return False

# Global instance
person_service = PersonService()