# Q-Learning Implementation Guide

## Core Algorithm (Keep It Simple!)

### The Q-Learning Equation
```
Q(s,a) = Q(s,a) + α * [r + γ * max(Q(s',a')) - Q(s,a)]

Where:
- Q(s,a) = Current Q-value for state s, action a
- α = Learning rate (0.1 default)
- r = Immediate reward
- γ = Discount factor (0.95 default)
- s' = Next state
- max(Q(s',a')) = Best Q-value in next state
```

## Python Implementation (Phase 1)

### Core Q-Learning Class
```python
# backend/ai/q_learning.py

import numpy as np
from collections import defaultdict
import random
import json

class QLearningAgent:
    """
    Simple tabular Q-learning for Phase 1.
    Keep it readable for educational purposes!
    """

    def __init__(self,
                 n_actions=5,
                 learning_rate=0.1,
                 discount_factor=0.95,
                 epsilon=0.1):
        """
        Initialize Q-learning agent.

        Args:
            n_actions: Number of possible actions (5 for Phase 1)
            learning_rate: How fast the agent learns (α)
            discount_factor: How much to value future rewards (γ)
            epsilon: Exploration rate (ε)
        """
        # Q-table: state -> action -> value
        # Using defaultdict so new states automatically get 0 values
        self.q_table = defaultdict(lambda: defaultdict(float))

        self.n_actions = n_actions
        self.learning_rate = learning_rate
        self.discount_factor = discount_factor
        self.epsilon = epsilon

        # Action names for clarity
        self.action_names = [
            "BUILD_LEFT",
            "BUILD_CENTER",
            "BUILD_RIGHT",
            "SAVE",
            "SELL_OLDEST"
        ]

        # Tracking for visualization
        self.state_visits = defaultdict(int)
        self.action_counts = defaultdict(int)
        self.total_steps = 0

    def get_state_key(self, state):
        """
        Convert game state to string key for Q-table.

        Phase 1: Simple discretization
        Format: "state_gold_enemies_towers_wave_success"
        """
        key = f"state_{state['gold_level']}_{state['enemies_on_field']}_{state['towers_built']}_{state['wave_progress']}_{state['last_action_success']}"
        return key

    def get_action(self, state, valid_actions=None):
        """
        Choose action using epsilon-greedy strategy.

        Args:
            state: Current game state
            valid_actions: List of valid action indices (optional)

        Returns:
            action_index: Index of chosen action
            was_exploration: Boolean, True if random action
        """
        state_key = self.get_state_key(state)
        self.state_visits[state_key] += 1

        # Get valid actions (all actions if not specified)
        if valid_actions is None:
            valid_actions = list(range(self.n_actions))

        # Exploration: Choose random action
        if random.random() < self.epsilon:
            action_idx = random.choice(valid_actions)
            return action_idx, True

        # Exploitation: Choose best action
        q_values = self.q_table[state_key]

        # Get Q-values for valid actions only
        valid_q = {a: q_values[a] for a in valid_actions}

        # If all Q-values are 0 (unexplored), choose randomly
        if all(v == 0 for v in valid_q.values()):
            action_idx = random.choice(valid_actions)
            return action_idx, True

        # Choose action with highest Q-value
        action_idx = max(valid_q.keys(), key=lambda a: valid_q[a])
        return action_idx, False

    def update(self, state, action, reward, next_state, done=False):
        """
        Update Q-value using Q-learning formula.

        Args:
            state: State before action
            action: Action taken (index)
            reward: Reward received
            next_state: State after action
            done: Whether episode ended

        Returns:
            old_q: Q-value before update
            new_q: Q-value after update
        """
        state_key = self.get_state_key(state)
        next_state_key = self.get_state_key(next_state)

        # Get current Q-value
        old_q = self.q_table[state_key][action]

        # Get max Q-value for next state
        if done:
            max_next_q = 0  # No future rewards if episode ended
        else:
            next_q_values = self.q_table[next_state_key]
            max_next_q = max(next_q_values.values()) if next_q_values else 0

        # Q-learning update formula
        td_target = reward + self.discount_factor * max_next_q
        td_error = td_target - old_q
        new_q = old_q + self.learning_rate * td_error

        # Update Q-table
        self.q_table[state_key][action] = new_q

        # Track statistics
        self.action_counts[action] += 1
        self.total_steps += 1

        return old_q, new_q

    def decay_epsilon(self, decay_rate=0.995, min_epsilon=0.01):
        """
        Decay exploration rate over time.
        Called after each episode.
        """
        self.epsilon = max(min_epsilon, self.epsilon * decay_rate)

    def get_q_table_for_visualization(self):
        """
        Format Q-table for frontend visualization.

        Returns:
            Dictionary with states, actions, and Q-values
        """
        viz_data = {
            "states": [],
            "actions": self.action_names,
            "q_values": [],
            "state_labels": {},
            "statistics": {
                "total_states": len(self.q_table),
                "total_steps": self.total_steps,
                "epsilon": self.epsilon,
                "most_visited_state": max(self.state_visits.items(),
                                         key=lambda x: x[1])[0] if self.state_visits else None,
                "most_taken_action": self.action_names[max(self.action_counts.items(),
                                                           key=lambda x: x[1])[0]] if self.action_counts else None
            }
        }

        # Convert Q-table to matrix format
        for state_key in sorted(self.q_table.keys()):
            viz_data["states"].append(state_key)

            # Create human-readable label
            parts = state_key.split('_')[1:]  # Remove "state" prefix
            label = self._create_state_label(parts)
            viz_data["state_labels"][state_key] = label

            # Get Q-values for all actions
            row = []
            for action_idx in range(self.n_actions):
                q_value = round(self.q_table[state_key][action_idx], 2)
                row.append(q_value)
            viz_data["q_values"].append(row)

        return viz_data

    def _create_state_label(self, parts):
        """
        Create human-readable state label.

        Example: [2, 1, 0, 1, 1] -> "Rich | Few enemies | No towers | Middle | Success"
        """
        gold_labels = ["Poor", "Okay", "Rich"]
        enemy_labels = ["None", "Few", "Many"]
        tower_labels = ["None", "Few", "Many"]
        wave_labels = ["Early", "Middle", "Late"]
        success_labels = ["Failed", "Success"]

        try:
            label = f"{gold_labels[int(parts[0])]} | "
            label += f"{enemy_labels[int(parts[1])]} enemies | "
            label += f"{tower_labels[int(parts[2])]} towers | "
            label += f"{wave_labels[int(parts[3])]} | "
            label += f"{success_labels[int(parts[4])]}"
            return label
        except (IndexError, ValueError):
            return "Unknown state"

    def save(self, filepath):
        """Save Q-table to file."""
        data = {
            "q_table": dict(self.q_table),
            "epsilon": self.epsilon,
            "total_steps": self.total_steps,
            "state_visits": dict(self.state_visits),
            "action_counts": dict(self.action_counts)
        }
        with open(filepath, 'w') as f:
            json.dump(data, f, indent=2)

    def load(self, filepath):
        """Load Q-table from file."""
        with open(filepath, 'r') as f:
            data = json.load(f)
        self.q_table = defaultdict(lambda: defaultdict(float), data["q_table"])
        self.epsilon = data.get("epsilon", 0.1)
        self.total_steps = data.get("total_steps", 0)
        self.state_visits = defaultdict(int, data.get("state_visits", {}))
        self.action_counts = defaultdict(int, data.get("action_counts", {}))
```

## State Encoder Implementation

```python
# backend/game/state_encoder.py

class StateEncoder:
    """
    Converts game state to discrete representation for Q-learning.
    Keep it simple and interpretable!
    """

    def __init__(self):
        # Define discretization thresholds
        self.gold_thresholds = [50, 100]  # Poor < 50 < Okay < 100 < Rich
        self.enemy_thresholds = [1, 4]    # None = 0, Few = 1-3, Many = 4+
        self.tower_thresholds = [1, 3]    # None = 0, Few = 1-2, Many = 3+

    def encode(self, game_state):
        """
        Convert game state to discrete representation.

        Args:
            game_state: Raw game state from engine

        Returns:
            Dictionary with discrete state variables
        """
        encoded = {
            "gold_level": self._discretize_gold(game_state["resources"]["gold"]),
            "enemies_on_field": self._discretize_enemies(len(game_state["enemies"])),
            "towers_built": self._discretize_towers(len(game_state["towers"])),
            "wave_progress": self._discretize_wave(game_state["wave"]["current"]),
            "last_action_success": game_state.get("last_action_success", 1)
        }

        return encoded

    def _discretize_gold(self, gold):
        """Convert gold amount to level 0, 1, or 2."""
        if gold < self.gold_thresholds[0]:
            return 0  # Poor
        elif gold < self.gold_thresholds[1]:
            return 1  # Okay
        else:
            return 2  # Rich

    def _discretize_enemies(self, count):
        """Convert enemy count to level 0, 1, or 2."""
        if count == 0:
            return 0  # None
        elif count < self.enemy_thresholds[1]:
            return 1  # Few
        else:
            return 2  # Many

    def _discretize_towers(self, count):
        """Convert tower count to level 0, 1, or 2."""
        if count == 0:
            return 0  # None
        elif count < self.tower_thresholds[1]:
            return 1  # Few
        else:
            return 2  # Many

    def _discretize_wave(self, wave_number):
        """Convert wave number to phase 0, 1, or 2."""
        if wave_number == 1:
            return 0  # Early
        elif wave_number == 2:
            return 1  # Middle
        else:
            return 2  # Late

    def get_state_space_size(self):
        """Calculate total number of possible states."""
        return 3 * 3 * 3 * 3 * 2  # 162 states
```

## Reward Calculator Implementation

```python
# backend/ai/reward_function.py

class RewardCalculator:
    """
    Calculate rewards based on student-designed configuration.
    """

    def __init__(self, config):
        """
        Initialize with student's reward configuration.

        Args:
            config: Dictionary with reward values
        """
        self.config = config

        # Default rewards if not specified
        self.defaults = {
            "enemy_defeated": 10,
            "enemy_reached_base": -50,
            "tower_built": -2,
            "gold_saved": 1,
            "wave_completed": 20,
            "game_won": 100,
            "game_lost": -100
        }

        # Merge student config with defaults
        for key, value in self.defaults.items():
            if key not in self.config:
                self.config[key] = value

    def calculate(self, old_state, action, new_state, events):
        """
        Calculate reward for a state transition.

        Args:
            old_state: State before action
            action: Action taken
            new_state: State after action
            events: Dictionary of game events

        Returns:
            total_reward: Sum of all reward components
            breakdown: Dictionary showing each component
        """
        reward = 0
        breakdown = {}

        # Enemy defeated
        if events.get("enemies_defeated", 0) > 0:
            component = self.config["enemy_defeated"] * events["enemies_defeated"]
            reward += component
            breakdown["enemy_defeated"] = component

        # Enemy reached base
        if events.get("enemies_reached_base", 0) > 0:
            component = self.config["enemy_reached_base"] * events["enemies_reached_base"]
            reward += component
            breakdown["enemy_reached_base"] = component

        # Tower built
        if action in ["BUILD_LEFT", "BUILD_CENTER", "BUILD_RIGHT"]:
            if events.get("action_success", False):
                component = self.config["tower_built"]
                reward += component
                breakdown["tower_built"] = component

        # Gold saved (reward for SAVE action)
        if action == "SAVE":
            gold_bonus = (new_state["resources"]["gold"] // 10) * self.config["gold_saved"]
            reward += gold_bonus
            breakdown["gold_saved"] = gold_bonus

        # Wave completed
        if events.get("wave_completed", False):
            component = self.config["wave_completed"]
            reward += component
            breakdown["wave_completed"] = component

        # Game won/lost
        if events.get("game_won", False):
            component = self.config["game_won"]
            reward += component
            breakdown["game_won"] = component
        elif events.get("game_lost", False):
            component = self.config["game_lost"]
            reward += component
            breakdown["game_lost"] = component

        return reward, breakdown
```

## Training Loop Implementation

```python
# backend/ai/trainer.py

import asyncio
from typing import Dict, Callable

class RLTrainer:
    """
    Manages the training loop for the Q-learning agent.
    """

    def __init__(self, agent, game_engine, reward_calculator, state_encoder):
        self.agent = agent
        self.game = game_engine
        self.reward_calc = reward_calculator
        self.encoder = state_encoder

        # Training state
        self.current_episode = 0
        self.episode_rewards = []
        self.is_training = False

    async def train(self, episodes: int, update_callback: Callable = None):
        """
        Train the agent for specified number of episodes.

        Args:
            episodes: Number of episodes to train
            update_callback: Function to call with updates
        """
        self.is_training = True

        for episode in range(episodes):
            if not self.is_training:
                break

            self.current_episode = episode
            episode_reward = await self.run_episode(episode, update_callback)
            self.episode_rewards.append(episode_reward)

            # Decay exploration rate
            self.agent.decay_epsilon()

            # Send episode complete update
            if update_callback:
                await update_callback({
                    "type": "episode_complete",
                    "episode": episode,
                    "total_reward": episode_reward,
                    "epsilon": self.agent.epsilon
                })

        self.is_training = False

    async def run_episode(self, episode_num: int, update_callback: Callable = None):
        """
        Run a single training episode.
        """
        # Reset game
        self.game.reset()
        total_reward = 0
        steps = 0

        while not self.game.is_done():
            # Get current state
            game_state = self.game.get_state()
            encoded_state = self.encoder.encode(game_state)

            # Get valid actions
            valid_actions = self.game.get_valid_actions()

            # Agent chooses action
            action_idx, was_exploration = self.agent.get_action(
                encoded_state,
                valid_actions
            )
            action = self.agent.action_names[action_idx]

            # Execute action in game
            events = self.game.execute_action(action)

            # Get new state
            new_game_state = self.game.get_state()
            new_encoded_state = self.encoder.encode(new_game_state)

            # Calculate reward
            reward, reward_breakdown = self.reward_calc.calculate(
                game_state, action, new_game_state, events
            )
            total_reward += reward

            # Update Q-table
            old_q, new_q = self.agent.update(
                encoded_state,
                action_idx,
                reward,
                new_encoded_state,
                self.game.is_done()
            )

            # Send update every 10 steps
            if steps % 10 == 0 and update_callback:
                await update_callback({
                    "type": "training_update",
                    "episode": episode_num,
                    "step": steps,
                    "state": encoded_state,
                    "action": action,
                    "reward": reward,
                    "old_q": old_q,
                    "new_q": new_q,
                    "was_exploration": was_exploration
                })

            steps += 1

            # Small delay for visualization
            await asyncio.sleep(0.01)

        return total_reward

    def stop_training(self):
        """Stop training loop."""
        self.is_training = False
```

## Usage Example

```python
# backend/main.py

from fastapi import FastAPI, WebSocket
from ai.q_learning import QLearningAgent
from ai.reward_function import RewardCalculator
from ai.trainer import RLTrainer
from game.engine import TowerDefenseGame
from game.state_encoder import StateEncoder

app = FastAPI()

# Initialize components
agent = QLearningAgent()
game = TowerDefenseGame()
encoder = StateEncoder()

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()

    while True:
        data = await websocket.receive_json()

        if data["type"] == "start_training":
            # Create reward calculator with student's config
            reward_calc = RewardCalculator(data["reward_config"])

            # Create trainer
            trainer = RLTrainer(agent, game, reward_calc, encoder)

            # Define update callback
            async def send_update(update_data):
                await websocket.send_json(update_data)

            # Start training
            await trainer.train(
                episodes=data["episodes"],
                update_callback=send_update
            )
```

## Testing the Implementation

```python
# tests/test_q_learning.py

def test_q_learning_basic():
    """Test basic Q-learning functionality."""
    agent = QLearningAgent()

    # Create sample states
    state1 = {"gold_level": 0, "enemies_on_field": 1,
              "towers_built": 0, "wave_progress": 0,
              "last_action_success": 1}

    state2 = {"gold_level": 1, "enemies_on_field": 0,
              "towers_built": 1, "wave_progress": 0,
              "last_action_success": 1}

    # Test action selection
    action, was_exploration = agent.get_action(state1)
    assert 0 <= action < 5

    # Test Q-table update
    old_q, new_q = agent.update(state1, action, 10, state2)
    assert new_q != old_q  # Q-value should change

    # Test epsilon decay
    old_epsilon = agent.epsilon
    agent.decay_epsilon()
    assert agent.epsilon < old_epsilon

def test_state_encoder():
    """Test state encoding."""
    encoder = StateEncoder()

    game_state = {
        "resources": {"gold": 75},
        "enemies": [1, 2, 3],
        "towers": [1],
        "wave": {"current": 1}
    }

    encoded = encoder.encode(game_state)

    assert encoded["gold_level"] == 1  # Okay (50-100)
    assert encoded["enemies_on_field"] == 1  # Few (1-3)
    assert encoded["towers_built"] == 1  # Few (1-2)
    assert encoded["wave_progress"] == 0  # Early (wave 1)
```

## Key Points for Implementation

1. **Keep It Simple**: Phase 1 doesn't need complex features
2. **Make It Visible**: Every Q-value update should be trackable
3. **Deterministic**: No randomness in game mechanics
4. **Small State Space**: 162 states is perfect for visualization
5. **Clear Actions**: Only 5 actions, easy to understand

This implementation prioritizes **clarity and pedagogy** over performance!