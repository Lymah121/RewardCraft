"""
Reward Calculator - Calculates rewards based on student-designed configuration
Educational focus - make rewards transparent and understandable
"""

from typing import Dict, Tuple


class RewardCalculator:
    """
    Calculate rewards based on student-designed configuration.
    Makes it easy to see how reward design affects AI behavior.
    """

    def __init__(self, config: Dict):
        """
        Initialize with student's reward configuration.

        Args:
            config: Dictionary with reward values for different events
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

    def calculate(self, old_state: Dict, action: str, new_state: Dict, events: Dict) -> Tuple[float, Dict]:
        """
        Calculate reward for a state transition.

        Args:
            old_state: State before action
            action: Action taken (action name string)
            new_state: State after action
            events: Dictionary of game events that occurred

        Returns:
            total_reward: Sum of all reward components
            breakdown: Dictionary showing each component (for debugging)
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

        # Tower built (based on action)
        if action in ["BUILD_LEFT", "BUILD_CENTER", "BUILD_RIGHT"]:
            if events.get("action_success", False):
                component = self.config["tower_built"]
                reward += component
                breakdown["tower_built"] = component

        # Gold saved (reward for SAVE action)
        if action == "SAVE":
            gold_amount = new_state["resources"]["gold"]
            gold_bonus = (gold_amount // 10) * self.config["gold_saved"]
            reward += gold_bonus
            breakdown["gold_saved"] = gold_bonus

        # Wave completed
        if events.get("wave_completed", False):
            component = self.config["wave_completed"]
            reward += component
            breakdown["wave_completed"] = component

        # Game won
        if events.get("game_won", False):
            component = self.config["game_won"]
            reward += component
            breakdown["game_won"] = component

        # Game lost
        if events.get("game_lost", False):
            component = self.config["game_lost"]
            reward += component
            breakdown["game_lost"] = component

        return reward, breakdown

    def update_config(self, new_config: Dict):
        """Update reward configuration (when student adjusts sliders)"""
        self.config.update(new_config)

    def get_config(self) -> Dict:
        """Get current reward configuration"""
        return self.config.copy()
