from pydantic_settings import BaseSettings
from typing import Optional, List

class Settings(BaseSettings):
    # Database
    mongodb_url: str = "mongodb://localhost:27017"
    database_name: str = "face_recognition_saas"
    
    # Security
    secret_key: str = "i&s@8he7jgmm3f1lb)^2-35vf11r4=sd*4j-3%jhxnkdosuhkl"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 1440  # 24 hours
    
    # SMTP Settings for email alerts
    smtp_server: str = "smtp.gmail.com"
    smtp_port: int = 587
    smtp_username: Optional[str] = None
    smtp_password: Optional[str] = None
    
    # File upload
    max_file_size: int = 10 * 1024 * 1024  # 10MB
    allowed_image_types: List[str] = ["image/jpeg", "image/png", "image/jpg"]
    
    # Face recognition
    face_similarity_threshold: float = 0.6
    
    # CORS - Sử dụng string thay vì list để tránh JSON parsing error
    cors_origins: str = "http://localhost:3000,http://localhost:3001"
    
    class Config:
        env_file = ".env"

    def get_cors_origins_list(self) -> List[str]:
        """Convert cors_origins string to list"""
        if self.cors_origins:
            return [origin.strip() for origin in self.cors_origins.split(",")]
        return ["http://localhost:3000"]

def get_settings():
    return Settings()