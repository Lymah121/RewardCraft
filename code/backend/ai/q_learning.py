"""
Q-Learning Agent - Phase 3
Tabular Q-learning with expanded action space for tower types and upgrades
Educational implementation - clarity over optimization
"""

import random
import json
from collections import defaultdict
from typing import Dict, List, Tuple, Optional

# Unified Phase 3 action set (keep in sync across backend components)
DEFAULT_ACTION_NAMES: List[str] = [
    "BUILD_ARCHER_LEFT",
    "BUILD_ARCHER_CENTER",
    "BUILD_ARCHER_RIGHT",
    "BUILD_CANNON_LEFT",
    "BUILD_CANNON_CENTER",
    "BUILD_CANNON_RIGHT",
    "BUILD_SLOW_LEFT",
    "BUILD_SLOW_CENTER",
    "BUILD_SLOW_RIGHT",
    "UPGRADE_OLDEST",
    "SAVE",
    "SELL_OLDEST",
]


class QLearningAgent:
    """
    Tabular Q-learning agent for Phase 3.

    Phase 3 Actions:
    - BUILD_ARCHER_LEFT/CENTER/RIGHT (3 actions)
    - BUILD_CANNON_LEFT/CENTER/RIGHT (3 actions)
    - BUILD_SLOW_LEFT/CENTER/RIGHT (3 actions)
    - UPGRADE_OLDEST (1 action)
    - SAVE (1 action)
    - SELL_OLDEST (1 action)

    Total: 12 actions
    """

    def __init__(self,
                 n_actions: int = 12,
                 learning_rate: float = 0.1,
                 discount_factor: float = 0.95,
                 epsilon: float = 0.1,
                 action_names: Optional[List[str]] = None):
        """
        Initialize Q-learning agent.

        Args:
            n_actions: Number of possible actions (ignored when action_names provided)
            learning_rate: How fast the agent learns (α)
            discount_factor: How much to value future rewards (γ)
            epsilon: Exploration rate (ε)
            action_names: Optional explicit action list
        """
        self.q_table = defaultdict(lambda: defaultdict(float))

        self.action_names = action_names or DEFAULT_ACTION_NAMES
        self.n_actions = len(self.action_names) if action_names else n_actions
        self.learning_rate = learning_rate
        self.discount_factor = discount_factor
        self.epsilon = epsilon
        self.initial_epsilon = epsilon
        self.action_to_index = {name: idx for idx, name in enumerate(self.action_names)}

        # Tracking for visualization
        self.state_visits = defaultdict(int)
        self.action_counts = defaultdict(int)
        self.total_steps = 0

    def get_state_key(self, state: Dict) -> str:
        """
        Convert game state to string key for Q-table.

        Phase 3: Enhanced state encoding
        Format: "state_gold_enemies_towers_wave_threat_slow"
        """
        # Support both Phase 3 format and legacy formats
        if 'threat_level' in state and 'has_slow_tower' in state:
            # Phase 3 format
            key = (f"state_{state['gold_level']}_{state['enemies_on_field']}_"
                   f"{state['towers_built']}_{state['wave_progress']}_"
                   f"{state['threat_level']}_{state['has_slow_tower']}")
        else:
            # Legacy Phase 1/2 format
            key = (f"state_{state['gold_level']}_{state['enemies_on_field']}_"
                   f"{state['towers_built']}_{state['wave_progress']}_"
                   f"{state.get('last_action_success', 1)}")
        return key

    def get_valid_action_indices(self, valid_action_names: List[str]) -> List[int]:
        """Translate action names from the game into agent indices"""
        return [self.action_to_index[a] for a in valid_action_names if a in self.action_to_index]

    def get_action(self, state: Dict, valid_actions: Optional[List[int]] = None) -> Tuple[int, bool]:
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

        if valid_actions is None:
            valid_actions = list(range(self.n_actions))
        elif len(valid_actions) == 0:
            # Fallback to SAVE if no valid list provided
            valid_actions = [self.action_to_index.get("SAVE", 0)]

        # Exploration: Choose random action
        if random.random() < self.epsilon:
            action_idx = random.choice(valid_actions)
            return action_idx, True

        # Exploitation: Choose best action
        q_values = self.q_table[state_key]

        valid_q = {a: q_values[a] for a in valid_actions}

        if all(v == 0 for v in valid_q.values()):
            action_idx = random.choice(valid_actions)
            return action_idx, True

        action_idx = max(valid_q.keys(), key=lambda a: valid_q[a])
        return action_idx, False

    def update(self, state: Dict, action: int, reward: float,
               next_state: Dict, done: bool = False) -> Tuple[float, float]:
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

        old_q = self.q_table[state_key][action]

        if done:
            max_next_q = 0
        else:
            next_q_values = self.q_table[next_state_key]
            max_next_q = max(next_q_values.values()) if next_q_values else 0

        # Q-learning update: Q(s,a) = Q(s,a) + α * [r + γ * max(Q(s',a')) - Q(s,a)]
        td_target = reward + self.discount_factor * max_next_q
        td_error = td_target - old_q
        new_q = old_q + self.learning_rate * td_error

        self.q_table[state_key][action] = new_q

        self.action_counts[action] += 1
        self.total_steps += 1

        return old_q, new_q

    def decay_epsilon(self, decay_rate: float = 0.995, min_epsilon: float = 0.01):
        """Decay exploration rate over time."""
        self.epsilon = max(min_epsilon, self.epsilon * decay_rate)

    def get_q_table_for_visualization(self) -> Dict:
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
            },
        }

        for state_key in sorted(self.q_table.keys()):
            viz_data["states"].append(state_key)

            label = self._create_state_label(state_key)
            viz_data["state_labels"][state_key] = label

            row = []
            for action_idx in range(self.n_actions):
                q_value = round(self.q_table[state_key][action_idx], 2)
                row.append(q_value)
            viz_data["q_values"].append(row)

        return viz_data

    def _create_state_label(self, state_key: str) -> str:
        """Create human-readable state label."""
        gold_labels = ["Poor", "Okay", "Rich"]
        enemy_labels = ["No enemies", "Few enemies", "Many enemies"]
        tower_labels = ["No towers", "Few towers", "Many towers"]
        wave_labels = ["Early", "Middle", "Late"]
        threat_labels = ["Low threat", "Medium threat", "High threat"]
        slow_labels = ["No slow", "Has slow"]

        try:
            parts = state_key.split('_')[1:]

            if len(parts) >= 6:
                # Phase 3 format
                label = f"{gold_labels[int(parts[0])]} | "
                label += f"{enemy_labels[int(parts[1])]} | "
                label += f"{tower_labels[int(parts[2])]} | "
                label += f"{wave_labels[int(parts[3])]} | "
                label += f"{threat_labels[int(parts[4])]} | "
                label += f"{slow_labels[int(parts[5])]}"
            else:
                # Legacy format
                label = f"{gold_labels[int(parts[0])]} | "
                label += f"{enemy_labels[int(parts[1])]} | "
                label += f"{tower_labels[int(parts[2])]} | "
                label += f"{wave_labels[int(parts[3])]}"
            return label
        except (IndexError, ValueError):
            return "Unknown state"

    def reset(self):
        """Reset the agent for a new training session."""
        self.q_table = defaultdict(lambda: defaultdict(float))
        self.state_visits = defaultdict(int)
        self.action_counts = defaultdict(int)
        self.total_steps = 0
        self.epsilon = self.initial_epsilon

    def save(self, filepath: str):
        """Save Q-table and stats to file"""
        data = {
            "q_table": {k: dict(v) for k, v in self.q_table.items()},
            "epsilon": self.epsilon,
            "total_steps": self.total_steps,
            "state_visits": dict(self.state_visits),
            "action_counts": dict(self.action_counts),
            "learning_rate": self.learning_rate,
            "discount_factor": self.discount_factor,
            "n_actions": self.n_actions,
            "action_names": self.action_names
        }
        with open(filepath, 'w') as f:
            json.dump(data, f, indent=2)

    def load(self, filepath: str):
        """Load Q-table and stats from file"""
        with open(filepath, 'r') as f:
            data = json.load(f)

        self.q_table = defaultdict(lambda: defaultdict(float))
        for state_key, actions in data["q_table"].items():
            for action_idx, q_value in actions.items():
                self.q_table[state_key][int(action_idx)] = q_value

        self.epsilon = data.get("epsilon", 0.1)
        self.total_steps = data.get("total_steps", 0)
        self.state_visits = defaultdict(int, {k: v for k, v in data.get("state_visits", {}).items()})
        self.action_counts = defaultdict(int, {int(k): v for k, v in data.get("action_counts", {}).items()})
        self.learning_rate = data.get("learning_rate", 0.1)
        self.discount_factor = data.get("discount_factor", 0.95)
        self.n_actions = data.get("n_actions", 12)
        if "action_names" in data:
            self.action_names = data["action_names"]
