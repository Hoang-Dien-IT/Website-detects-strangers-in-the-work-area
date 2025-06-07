from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, HTTPException, status
from fastapi.security import HTTPBearer
from typing import Dict, Any
from ..services.websocket_manager import websocket_manager
from ..services.auth_service import get_current_active_user
from ..models.user import User
import json
import asyncio
from datetime import datetime

router = APIRouter(prefix="/ws", tags=["websocket"])
security = HTTPBearer()

@router.websocket("/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    """WebSocket endpoint cho real-time notifications"""
    try:
        # Accept connection first
        await websocket.accept()
        
        # Verify user authentication via query params or headers
        # Note: WebSocket auth is tricky, in production use proper token validation
        
        print(f"WebSocket connection established for user: {user_id}")
        
        # Connect to websocket manager
        await websocket_manager.connect(websocket, user_id)
        
        # Send welcome message
        await websocket.send_text(json.dumps({
            "type": "connection_established",
            "message": "WebSocket connection successful",
            "user_id": user_id,
            "timestamp": datetime.utcnow().isoformat()
        }))
        
        # Keep connection alive and handle messages
        while True:
            try:
                # Wait for messages from client
                data = await websocket.receive_text()
                message = json.loads(data)
                
                # Handle different message types
                if message.get("type") == "ping":
                    await websocket.send_text(json.dumps({
                        "type": "pong",
                        "timestamp": datetime.utcnow().isoformat()
                    }))
                
                elif message.get("type") == "subscribe_camera":
                    camera_id = message.get("camera_id")
                    await websocket.send_text(json.dumps({
                        "type": "camera_subscribed",
                        "camera_id": camera_id,
                        "message": f"Subscribed to camera {camera_id}",
                        "timestamp": datetime.utcnow().isoformat()
                    }))
                
                elif message.get("type") == "get_status":
                    await websocket.send_text(json.dumps({
                        "type": "status_response",
                        "status": "active",
                        "connected_cameras": [],
                        "detection_enabled": True,
                        "timestamp": datetime.utcnow().isoformat()
                    }))
                
            except WebSocketDisconnect:
                break
            except json.JSONDecodeError:
                await websocket.send_text(json.dumps({
                    "type": "error",
                    "message": "Invalid JSON format",
                    "timestamp": datetime.utcnow().isoformat()
                }))
            except Exception as e:
                print(f"WebSocket error: {e}")
                await websocket.send_text(json.dumps({
                    "type": "error",
                    "message": str(e),
                    "timestamp": datetime.utcnow().isoformat()
                }))
                
    except WebSocketDisconnect:
        print(f"WebSocket disconnected for user: {user_id}")
    except Exception as e:
        print(f"WebSocket connection error: {e}")
    finally:
        # Cleanup connection
        websocket_manager.disconnect(websocket, user_id)
        print(f"WebSocket cleanup completed for user: {user_id}")

@router.get("/test/{user_id}")
async def test_websocket_connection(
    user_id: str,
    current_user: User = Depends(get_current_active_user)  # ✅ Dependency này đúng
):
    """Test endpoint để kiểm tra WebSocket"""
    try:
        # Verify user ownership (optional - user chỉ có thể test cho chính mình)
        if str(current_user.id) != user_id:
            raise HTTPException(
                status_code=403, 
                detail="You can only test your own WebSocket connection"
            )
        
        # Send test notification
        await websocket_manager.send_detection_alert(user_id, {
            "type": "test_detection",
            "camera_name": "Test Camera",
            "person_name": "Test Person",
            "confidence": 0.95,
            "detection_type": "known_person",
            "timestamp": datetime.utcnow().isoformat()
        })
        
        return {
            "message": "Test notification sent successfully",
            "user_id": user_id,
            "websocket_url": f"ws://localhost:8000/api/ws/{user_id}",
            "connection_count": websocket_manager.get_user_connection_count(user_id),
            "test_sent_at": datetime.utcnow().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/status/{user_id}")
async def get_websocket_status(
    user_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """Lấy trạng thái WebSocket connection"""
    try:
        # Verify user ownership
        if str(current_user.id) != user_id:
            raise HTTPException(
                status_code=403, 
                detail="You can only check your own connection status"
            )
        
        connection_count = websocket_manager.get_user_connection_count(user_id)
        total_connections = websocket_manager.get_connection_count()
        
        return {
            "user_id": user_id,
            "is_connected": connection_count > 0,
            "connection_count": connection_count,
            "total_system_connections": total_connections,
            "websocket_url": f"ws://localhost:8000/api/ws/{user_id}",
            "status": "connected" if connection_count > 0 else "disconnected"
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/broadcast")
async def broadcast_message(
    message: Dict[str, Any],
    current_user: User = Depends(get_current_active_user)
):
    """Broadcast message tới tất cả connected users (Admin only)"""
    try:
        # Check admin permission
        if not current_user.is_admin:
            raise HTTPException(
                status_code=403,
                detail="Admin permission required"
            )
        
        broadcast_data = {
            "type": "broadcast",
            "data": message,
            "from_admin": current_user.username,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        await websocket_manager.broadcast(json.dumps(broadcast_data))
        
        return {
            "message": "Broadcast sent successfully",
            "recipients": websocket_manager.get_connection_count(),
            "broadcast_data": broadcast_data
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/send/{user_id}")
async def send_personal_message(
    user_id: str,
    message: Dict[str, Any],
    current_user: User = Depends(get_current_active_user)
):
    """Gửi message riêng cho user (Admin only)"""
    try:
        # Check admin permission
        if not current_user.is_admin:
            raise HTTPException(
                status_code=403,
                detail="Admin permission required"
            )
        
        personal_message = {
            "type": "personal_message",
            "data": message,
            "from_admin": current_user.username,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        await websocket_manager.send_personal_message(
            json.dumps(personal_message), 
            user_id
        )
        
        return {
            "message": "Personal message sent successfully",
            "target_user": user_id,
            "connection_count": websocket_manager.get_user_connection_count(user_id)
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))