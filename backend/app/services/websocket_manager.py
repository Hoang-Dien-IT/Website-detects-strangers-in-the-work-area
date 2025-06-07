from fastapi import WebSocket
from typing import Dict, List, Any
import json
from datetime import datetime

class WebSocketManager:
    def __init__(self):
        # Lưu trữ connections theo user_id
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, user_id: str):
        """Kết nối WebSocket cho user"""
        if user_id not in self.active_connections:
            self.active_connections[user_id] = []
        
        self.active_connections[user_id].append(websocket)
        print(f"✅ WebSocket connected for user: {user_id}")

    def disconnect(self, websocket: WebSocket, user_id: str):
        """Ngắt kết nối WebSocket"""
        if user_id in self.active_connections:
            try:
                self.active_connections[user_id].remove(websocket)
                if not self.active_connections[user_id]:
                    del self.active_connections[user_id]
                print(f"❌ WebSocket disconnected for user: {user_id}")
            except ValueError:
                pass

    async def send_personal_message(self, message: str, user_id: str):
        """Gửi message riêng cho user"""
        if user_id in self.active_connections:
            dead_connections = []
            for connection in self.active_connections[user_id]:
                try:
                    await connection.send_text(message)
                except:
                    dead_connections.append(connection)
            
            # Cleanup dead connections
            for dead_conn in dead_connections:
                self.disconnect(dead_conn, user_id)

    async def send_detection_alert(self, user_id: str, detection_data: Dict[str, Any]):
        """Gửi thông báo phát hiện cho user"""
        message = {
            "type": "detection_alert",
            "data": detection_data,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        await self.send_personal_message(json.dumps(message), user_id)

    async def broadcast(self, message: str):
        """Broadcast message cho tất cả user"""
        for user_id in self.active_connections:
            await self.send_personal_message(message, user_id)

    def get_connection_count(self) -> int:
        """Lấy số lượng connection hiện tại"""
        return sum(len(connections) for connections in self.active_connections.values())

    def get_user_connection_count(self, user_id: str) -> int:
        """Lấy số lượng connection của user"""
        return len(self.active_connections.get(user_id, []))

# Global instance
websocket_manager = WebSocketManager()