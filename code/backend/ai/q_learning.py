"""
Q-Learning Agent - Simple tabular Q-learning for Phase 1
Educational implementation - clarity over optimization
"""

import random
import json
from collections import defaultdict
from typing import Dict, List, Tuple, Optional


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

    def get_state_key(self, state: Dict) -> str:
        """
        Convert game state to string key for Q-table.

        Phase 1: Simple discretization
        Format: "state_gold_enemies_towers_wave_success"
        """
        key = f"state_{state['gold_level']}_{state['enemies_on_field']}_{state['towers_built']}_{state['wave_progress']}_{state['last_action_success']}"
        return key

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

        # Get current Q-value
        old_q = self.q_table[state_key][action]

        # Get max Q-value for next state
        if done:
            max_next_q = 0  # No future rewards if episode ended
        else:
            next_q_values = self.q_table[next_state_key]
            max_next_q = max(next_q_values.values()) if next_q_values else 0

        # Q-learning update formula
        # Q(s,a) = Q(s,a) + α * [r + γ * max(Q(s',a')) - Q(s,a)]
        td_target = reward + self.discount_factor * max_next_q
        td_error = td_target - old_q
        new_q = old_q + self.learning_rate * td_error

        # Update Q-table
        self.q_table[state_key][action] = new_q

        # Track statistics
        self.action_counts[action] += 1
        self.total_steps += 1

        return old_q, new_q

    def decay_epsilon(self, decay_rate: float = 0.995, min_epsilon: float = 0.01):
        """
        Decay exploration rate over time.
        Called after each episode.
        """
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
            }
        }

        # Convert Q-table to matrix format
        for state_key in sorted(self.q_table.keys()):
            viz_data["states"].append(state_key)

            # Create human-readable label
            label = self._create_state_label(state_key)
            viz_data["state_labels"][state_key] = label

            # Get Q-values for all actions
            row = []
            for action_idx in range(self.n_actions):
                q_value = round(self.q_table[state_key][action_idx], 2)
                row.append(q_value)
            viz_data["q_values"].append(row)

        return viz_data

    def _create_state_label(self, state_key: str) -> str:
        """
        Create human-readable state label.

        Example: "state_2_1_2_0_1" -> "Rich | Few enemies | Many towers | Early | Success"
        """
        gold_labels = ["Poor", "Okay", "Rich"]
        enemy_labels = ["No enemies", "Few enemies", "Many enemies"]
        tower_labels = ["No towers", "Few towers", "Many towers"]
        wave_labels = ["Early", "Middle", "Late"]
        success_labels = ["Failed", "Success"]

        try:
            parts = state_key.split('_')[1:]  # Remove "state" prefix
            label = f"{gold_labels[int(parts[0])]} | "
            label += f"{enemy_labels[int(parts[1])]} | "
            label += f"{tower_labels[int(parts[2])]} | "
            label += f"{wave_labels[int(parts[3])]} | "
            label += f"{success_labels[int(parts[4])]}"
            return label
        except (IndexError, ValueError):
            return "Unknown state"

    def save(self, filepath: str):
        """Save Q-table and stats to file"""
        data = {
            "q_table": {k: dict(v) for k, v in self.q_table.items()},
            "epsilon": self.epsilon,
            "total_steps": self.total_steps,
            "state_visits": dict(self.state_visits),
            "action_counts": dict(self.action_counts),
            "learning_rate": self.learning_rate,
            "discount_factor": self.discount_factor
        }
        with open(filepath, 'w') as f:
            json.dump(data, f, indent=2)

    def load(self, filepath: str):
        """Load Q-table and stats from file"""
        with open(filepath, 'r') as f:
            data = json.load(f)

        # Restore Q-table
        self.q_table = defaultdict(lambda: defaultdict(float))
        for state_key, actions in data["q_table"].items():
            for action_idx, q_value in actions.items():
                self.q_table[state_key][int(action_idx)] = q_value

        # Restore stats
        self.epsilon = data.get("epsilon", 0.1)
        self.total_steps = data.get("total_steps", 0)
        self.state_visits = defaultdict(int, {k: v for k, v in data.get("state_visits", {}).items()})
        self.action_counts = defaultdict(int, {int(k): v for k, v in data.get("action_counts", {}).items()})
        self.learning_rate = data.get("learning_rate", 0.1)
        self.discount_factor = data.get("discount_factor", 0.95)
