from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from .routers import auth, camera, person, admin, detection, stream, websocket
from .routers import settings as settings_router  # Sửa: đổi tên để tránh xung đột
from .config import get_settings
from .database import startup_db_client, shutdown_db_client
import os
from contextlib import asynccontextmanager

# Sử dụng lifespan thay vì on_event (fix deprecation warning)
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await startup_db_client()
    yield
    # Shutdown
    await shutdown_db_client()

settings = get_settings()

app = FastAPI(
    title="Face Recognition SaaS API",
    description="API for Face Recognition as a Service Platform",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan  # Sử dụng lifespan thay vì on_event
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.get_cors_origins_list(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create upload directories
os.makedirs("uploads", exist_ok=True)
os.makedirs("uploads/faces", exist_ok=True)
os.makedirs("uploads/detections", exist_ok=True)

# Static files
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Include routers with proper prefixes
app.include_router(auth.router, prefix="/api", tags=["Authentication"])
app.include_router(camera.router, prefix="/api", tags=["Cameras"])
app.include_router(person.router, prefix="/api", tags=["Known Persons"])
app.include_router(detection.router, prefix="/api", tags=["Detections"])
app.include_router(admin.router, prefix="/api", tags=["Admin"])
app.include_router(settings_router.router, prefix="/api", tags=["Settings"])  # Sửa: sử dụng settings_router
app.include_router(stream.router, prefix="/api", tags=["Streaming"])
app.include_router(websocket.router, prefix="/api") 

@app.get("/")
async def root():
    return {
        "message": "Face Recognition SaaS API",
        "version": "1.0.0",
        "docs": "/docs",
        "redoc": "/redoc"
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "services": {
            "database": "ready",
            "face_processor": "ready",
            "notification": "configured" if settings.smtp_username else "not_configured"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)