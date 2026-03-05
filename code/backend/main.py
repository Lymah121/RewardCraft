"""
RewardCraft Backend - FastAPI Application
Main entry point for the server
"""

from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from api.routes import router as api_router
from api.websocket import handle_training_websocket
import uvicorn


# Create FastAPI app
app = FastAPI(
    title="RewardCraft API",
    description="Educational AI tool for teaching Reinforcement Learning through tower defense",
    version="1.0.0"
)

# Configure CORS for local development
# In production, restrict origins appropriately
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # React dev servers
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include REST API routes
app.include_router(api_router)


# WebSocket endpoint for training
@app.websocket("/ws/training")
async def websocket_training_endpoint(websocket: WebSocket):
    """
    WebSocket endpoint for real-time training updates.

    Connect to this endpoint to:
    - Start training sessions
    - Receive live updates during training
    - Stop training
    - Get current status

    See api/websocket.py for protocol details
    """
    await handle_training_websocket(websocket)


# Root endpoint
@app.get("/")
async def root():
    """Welcome message and API information"""
    return {
        "message": "Welcome to RewardCraft API",
        "version": "1.0.0",
        "docs": "/docs",
        "api_endpoints": "/api/...",
        "websocket": "/ws/training"
    }


# Run server if executed directly
if __name__ == "__main__":
    print("🎮 Starting RewardCraft Backend...")
    print("📚 API Documentation: http://localhost:8000/docs")
    print("🔌 WebSocket endpoint: ws://localhost:8000/ws/training")
    print("🌐 CORS enabled for: http://localhost:3000, http://localhost:5173")

    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,  # Auto-reload on file changes during development
        reload_excludes=[".venv/*", "__pycache__/*", "logs/*"],
        log_level="info"
    )
