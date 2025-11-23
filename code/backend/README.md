# RewardCraft Backend

FastAPI backend for the RewardCraft educational AI tool.

## Quick Start

### 1. Install Dependencies (using uv)

```bash
# Install uv if not already installed
curl -LsSf https://astral.sh/uv/install.sh | sh

# Create virtual environment
uv venv

# Activate virtual environment
source .venv/bin/activate  # On macOS/Linux
# OR
.venv\Scripts\activate  # On Windows

# Install dependencies
uv pip install fastapi uvicorn pydantic websockets httpx
```

### 2. Run Tests

```bash
# Test core components
python test_core.py

# Test API endpoints
python test_api.py
```

### 3. Start Server

```bash
python main.py
```

The server will start at:
- **API**: http://localhost:8000
- **Interactive Docs**: http://localhost:8000/docs
- **WebSocket**: ws://localhost:8000/ws/training

## Project Structure

```
backend/
├── game/              # Tower defense game engine
│   ├── engine.py      # Core game logic
│   └── state_encoder.py  # State discretization
├── ai/                # Reinforcement learning
│   ├── q_learning.py  # Q-learning algorithm
│   ├── reward_function.py  # Reward calculator
│   └── trainer.py     # Training coordinator
├── api/               # REST & WebSocket API
│   ├── routes.py      # HTTP endpoints
│   └── websocket.py   # Real-time updates
├── main.py            # FastAPI application
├── test_core.py       # Core component tests
└── test_api.py        # API endpoint tests
```

## API Endpoints

### REST API

All REST endpoints are prefixed with `/api`

#### Initialization
- `POST /api/initialize` - Initialize game and AI components
- `POST /api/reset` - Reset current training session

#### Game State
- `GET /api/game/state` - Get current game state
- `POST /api/game/action/{action_name}` - Execute manual action

#### AI & Q-Learning
- `GET /api/ai/q-table` - Get Q-table for visualization
- `POST /api/ai/reward-config` - Update reward configuration
- `GET /api/ai/reward-config` - Get current reward config

#### Training
- `GET /api/training/status` - Get training progress
- `GET /api/training/history` - Get complete training history

#### Info
- `GET /api/info` - Game and AI specifications
- `GET /api/health` - Health check

### WebSocket API

Connect to `ws://localhost:8000/ws/training` for real-time training updates.

#### Client Commands (send to server)
```json
// Start training
{
  "command": "start_training",
  "num_episodes": 100,
  "reward_config": {
    "enemy_defeated": 10,
    "enemy_reached_base": -50,
    "tower_built": -2,
    "gold_saved": 1,
    "wave_completed": 20
  },
  "speed_multiplier": 1.0
}

// Stop training
{
  "command": "stop_training"
}

// Get status
{
  "command": "get_status"
}

// Ping (heartbeat)
{
  "command": "ping"
}
```

#### Server Updates (received from server)
```json
// Training started
{
  "type": "training_started",
  "num_episodes": 100,
  "reward_config": {...}
}

// Episode start
{
  "type": "episode_start",
  "episode": 1,
  "state": {...},
  "game_state": {...}
}

// Step (each AI action)
{
  "type": "step",
  "episode": 1,
  "step": 5,
  "state": "state_2_0_0_0_1",
  "action": "BUILD_LEFT",
  "reward": 10,
  "reward_breakdown": {...},
  "new_state": "state_1_0_1_0_1",
  "q_value_old": 0.0,
  "q_value_new": 1.0,
  "game_state": {...}
}

// Episode complete
{
  "type": "episode_end",
  "episode": 1,
  "total_reward": 125.5,
  "victory": true,
  "steps": 45
}

// Training complete
{
  "type": "training_complete",
  "summary": {
    "total_episodes": 100,
    "episode_rewards": [...],
    "final_stats": {...}
  }
}
```

## Game Specification

### Tower Defense Mechanics
- **Grid**: 10x10
- **Path**: Row 5 (left to right)
- **Waves**: 3 waves (5, 7, 10 enemies)
- **Starting Resources**: 100 gold, 20 lives
- **Tower Cost**: 50 gold
- **Tower Damage**: 10 HP
- **Tower Range**: 2 tiles (Manhattan distance)
- **Enemy HP**: 30
- **Enemy Speed**: 1 tile/second
- **Gold Reward**: 20 per enemy killed

### AI Actions (5 total)
1. `BUILD_LEFT` - Build tower in columns 1-3
2. `BUILD_CENTER` - Build tower in columns 4-6
3. `BUILD_RIGHT` - Build tower in columns 7-8
4. `SAVE` - Do nothing, save gold
5. `SELL_OLDEST` - Sell oldest tower for 35 gold

### State Space
- **Total States**: 162 (3×3×3×3×2)
- **Variables**:
  - Gold level: Poor/Okay/Rich (0-2)
  - Enemies: None/Few/Many (0-2)
  - Towers: None/Few/Many (0-2)
  - Wave: Early/Middle/Late (0-2)
  - Last action: Failed/Success (0-1)

### Reward Configuration
Default rewards (adjustable by students):
- Enemy defeated: +10
- Enemy reached base: -50
- Tower built: -2
- Gold saved: +1 (per 10 gold)
- Wave completed: +20
- Game won: +100
- Game lost: -100

## Development

### Testing
```bash
# Test individual components
python -c "from game.engine import TowerDefenseGame; g = TowerDefenseGame(); print('Game OK')"
python -c "from ai.q_learning import QLearningAgent; a = QLearningAgent(); print('Agent OK')"

# Run full test suite
python test_core.py
python test_api.py
```

### Interactive API Testing
Visit http://localhost:8000/docs for interactive API documentation (Swagger UI).

### Debug Mode
The server runs with auto-reload enabled during development. Any code changes will automatically restart the server.

## Architecture Notes

### Why This Design?

1. **Tabular Q-Learning**: Simple, interpretable, perfect for education
2. **Discrete States**: Only 162 states, can visualize all of them
3. **Deterministic Game**: Same action in same state = same result
4. **WebSocket Updates**: Real-time visualization of learning
5. **Configurable Rewards**: Students design AI behavior

### Educational Focus

Every component is designed for clarity:
- Human-readable state labels
- Transparent reward calculations
- Q-value updates visible
- Complete episode tracking

## Next Steps

After backend is running:
1. Build React frontend
2. Connect WebSocket for real-time updates
3. Visualize Q-table as heatmap
4. Add reward designer sliders
5. Show learning progress graphs

## Troubleshooting

### Port Already in Use
```bash
# Find process using port 8000
lsof -i :8000

# Kill it
kill -9 <PID>

# Or run on different port
uvicorn main:app --port 8001
```

### Import Errors
Make sure you're in the virtual environment:
```bash
source .venv/bin/activate
which python  # Should point to .venv/bin/python
```

### WebSocket Connection Issues
- Check CORS settings in `main.py`
- Ensure frontend is running on allowed origin
- Check browser console for connection errors

## License

Educational project for teaching Reinforcement Learning concepts.
