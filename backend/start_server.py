#!/usr/bin/env python3
"""
Start SafeFace backend server with proper configuration
"""
import uvicorn
import os

if __name__ == "__main__":
    # Change to backend directory
    backend_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(backend_dir)
    
    # Start server with increased limits
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        access_log=True,
        # Increase limits for large requests
        limit_concurrency=1000,
        limit_max_requests=1000,
        timeout_keep_alive=30,
        # Large request body support
        h11_max_incomplete_event_size=50 * 1024 * 1024  # 50MB
    )
