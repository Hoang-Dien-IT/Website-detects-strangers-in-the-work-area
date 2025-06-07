from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import Optional
from bson import ObjectId
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from ..database import get_database
from ..config import get_settings
from ..models.user import User, UserCreate

settings = get_settings()
security = HTTPBearer()

class AuthService:
    def __init__(self):
        self.pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    
    @property
    def db(self):
        return get_database()
    
    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        return self.pwd_context.verify(plain_password, hashed_password)
    
    def get_password_hash(self, password: str) -> str:
        return self.pwd_context.hash(password)
    
    def create_access_token(self, data: dict, expires_delta: Optional[timedelta] = None):
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=15)
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)
        return encoded_jwt
    
    async def authenticate_user(self, username: str, password: str) -> Optional[User]:
        user_data = await self.db.users.find_one({"username": username})
        if not user_data:
            return None
        if not self.verify_password(password, user_data["hashed_password"]):
            return None
        return User(**user_data)
    
    async def create_user(self, user_data: UserCreate) -> User:
        # Check if user exists
        existing_user = await self.db.users.find_one({"$or": [
            {"username": user_data.username},
            {"email": user_data.email}
        ]})
        
        if existing_user:
            raise ValueError("Username or email already registered")
        
        # Create user
        hashed_password = self.get_password_hash(user_data.password)
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
        
        result = await self.db.users.insert_one(user_dict)
        user_dict["_id"] = result.inserted_id
        
        return User(**user_dict)
    
    async def get_current_user(self, credentials: HTTPAuthorizationCredentials = Depends(security)) -> User:
        """Get current user from JWT token"""
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
        
        user_data = await self.db.users.find_one({"username": username})
        if user_data is None:
            raise credentials_exception
        
        return User(**user_data)

# Global instance
auth_service = AuthService()

# Dependency functions for FastAPI
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> User:
    """Dependency để lấy current user"""
    return await auth_service.get_current_user(credentials)

async def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    """Dependency để lấy current active user"""
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

async def get_admin_user(current_user: User = Depends(get_current_active_user)) -> User:
    """Dependency để kiểm tra admin user"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return current_user