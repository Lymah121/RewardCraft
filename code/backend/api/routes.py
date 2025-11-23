"""
REST API routes for RewardCraft
Implements all endpoints from API_SPECIFICATION.md
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, List, Optional
import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from ai import QLearningAgent, RewardCalculator, TrainingCoordinator
from game import TowerDefenseGame, StateEncoder

# Request/Response models
class RewardConfig(BaseModel):
    """Student's reward configuration"""
    enemy_defeated: int = 10
    enemy_reached_base: int = -50
    tower_built: int = -2
    gold_saved: int = 1
    wave_completed: int = 20
    game_won: int = 100
    game_lost: int = -100


class TrainingRequest(BaseModel):
    """Request to start training"""
    num_episodes: int = 100
    reward_config: Optional[RewardConfig] = None
    speed_multiplier: float = 1.0


class GameStateResponse(BaseModel):
    """Current game state"""
    gold: int
    lives: int
    current_wave: int
    total_waves: int
    enemies: List[Dict]
    towers: List[Dict]
    game_over: bool
    victory: bool


class QTableResponse(BaseModel):
    """Q-table for visualization"""
    states: List[str]
    actions: List[str]
    q_values: List[List[float]]
    state_labels: Dict[str, str]
    statistics: Dict
    state_space_size: int
    states_visited: int


class TrainingStatusResponse(BaseModel):
    """Current training status"""
    is_training: bool
    current_episode: int
    total_episodes: int
    progress_percent: float
    stats: Dict


# Create router
router = APIRouter(prefix="/api", tags=["game"])

# Global state (in production, this would use proper session management)
_agent: Optional[QLearningAgent] = None
_state_encoder: Optional[StateEncoder] = None
_reward_calculator: Optional[RewardCalculator] = None
_trainer: Optional[TrainingCoordinator] = None


def _initialize_components(reward_config: Optional[RewardConfig] = None):
    """Initialize or reinitialize components"""
    global _agent, _state_encoder, _reward_calculator, _trainer

    _agent = QLearningAgent(
        n_actions=5,
        learning_rate=0.1,
        discount_factor=0.95,
        epsilon=0.1
    )

    _state_encoder = StateEncoder()

    reward_dict = reward_config.dict() if reward_config else {}
    _reward_calculator = RewardCalculator(reward_dict)


@router.post("/initialize")
async def initialize(reward_config: Optional[RewardConfig] = None):
    """
    Initialize or reset the game and AI components.

    This endpoint:
    - Creates fresh Q-learning agent
    - Resets reward calculator
    - Clears training history
    """
    _initialize_components(reward_config)

    return {
        "status": "initialized",
        "message": "Game and AI components ready",
        "state_space_size": _state_encoder.get_state_space_size(),
        "actions": _agent.action_names,
        "reward_config": reward_config.dict() if reward_config else _reward_calculator.config
    }


@router.post("/reset")
async def reset():
    """Reset the current training session"""
    if _agent is None:
        raise HTTPException(status_code=400, detail="Not initialized. Call /initialize first")

    _agent.reset()

    return {
        "status": "reset",
        "message": "Q-table and statistics cleared"
    }


@router.get("/game/state")
async def get_game_state():
    """
    Get current game state (for manual play mode).
    In training mode, this is sent via WebSocket.
    """
    # Create temporary game for demonstration
    game = TowerDefenseGame()

    state = game.get_state()

    return GameStateResponse(**state)


@router.post("/game/action/{action_name}")
async def execute_action(action_name: str):
    """
    Execute a manual action (for testing/demonstration).
    In training mode, the AI chooses actions automatically.
    """
    game = TowerDefenseGame()

    try:
        result = game.execute_action(action_name)
        return {
            "action": action_name,
            "success": result,
            "new_state": game.get_state()
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/ai/q-table")
async def get_q_table():
    """Get current Q-table for visualization"""
    if _agent is None:
        raise HTTPException(status_code=400, detail="Not initialized. Call /initialize first")

    q_table_viz = _agent.get_q_table_for_visualization()

    return QTableResponse(
        **q_table_viz,
        state_space_size=_state_encoder.get_state_space_size(),
        states_visited=len(_agent.q_table)
    )


@router.post("/ai/reward-config")
async def update_reward_config(reward_config: RewardConfig):
    """
    Update reward configuration.
    This is the main interface for students to design rewards.
    """
    if _reward_calculator is None:
        _initialize_components(reward_config)
    else:
        _reward_calculator.update_config(reward_config.dict())

    return {
        "status": "updated",
        "new_config": _reward_calculator.config,
        "message": "Reward configuration updated. Start new training to see effects."
    }


@router.get("/ai/reward-config")
async def get_reward_config():
    """Get current reward configuration"""
    if _reward_calculator is None:
        raise HTTPException(status_code=400, detail="Not initialized. Call /initialize first")

    return {
        "config": _reward_calculator.config
    }


@router.get("/training/status")
async def get_training_status():
    """Get current training status"""
    if _trainer is None:
        return TrainingStatusResponse(
            is_training=False,
            current_episode=0,
            total_episodes=0,
            progress_percent=0.0,
            stats={}
        )

    progress = _trainer.get_current_progress()
    return TrainingStatusResponse(**progress)


@router.get("/training/history")
async def get_training_history():
    """Get complete training history for graphs"""
    if _trainer is None:
        return {
            "episode_rewards": [],
            "episode_victories": [],
            "episode_lengths": []
        }

    return {
        "episode_rewards": _trainer.episode_rewards,
        "episode_victories": _trainer.episode_victories,
        "episode_lengths": _trainer.episode_lengths,
        "stats": _trainer._get_current_stats()
    }


@router.get("/info")
async def get_info():
    """Get general information about the game and AI"""
    return {
        "game": {
            "grid_size": "10x10",
            "path": "Row 5",
            "waves": 3,
            "starting_gold": 100,
            "starting_lives": 20
        },
        "ai": {
            "algorithm": "Tabular Q-Learning",
            "state_space_size": 162,
            "actions": [
                "BUILD_LEFT",
                "BUILD_CENTER",
                "BUILD_RIGHT",
                "SAVE",
                "SELL_OLDEST"
            ],
            "learning_rate": 0.1,
            "discount_factor": 0.95,
            "epsilon": 0.1
        }
    }


# Health check
@router.get("/health")
async def health_check():
    """Simple health check endpoint"""
    return {
        "status": "healthy",
        "initialized": _agent is not None
    }
