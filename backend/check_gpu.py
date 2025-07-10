import torch
import onnxruntime as ort
import cv2
import numpy as np

def check_gpu_support():
    print("=" * 50)
    print("GPU Support Check for SafeFace")
    print("=" * 50)
    
    # Check CUDA availability
    print("\n1. CUDA Support:")
    if torch.cuda.is_available():
        print(f"   ✅ CUDA is available")
        print(f"   📱 GPU Device: {torch.cuda.get_device_name(0)}")
        print(f"   🔢 CUDA Version: {torch.version.cuda}")
        print(f"   💾 GPU Memory: {torch.cuda.get_device_properties(0).total_memory / 1024**3:.1f} GB")
    else:
        print("   ❌ CUDA is not available")
    
    # Check ONNX Runtime providers
    print("\n2. ONNX Runtime Providers:")
    providers = ort.get_available_providers()
    for provider in providers:
        if 'CUDA' in provider:
            print(f"   ✅ {provider}")
        elif 'Dml' in provider:
            print(f"   ✅ {provider} (DirectML)")
        else:
            print(f"   📋 {provider}")
    
    # Check if we can use GPU for face recognition
    print("\n3. Face Recognition GPU Test:")
    try:
        from insightface.app import FaceAnalysis
        
        if 'CUDAExecutionProvider' in providers:
            app = FaceAnalysis(providers=['CUDAExecutionProvider', 'CPUExecutionProvider'])
            app.prepare(ctx_id=0, det_size=(640, 640))
            print("   ✅ GPU-accelerated face recognition is ready")
        else:
            app = FaceAnalysis(providers=['CPUExecutionProvider'])
            app.prepare(ctx_id=-1, det_size=(640, 640))
            print("   ⚠️  Using CPU-only face recognition")
            
    except Exception as e:
        print(f"   ❌ Error initializing face recognition: {e}")
    
    # Performance recommendation
    print("\n4. Performance Recommendations:")
    if torch.cuda.is_available() and 'CUDAExecutionProvider' in providers:
        print("   🚀 Your system is optimized for GPU acceleration!")
        print("   💡 Expected performance: High FPS, low latency")
    else:
        print("   ⚠️  Your system will use CPU processing")
        print("   💡 Consider installing CUDA and GPU drivers for better performance")
        print("   📋 To install GPU support, run: python -m pip install onnxruntime-gpu")
    
    print("\n" + "=" * 50)

if __name__ == "__main__":
    check_gpu_support()
