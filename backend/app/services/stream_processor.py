import cv2
import asyncio
import numpy as np
from typing import Dict, Any, Optional, AsyncGenerator, List, List
from ..models.camera import CameraResponse
from ..services.face_processor import face_processor
from ..services.websocket_manager import websocket_manager
import concurrent.futures
import time
import base64
from io import BytesIO

class StreamProcessor:
    def __init__(self):
        self.active_streams: Dict[str, Dict[str, Any]] = {}
        self.executor = concurrent.futures.ThreadPoolExecutor(max_workers=4)
        self._frame_times: Dict[str, float] = {}  # Để tracking FPS

    async def get_stream_info(self, camera_id: str) -> Dict[str, Any]:
        """Lấy thông tin stream"""
        if camera_id in self.active_streams:
            stream = self.active_streams[camera_id]
            return {
                "is_streaming": stream.get("is_active", False),
                "status": "online" if stream.get("is_active") else "offline",
                "viewers_count": stream.get("viewers_count", 0),
                "uptime": time.time() - stream.get("start_time", time.time())
            }
        else:
            return {
                "is_streaming": False,
                "status": "offline",
                "viewers_count": 0,
                "uptime": 0
            }

    async def start_stream(self, camera_id: str, camera: CameraResponse) -> bool:
        """Bắt đầu stream camera"""
        try:
            if camera_id in self.active_streams:
                return True  # Already streaming
            
            # Initialize stream
            self.active_streams[camera_id] = {
                "camera": camera,
                "is_active": True,
                "start_time": time.time(),
                "viewers_count": 0,
                "cap": None
            }
            
            print(f"Stream started for camera: {camera.name}")
            return True
            
        except Exception as e:
            print(f"Error starting stream: {e}")
            return False

    async def stop_stream(self, camera_id: str) -> bool:
        """Dừng stream camera"""
        try:
            if camera_id in self.active_streams:
                stream = self.active_streams[camera_id]
                stream["is_active"] = False
                
                # Close camera capture if exists
                if stream.get("cap"):
                    stream["cap"].release()
                
                # Remove from active streams
                del self.active_streams[camera_id]
                
                print(f"Stream stopped for camera: {camera_id}")
                return True
            return False
            
        except Exception as e:
            print(f"Error stopping stream: {e}")
            return False

    async def generate_video_stream(self, camera_id: str, camera: CameraResponse) -> AsyncGenerator[bytes, None]:
        """Generate video stream frames"""
        try:
            # Ensure stream is started
            await self.start_stream(camera_id, camera)
            
            if camera.camera_type == "webcam":
                # Use webcam (index 0)
                cap = cv2.VideoCapture(0)
            elif camera.camera_url:
                # Use IP camera URL
                cap = cv2.VideoCapture(camera.camera_url)
            else:
                # Fallback to webcam
                cap = cv2.VideoCapture(0)
            
            if not cap.isOpened():
                # If real camera fails, generate dummy frames
                async for frame in self._generate_dummy_frames():
                    yield frame
                return
            
            # Store capture object
            if camera_id in self.active_streams:
                self.active_streams[camera_id]["cap"] = cap
            
            frame_count = 0
            while True:
                if camera_id not in self.active_streams or not self.active_streams[camera_id]["is_active"]:
                    break
                
                ret, frame = cap.read()
                if not ret:
                    print(f"Failed to read frame from camera {camera_id}")
                    # Generate dummy frame
                    frame = self._create_dummy_frame(f"Camera {camera.name} - No Signal")
                
                # Process frame (resize, add overlays, etc.)
                frame = await self._process_frame(frame, camera_id, camera)
                
                # Encode frame to JPEG
                _, buffer = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, 70])
                frame_bytes = buffer.tobytes()
                
                # Yield frame in multipart format
                yield (b'--frame\r\n'
                       b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
                
                frame_count += 1
                await asyncio.sleep(1/30)  # 30 FPS
                
        except Exception as e:
            print(f"Error in video stream: {e}")
            # Generate error frame
            async for frame in self._generate_error_frames(str(e)):
                yield frame
        finally:
            # Cleanup
            if 'cap' in locals():
                cap.release()

    async def _process_frame(self, frame: np.ndarray, camera_id: str, camera: CameraResponse) -> np.ndarray:
        """Process frame (add overlays, detection, etc.) - theo code mẫu"""
        try:
            # Tính FPS giống code mẫu
            current_time = time.time()
            if not hasattr(self, '_frame_times'):
                self._frame_times = {}
            
            if camera_id not in self._frame_times:
                self._frame_times[camera_id] = current_time
                fps = 0
            else:
                fps = 1.0 / (current_time - self._frame_times[camera_id])
                self._frame_times[camera_id] = current_time
            
            # Hiển thị FPS lên góc trên bên trái giống code mẫu
            cv2.putText(frame, f"FPS: {fps:.2f}", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
            
            # Add camera name
            cv2.putText(frame, f"Camera: {camera.name}", (10, 70), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
            
            # Add timestamp
            timestamp = time.strftime("%Y-%m-%d %H:%M:%S")
            cv2.putText(frame, timestamp, (10, frame.shape[0] - 10), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 1)
            
            # Face detection và recognition giống code mẫu
            if camera.detection_enabled:
                cv2.putText(frame, "DETECTION: ON", (frame.shape[1] - 150, 30), 
                           cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 1)
                
                try:
                    # Load known persons for recognition
                    known_persons = await self._get_known_persons_for_camera(camera_id)
                    
                    # Phát hiện và nhận dạng khuôn mặt giống code mẫu
                    detections = await face_processor.detect_and_recognize_faces(frame, known_persons)
                    
                    # Vẽ các khuôn mặt đã phát hiện và nhận dạng giống code mẫu
                    for detection in detections:
                        # Lấy bounding box
                        x, y, w, h = detection.get('bbox', [0, 0, 0, 0])
                        x1, y1, x2, y2 = x, y, x + w, y + h
                        
                        # Nhận dạng khuôn mặt
                        name = detection.get('person_name', 'Unknown')
                        confidence = detection.get('confidence', 0)
                        
                        # Màu khác nhau cho người đã biết và không xác định giống code mẫu
                        if name == "Unknown":
                            color = (0, 0, 255)  # Đỏ cho người lạ
                        else:
                            color = (0, 255, 0)  # Xanh lá cho người đã biết
                        
                        # Vẽ bounding box
                        cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)
                        
                        # Thêm tên và độ tin cậy giống code mẫu
                        label = f"{name} ({confidence:.2f})"
                        cv2.putText(frame, label, (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.8, color, 2)
                        
                        # Send detection alert via WebSocket if it's a new detection
                        if detection.get('person_id') and detection.get('is_new_detection'):
                            await self._send_detection_alert(camera_id, detection)
                    
                    # Add detection count overlay
                    detection_count = len(detections)
                    cv2.putText(frame, f"Faces: {detection_count}", (frame.shape[1] - 150, 60), 
                               cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 255), 1)
                    
                except Exception as detection_error:
                    print(f"Face detection error: {detection_error}")
                    cv2.putText(frame, "DETECTION: ERROR", (frame.shape[1] - 150, 30), 
                               cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 1)
            else:
                cv2.putText(frame, "DETECTION: OFF", (frame.shape[1] - 150, 30), 
                           cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 1)
            
            return frame
            
        except Exception as e:
            print(f"Error processing frame: {e}")
            return frame

    def _create_dummy_frame(self, message: str = "No Camera") -> np.ndarray:
        """Create dummy frame when camera is not available"""
        frame = np.zeros((480, 640, 3), dtype=np.uint8)
        cv2.putText(frame, message, (50, 240), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)
        cv2.putText(frame, time.strftime("%Y-%m-%d %H:%M:%S"), (50, 280), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 1)
        return frame

    async def _generate_dummy_frames(self) -> AsyncGenerator[bytes, None]:
        """Generate dummy frames for testing"""
        while True:
            frame = self._create_dummy_frame("Demo Camera - No Real Camera Connected")
            _, buffer = cv2.imencode('.jpg', frame)
            frame_bytes = buffer.tobytes()
            
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
            
            await asyncio.sleep(1/30)  # 30 FPS

    async def _generate_error_frames(self, error_message: str) -> AsyncGenerator[bytes, None]:
        """Generate error frames"""
        for _ in range(10):  # Show error for a few frames
            frame = self._create_dummy_frame(f"Error: {error_message}")
            _, buffer = cv2.imencode('.jpg', frame)
            frame_bytes = buffer.tobytes()
            
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
            
            await asyncio.sleep(1/5)  # 5 FPS for error

    async def capture_snapshot(self, camera_id: str, camera: CameraResponse) -> Optional[bytes]:
        """Chụp ảnh snapshot từ camera"""
        try:
            if camera.camera_type == "webcam":
                cap = cv2.VideoCapture(0)
            elif camera.camera_url:
                cap = cv2.VideoCapture(camera.camera_url)
            else:
                cap = cv2.VideoCapture(0)
            
            if not cap.isOpened():
                # Return dummy image
                frame = self._create_dummy_frame(f"Snapshot - {camera.name}")
                _, buffer = cv2.imencode('.jpg', frame)
                return buffer.tobytes()
            
            ret, frame = cap.read()
            cap.release()
            
            if ret:
                # Process frame
                frame = await self._process_frame(frame, camera_id, camera)
                _, buffer = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, 90])
                return buffer.tobytes()
            else:
                return None
                
        except Exception as e:
            print(f"Error capturing snapshot: {e}")
            return None

    async def get_stream_status(self, camera_id: str) -> Dict[str, Any]:
        """Lấy trạng thái chi tiết của stream"""
        if camera_id in self.active_streams:
            stream = self.active_streams[camera_id]
            return {
                "is_streaming": stream.get("is_active", False),
                "is_recording": False,  # TODO: Implement recording
                "viewers_count": stream.get("viewers_count", 0),
                "uptime": time.time() - stream.get("start_time", time.time()),
                "frame_rate": 30,  # TODO: Calculate actual FPS
                "resolution": "640x480"  # TODO: Get actual resolution
            }
        else:
            return {
                "is_streaming": False,
                "is_recording": False,
                "viewers_count": 0,
                "uptime": 0,
                "frame_rate": 0,
                "resolution": "Unknown"
            }

    async def _send_detection_alert(self, camera_id: str, detection: Dict[str, Any]):
        """Send detection alert via WebSocket"""
        try:
            alert_message = {
                "type": "detection_alert",
                "data": {
                    "camera_id": camera_id,
                    "person_id": detection.get('person_id'),
                    "person_name": detection.get('person_name', 'Unknown'),
                    "confidence": detection.get('confidence', 0),
                    "timestamp": time.time(),
                    "bbox": detection.get('bbox')
                }
            }
            
            # Send to all connected clients (you might want to filter by user)
            await websocket_manager.broadcast_message(alert_message)
            
        except Exception as e:
            print(f"Error sending detection alert: {e}")

    async def _get_known_persons_for_camera(self, camera_id: str) -> List[dict]:
        """Get known persons data for face recognition"""
        try:
            # Import here to avoid circular imports
            from ..database import get_database
            from bson import ObjectId
            
            db = get_database()
            known_persons = []
            
            print(f"🔵 Loading known persons for camera {camera_id}...")
            
            # Get all known persons (you might want to filter by camera or user)
            async for person_data in db.known_persons.find({"is_active": True}):
                # Convert embeddings - backend lưu trong field 'face_embeddings'
                embeddings = []
                if 'face_embeddings' in person_data and person_data['face_embeddings']:
                    for emb_data in person_data['face_embeddings']:
                        if isinstance(emb_data, str) and emb_data:
                            # If stored as base64, decode it
                            try:
                                emb_bytes = base64.b64decode(emb_data)
                                emb_array = np.frombuffer(emb_bytes, dtype=np.float32)
                                embeddings.append(emb_array)
                            except Exception as e:
                                print(f"Error decoding base64 embedding: {e}")
                        elif isinstance(emb_data, list) and emb_data:
                            # If stored as list, convert to numpy array
                            try:
                                embeddings.append(np.array(emb_data, dtype=np.float32))
                            except Exception as e:
                                print(f"Error converting list to array: {e}")
                
                if embeddings:
                    known_persons.append({
                        'id': str(person_data['_id']),
                        'name': person_data['name'],
                        'embeddings': embeddings
                    })
                    print(f"✅ Loaded person: {person_data['name']} with {len(embeddings)} embeddings")
                else:
                    print(f"⚠️ Person {person_data['name']} has no valid embeddings")
            
            print(f"✅ Loaded {len(known_persons)} known persons for recognition")
            return known_persons
            
        except Exception as e:
            print(f"❌ Error loading known persons: {e}")
            import traceback
            traceback.print_exc()
            return []

# Global instance
stream_processor = StreamProcessor()