import cv2
import numpy as np
import insightface
from insightface.app import FaceAnalysis
import faiss
from typing import List, Tuple, Optional
import asyncio
import concurrent.futures
import gc
import torch

class FaceProcessorService:
    def __init__(self):
        self.face_app = FaceAnalysis(providers=['CUDAExecutionProvider', 'CPUExecutionProvider'])
        self.face_app.prepare(  ctx_id=0, det_size=(640, 640))
        self.executor = concurrent.futures.ThreadPoolExecutor(max_workers=2)

    def cleanup(self):
        """Giải phóng tài nguyên"""
        try:
            if hasattr(self, 'face_app'):
                del self.face_app
            if hasattr(self, 'executor'):
                self.executor.shutdown(wait=True)
            gc.collect()
            if torch.cuda.is_available():
                torch.cuda.empty_cache()
        except:
            pass

    async def extract_face_embedding(self, image_data: bytes) -> Optional[np.ndarray]:
        """Trích xuất embedding từ ảnh"""
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(
            self.executor, 
            self._extract_face_embedding_sync, 
            image_data
        )

    def _extract_face_embedding_sync(self, image_data: bytes) -> Optional[np.ndarray]:
        """Trích xuất embedding (sync version)"""
        try:
            # Decode image
            nparr = np.frombuffer(image_data, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if img is None:
                return None

            faces = self.face_app.get(img)
            if not faces:
                return None

            # Lấy face có độ tin cậy cao nhất
            face = max(faces, key=lambda x: x.det_score)
            return face.embedding
        except Exception as e:
            print(f"Error extracting face embedding: {e}")
            return None

    async def detect_faces_in_frame(self, frame: np.ndarray) -> List[dict]:
        """Phát hiện khuôn mặt trong frame"""
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(
            self.executor,
            self._detect_faces_sync,
            frame
        )

    def _detect_faces_sync(self, frame: np.ndarray) -> List[dict]:
        """Phát hiện khuôn mặt (sync version)"""
        try:
            faces = self.face_app.get(frame)
            result = []
            for face in faces:
                result.append({
                    'bbox': face.bbox.tolist(),
                    'embedding': face.embedding,
                    'confidence': float(face.det_score)
                })
            return result
        except Exception as e:
            print(f"Error detecting faces: {e}")
            return []

    def create_face_index(self, embeddings: List[np.ndarray]) -> faiss.Index:
        """Tạo FAISS index từ danh sách embeddings"""
        if not embeddings:
            return None
        
        embeddings_array = np.array(embeddings).astype('float32')
        # Chuẩn hóa để sử dụng cosine similarity
        faiss.normalize_L2(embeddings_array)
        
        # Tạo index
        index = faiss.IndexFlatIP(embeddings_array.shape[1])
        index.add(embeddings_array)
        return index

    def search_similar_face(self, query_embedding: np.ndarray, index: faiss.Index, threshold: float = 0.6) -> Tuple[bool, float]:
        """Tìm kiếm khuôn mặt tương tự"""
        if index is None:
            return False, 0.0
        
        # Chuẩn hóa query embedding
        query = query_embedding.astype('float32').reshape(1, -1)
        faiss.normalize_L2(query)
        
        # Tìm kiếm
        distances, indices = index.search(query, 1)
        
        if len(distances[0]) > 0:
            similarity = distances[0][0]
            return similarity > threshold, float(similarity)
        
        return False, 0.0

# Global instance
face_processor = FaceProcessorService()