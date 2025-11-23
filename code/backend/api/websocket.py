"""
WebSocket handler for real-time training updates
Sends live updates during training for visualization
"""

from fastapi import WebSocket, WebSocketDisconnect
from typing import Dict, Set
import asyncio
import json
import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from ai import QLearningAgent, RewardCalculator, TrainingCoordinator
from game import StateEncoder


class ConnectionManager:
    """Manages WebSocket connections for training updates"""

    def __init__(self):
        self.active_connections: Set[WebSocket] = set()

    async def connect(self, websocket: WebSocket):
        """Accept a new WebSocket connection"""
        await websocket.accept()
        self.active_connections.add(websocket)

    def disconnect(self, websocket: WebSocket):
        """Remove a WebSocket connection"""
        self.active_connections.discard(websocket)

    async def send_message(self, message: Dict, websocket: WebSocket):
        """Send message to a specific connection"""
        try:
            await websocket.send_json(message)
        except Exception as e:
            print(f"Error sending message: {e}")
            self.disconnect(websocket)

    async def broadcast(self, message: Dict):
        """Send message to all connected clients"""
        disconnected = set()

        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception as e:
                print(f"Error broadcasting to connection: {e}")
                disconnected.add(connection)

        # Clean up disconnected clients
        for connection in disconnected:
            self.disconnect(connection)


# Global connection manager
manager = ConnectionManager()

# Training state
_current_trainer: TrainingCoordinator = None
_training_task: asyncio.Task = None


async def training_progress_callback(update: Dict):
    """
    Callback function for training updates.
    Broadcasts updates to all connected WebSocket clients.
    """
    await manager.broadcast(update)


async def handle_training_websocket(websocket: WebSocket):
    """
    Main WebSocket handler for training sessions.

    Protocol:
    - Client sends: {"command": "start_training", "config": {...}}
    - Server sends: Real-time training updates
    - Client sends: {"command": "stop_training"}
    - Server sends: Final summary
    """
    await manager.connect(websocket)

    try:
        while True:
            # Receive commands from client
            data = await websocket.receive_json()
            command = data.get("command")

            if command == "start_training":
                await handle_start_training(websocket, data)

            elif command == "stop_training":
                await handle_stop_training(websocket)

            elif command == "get_status":
                await handle_get_status(websocket)

            elif command == "ping":
                await websocket.send_json({"type": "pong"})

            else:
                await websocket.send_json({
                    "type": "error",
                    "message": f"Unknown command: {command}"
                })

    except WebSocketDisconnect:
        manager.disconnect(websocket)
        print("Client disconnected")

    except Exception as e:
        print(f"WebSocket error: {e}")
        await websocket.send_json({
            "type": "error",
            "message": str(e)
        })
        manager.disconnect(websocket)


async def handle_start_training(websocket: WebSocket, data: Dict):
    """Start a new training session"""
    global _current_trainer, _training_task

    # Check if training is already running
    if _training_task and not _training_task.done():
        await websocket.send_json({
            "type": "error",
            "message": "Training already in progress"
        })
        return

    try:
        # Extract configuration
        num_episodes = data.get("num_episodes", 100)
        reward_config = data.get("reward_config", {})
        speed_multiplier = data.get("speed_multiplier", 1.0)

        # Initialize components
        agent = QLearningAgent(
            n_actions=5,
            learning_rate=data.get("learning_rate", 0.1),
            discount_factor=data.get("discount_factor", 0.95),
            epsilon=data.get("epsilon", 0.1)
        )

        state_encoder = StateEncoder()
        reward_calculator = RewardCalculator(reward_config)

        # Create trainer with callback
        _current_trainer = TrainingCoordinator(
            agent=agent,
            state_encoder=state_encoder,
            reward_calculator=reward_calculator,
            progress_callback=training_progress_callback
        )

        # Send training started confirmation
        await websocket.send_json({
            "type": "training_started",
            "num_episodes": num_episodes,
            "speed_multiplier": speed_multiplier,
            "reward_config": reward_config
        })

        # Start training in background task
        _training_task = asyncio.create_task(
            run_training_async(num_episodes, speed_multiplier)
        )

    except Exception as e:
        await websocket.send_json({
            "type": "error",
            "message": f"Failed to start training: {str(e)}"
        })


async def run_training_async(num_episodes: int, speed_multiplier: float):
    """Run training in async context"""
    global _current_trainer

    try:
        # Run training (this will call progress_callback for updates)
        summary = await asyncio.to_thread(
            _current_trainer.train,
            num_episodes=num_episodes,
            speed_multiplier=speed_multiplier
        )

        # Send final summary
        await manager.broadcast({
            "type": "training_complete",
            "summary": summary
        })

    except Exception as e:
        await manager.broadcast({
            "type": "error",
            "message": f"Training error: {str(e)}"
        })


async def handle_stop_training(websocket: WebSocket):
    """Stop current training session"""
    global _current_trainer, _training_task

    if _current_trainer:
        _current_trainer.stop_training()

        await websocket.send_json({
            "type": "training_stopped",
            "message": "Training will stop after current episode"
        })
    else:
        await websocket.send_json({
            "type": "error",
            "message": "No training in progress"
        })


async def handle_get_status(websocket: WebSocket):
    """Get current training status"""
    global _current_trainer

    if _current_trainer:
        progress = _current_trainer.get_current_progress()
        await websocket.send_json({
            "type": "status",
            "data": progress
        })
    else:
        await websocket.send_json({
            "type": "status",
            "data": {
                "is_training": False,
                "current_episode": 0,
                "total_episodes": 0
            }
        })
