from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from passlib.context import CryptContext
from datetime import datetime, timedelta
from ..models.user import User, UserCreate, UserResponse, Token, UserUpdate
from ..database import get_database
from ..config import get_settings
from bson import ObjectId
from pydantic import BaseModel

router = APIRouter(prefix="/auth", tags=["authentication"])
security = HTTPBearer()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
settings = get_settings()

# Thêm model cho change password
class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Dependency để lấy current user từ JWT token"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(credentials.credentials, settings.secret_key, algorithms=[settings.algorithm])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    db = get_database()
    user = await db.users.find_one({"username": username})
    if user is None:
        raise credentials_exception
    
    return User(**user)

@router.post("/register", response_model=UserResponse)
async def register(user_data: UserCreate):
    db = get_database()
    
    # Check if user exists
    existing_user = await db.users.find_one({"$or": [
        {"username": user_data.username},
        {"email": user_data.email}
    ]})
    
    if existing_user:
        raise HTTPException(status_code=400, detail="Username or email already registered")
    
    # Create user
    hashed_password = get_password_hash(user_data.password)
    user_dict = {
        "username": user_data.username,
        "email": user_data.email,
        "full_name": user_data.full_name,
        "hashed_password": hashed_password,
        "is_active": True,
        "is_admin": False,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    result = await db.users.insert_one(user_dict)
    
    return UserResponse(
        id=str(result.inserted_id),
        username=user_dict["username"],
        email=user_dict["email"],
        full_name=user_dict["full_name"],
        is_active=user_dict["is_active"],
        is_admin=user_dict["is_admin"],
        created_at=user_dict["created_at"],
        updated_at=user_dict["updated_at"]
    )

@router.post("/login", response_model=Token)
async def login(form_data: dict):
    db = get_database()
    user = await db.users.find_one({"username": form_data["username"]})
    
    if not user or not verify_password(form_data["password"], user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = create_access_token(
        data={"sub": user["username"]}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    return UserResponse(
        id=str(current_user.id),
        username=current_user.username,
        email=current_user.email,
        full_name=current_user.full_name,
        is_active=current_user.is_active,
        is_admin=current_user.is_admin,
        created_at=current_user.created_at,
        updated_at=current_user.updated_at
    )

@router.put("/profile", response_model=UserResponse)
async def update_profile(
    update_data: UserUpdate,
    current_user: User = Depends(get_current_user)
):
    db = get_database()
    
    update_dict = {k: v for k, v in update_data.model_dump().items() if v is not None}
    if not update_dict:
        raise HTTPException(status_code=400, detail="No data to update")
    
    # Hash password if provided
    if "password" in update_dict:
        update_dict["hashed_password"] = get_password_hash(update_dict.pop("password"))
    
    update_dict["updated_at"] = datetime.utcnow()
    
    result = await db.users.find_one_and_update(
        {"_id": ObjectId(str(current_user.id))},
        {"$set": update_dict},
        return_document=True
    )
    
    if result:
        return UserResponse(
            id=str(result["_id"]),
            username=result["username"],
            email=result["email"],
            full_name=result["full_name"],
            is_active=result["is_active"],
            is_admin=result["is_admin"],
            created_at=result["created_at"],
            updated_at=result["updated_at"]
        )
    
    raise HTTPException(status_code=404, detail="User not found")

@router.put("/change-password")
async def change_password(
    password_data: ChangePasswordRequest,
    current_user: User = Depends(get_current_user)
):
    """Đổi mật khẩu"""
    try:
        db = get_database()
        
        # Verify current password
        if not verify_password(password_data.current_password, current_user.hashed_password):
            raise HTTPException(
                status_code=400,
                detail="Current password is incorrect"
            )
        
        # Validate new password
        if len(password_data.new_password) < 8:
            raise HTTPException(
                status_code=400,
                detail="New password must be at least 8 characters long"
            )
        
        # Hash new password
        new_hashed_password = get_password_hash(password_data.new_password)
        
        # Update password in database
        result = await db.users.update_one(
            {"_id": ObjectId(str(current_user.id))},
            {"$set": {
                "hashed_password": new_hashed_password,
                "updated_at": datetime.utcnow()
            }}
        )
        
        if result.modified_count > 0:
            return {
                "message": "Password changed successfully",
                "user_id": str(current_user.id)
            }
        else:
            raise HTTPException(
                status_code=400,
                detail="Failed to change password"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Failed to change password: {str(e)}"
        )