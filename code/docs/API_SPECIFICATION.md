# API Specification - RewardCraft Tower Defense

## Base Configuration
- **Backend URL**: `http://localhost:8000`
- **WebSocket URL**: `ws://localhost:8000/ws`
- **Frontend URL**: `http://localhost:3000`

## REST API Endpoints

### 1. Game Management

#### GET /api/game/state
Get current game state
```json
Response:
{
  "grid": [[0, 1, 0, ...], ...],  // 10x10 grid
  "enemies": [
    {"id": 1, "x": 5, "y": 0, "hp": 30, "max_hp": 30, "type": "basic"}
  ],
  "towers": [
    {"id": 1, "x": 3, "y": 5, "type": "basic", "kills": 2}
  ],
  "resources": {
    "gold": 150,
    "lives": 20
  },
  "wave": {
    "current": 2,
    "total": 3,
    "enemies_remaining": 5,
    "in_progress": true
  }
}
```

#### POST /api/game/reset
Reset game to initial state
```json
Request: {}
Response: {
  "success": true,
  "state": { /* initial game state */ }
}
```

#### POST /api/game/action
Execute a manual action (for testing)
```json
Request: {
  "action": "BUILD_LEFT"  // One of 5 actions
}
Response: {
  "success": true,
  "reward": -2,
  "new_state": { /* game state */ }
}
```

### 2. Training Management

#### POST /api/training/start
Start training the AI
```json
Request: {
  "reward_config": {
    "enemy_defeated": 10,
    "enemy_reached_base": -50,
    "tower_built": -2,
    "gold_saved": 1,
    "wave_completed": 20
  },
  "episodes": 100,
  "learning_rate": 0.1,  // Phase 4 only
  "epsilon": 0.1         // Phase 4 only
}

Response: {
  "training_id": "abc123",
  "status": "started"
}
```

#### GET /api/training/{training_id}/status
Get training status
```json
Response: {
  "training_id": "abc123",
  "status": "in_progress",  // or "completed", "failed"
  "current_episode": 45,
  "total_episodes": 100,
  "average_reward": 125.3,
  "win_rate": 0.65
}
```

#### POST /api/training/stop
Stop current training
```json
Request: {
  "training_id": "abc123"
}
Response: {
  "success": true
}
```

### 3. Q-Learning Data

#### GET /api/ai/qtable
Get current Q-table
```json
Response: {
  "q_table": {
    "state_0_0_0_0_0": {
      "BUILD_LEFT": 5.2,
      "BUILD_CENTER": 3.1,
      "BUILD_RIGHT": 2.8,
      "SAVE": 8.5,
      "SELL_OLDEST": -1.2
    },
    /* ... more states ... */
  },
  "state_labels": {
    "state_0_0_0_0_0": "Poor | No enemies | No towers | Early | Failed"
  },
  "total_states": 162,
  "explored_states": 45
}
```

#### GET /api/ai/state
Get current AI state encoding
```json
Response: {
  "raw_state": { /* game state */ },
  "encoded_state": "state_2_1_2_1_1",
  "state_description": "Rich | Few enemies | Many towers | Middle | Success",
  "valid_actions": ["BUILD_LEFT", "BUILD_RIGHT", "SAVE", "SELL_OLDEST"],
  "q_values": {
    "BUILD_LEFT": 2.3,
    "BUILD_RIGHT": 2.1,
    "SAVE": 5.7,
    "SELL_OLDEST": -0.5
  },
  "best_action": "SAVE",
  "exploration_probability": 0.1
}
```

### 4. Analytics

#### GET /api/analytics/episodes
Get episode history
```json
Response: {
  "episodes": [
    {
      "episode": 1,
      "total_reward": -50,
      "survived_waves": 0,
      "enemies_defeated": 2,
      "gold_earned": 40,
      "gold_spent": 100,
      "result": "defeat"
    },
    /* ... more episodes ... */
  ]
}
```

#### GET /api/analytics/learning
Get learning metrics
```json
Response: {
  "learning_curve": [
    {"episode": 1, "reward": -50},
    {"episode": 2, "reward": -30},
    /* ... */
  ],
  "strategy_metrics": {
    "build_frequency": 0.3,  // Actions per episode
    "save_frequency": 0.5,
    "sell_frequency": 0.2,
    "preferred_position": "CENTER"
  },
  "performance": {
    "best_episode": 85,
    "best_reward": 250,
    "current_streak": 5,
    "improvement_rate": 1.2  // Reward per episode
  }
}
```

## WebSocket API

### Connection
```javascript
const ws = new WebSocket('ws://localhost:8000/ws');
```

### Message Types

#### Server → Client

##### training_update
Sent every 10 episodes or on significant events
```json
{
  "type": "training_update",
  "data": {
    "episode": 50,
    "reward": 120,
    "q_table_changes": [
      {"state": "state_1_1_1_0_1", "action": "BUILD_LEFT", "old_q": 2.1, "new_q": 3.5}
    ],
    "action_taken": "BUILD_CENTER",
    "state_before": "state_1_1_1_0_0",
    "state_after": "state_1_1_1_1_1"
  }
}
```

##### game_update
Real-time game state during training
```json
{
  "type": "game_update",
  "data": {
    "enemies": [ /* current enemies */ ],
    "towers": [ /* current towers */ ],
    "gold": 120,
    "lives": 18,
    "last_action": "BUILD_LEFT",
    "last_reward": -2
  }
}
```

##### episode_complete
When an episode finishes
```json
{
  "type": "episode_complete",
  "data": {
    "episode": 50,
    "total_reward": 150,
    "waves_survived": 3,
    "result": "victory"
  }
}
```

##### training_complete
When all episodes finish
```json
{
  "type": "training_complete",
  "data": {
    "total_episodes": 100,
    "final_win_rate": 0.8,
    "best_reward": 250,
    "final_strategy": "balanced"
  }
}
```

#### Client → Server

##### start_training
```json
{
  "type": "start_training",
  "data": {
    "reward_config": { /* rewards */ },
    "episodes": 100
  }
}
```

##### pause_training
```json
{
  "type": "pause_training"
}
```

##### resume_training
```json
{
  "type": "resume_training"
}
```

##### adjust_speed
```json
{
  "type": "adjust_speed",
  "data": {
    "speed": 2.0  // 1.0 = normal, 2.0 = 2x speed
  }
}
```

## Data Formats

### State Encoding
```javascript
// Format: state_{gold}_{enemies}_{towers}_{wave}_{success}
// Example: state_2_1_2_0_1
//   gold=2 (rich)
//   enemies=1 (few)
//   towers=2 (many)
//   wave=0 (early)
//   success=1 (last action succeeded)
```

### Action Encoding
```javascript
const ACTIONS = [
  "BUILD_LEFT",    // index 0
  "BUILD_CENTER",  // index 1
  "BUILD_RIGHT",   // index 2
  "SAVE",          // index 3
  "SELL_OLDEST"    // index 4
];
```

### Reward Configuration
```javascript
{
  // Phase 1 - Simple rewards
  "enemy_defeated": 10,        // Per enemy
  "enemy_reached_base": -50,   // Per enemy
  "tower_built": -2,            // Per tower
  "gold_saved": 1,              // Per 10 gold saved
  "wave_completed": 20,         // Per wave

  // Phase 2 - Additional rewards
  "fast_enemy_defeated": 15,   // Bonus for fast enemies
  "interest_earned": 5,         // Gold interest
  "perfect_wave": 50,           // No damage taken

  // Phase 3 - Conditional rewards (sent as JSON)
  "conditions": [
    {
      "if": {"wave": "<5", "gold": ">100"},
      "then": {"action": "BUILD_ECONOMY", "reward": 30}
    }
  ],

  // Phase 4 - Custom function (sent as string)
  "custom_function": "def reward(s, a, ns, i):\n    return 10"
}
```

## Error Responses

All endpoints return errors in this format:
```json
{
  "error": true,
  "message": "Description of what went wrong",
  "code": "ERROR_CODE",
  "details": { /* optional additional info */ }
}
```

Common error codes:
- `INVALID_ACTION`: Action not valid in current state
- `TRAINING_IN_PROGRESS`: Can't start new training
- `NO_GOLD`: Not enough gold for action
- `INVALID_POSITION`: Can't build at that location
- `GAME_OVER`: Game has ended

## Rate Limits

- REST API: No limits (local deployment)
- WebSocket: Max 60 messages per second
- Training: Max 1 concurrent training session

## Development Notes

1. **CORS**: Backend must allow `localhost:3000`
2. **WebSocket Heartbeat**: Send ping every 30s
3. **State Caching**: Frontend can cache Q-table for 1 second
4. **Error Recovery**: Auto-reconnect WebSocket on disconnect