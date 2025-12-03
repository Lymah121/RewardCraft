"""
Reward Calculator - Phase 3
Calculates rewards based on student-designed configuration
Enhanced for multiple tower types, enemy types, and upgrades
"""

from typing import Dict, Tuple


class RewardCalculator:
    """
    Calculate rewards based on student-designed configuration.
    Makes it easy to see how reward design affects AI behavior.

    Phase 3 Additions:
    - Rewards for different enemy types (boss, tanky, fast)
    - Rewards for tower upgrades
    - Rewards for using slow towers strategically
    """

    def __init__(self, config: Dict):
        """
        Initialize with student's reward configuration.

        Args:
            config: Dictionary with reward values for different events
        """
        self.config = config

        # Default rewards (Phase 3 extended)
        self.defaults = {
            # Base rewards
            "enemy_defeated": 10,
            "enemy_reached_base": -50,
            "tower_built": -2,
            "gold_saved": 1,
            "wave_completed": 20,
            "game_won": 100,
            "game_lost": -100,

            # Phase 3: Enemy type bonuses
            "boss_defeated": 50,
            "tanky_defeated": 15,
            "fast_defeated": 5,

            # Phase 3: Tower type and upgrade rewards
            "tower_upgraded": 5,
            "slow_tower_built": 3,
            "cannon_tower_built": 0,
            "archer_tower_built": 0,
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

        # Enemy defeated (base reward)
        if events.get("enemies_defeated", 0) > 0:
            component = self.config["enemy_defeated"] * events["enemies_defeated"]
            reward += component
            breakdown["enemy_defeated"] = component

        # Phase 3: Boss defeated bonus
        if events.get("boss_defeated", False):
            component = self.config["boss_defeated"]
            reward += component
            breakdown["boss_defeated"] = component

        # Phase 3: Tanky enemy bonus
        if events.get("tanky_defeated", 0) > 0:
            component = self.config["tanky_defeated"] * events["tanky_defeated"]
            reward += component
            breakdown["tanky_defeated"] = component

        # Phase 3: Fast enemy bonus
        if events.get("fast_defeated", 0) > 0:
            component = self.config["fast_defeated"] * events["fast_defeated"]
            reward += component
            breakdown["fast_defeated"] = component

        # Enemy reached base
        if events.get("enemies_reached_base", 0) > 0:
            component = self.config["enemy_reached_base"] * events["enemies_reached_base"]
            reward += component
            breakdown["enemy_reached_base"] = component

        # Tower built (check for Phase 3 tower types)
        if action.startswith("BUILD_") and events.get("action_success", False):
            # Base tower cost
            component = self.config["tower_built"]
            reward += component
            breakdown["tower_built"] = component

            # Phase 3: Bonus/penalty for specific tower types
            if "SLOW" in action:
                bonus = self.config.get("slow_tower_built", 0)
                if bonus != 0:
                    reward += bonus
                    breakdown["slow_tower_built"] = bonus
            elif "CANNON" in action:
                bonus = self.config.get("cannon_tower_built", 0)
                if bonus != 0:
                    reward += bonus
                    breakdown["cannon_tower_built"] = bonus
            elif "ARCHER" in action:
                bonus = self.config.get("archer_tower_built", 0)
                if bonus != 0:
                    reward += bonus
                    breakdown["archer_tower_built"] = bonus

        # Phase 3: Tower upgraded
        if events.get("towers_upgraded", 0) > 0:
            component = self.config["tower_upgraded"] * events["towers_upgraded"]
            reward += component
            breakdown["tower_upgraded"] = component

        # Gold saved (reward for SAVE action)
        if action == "SAVE":
            # Handle both old and new state formats
            if "resources" in new_state:
                gold_amount = new_state["resources"]["gold"]
            else:
                gold_amount = new_state.get("gold", 0)

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

    def get_config_description(self) -> Dict[str, str]:
        """Get descriptions for each reward config option (for UI tooltips)"""
        return {
            "enemy_defeated": "Reward per enemy killed",
            "enemy_reached_base": "Penalty when enemy reaches base",
            "tower_built": "Cost/reward for building any tower",
            "gold_saved": "Bonus per 10 gold when choosing SAVE",
            "wave_completed": "Bonus for completing a wave",
            "game_won": "Big bonus for winning the game",
            "game_lost": "Big penalty for losing the game",
            "boss_defeated": "Extra bonus for killing a boss",
            "tanky_defeated": "Extra bonus for killing tanky enemies",
            "fast_defeated": "Extra bonus for killing fast enemies",
            "tower_upgraded": "Reward for upgrading a tower",
            "slow_tower_built": "Bonus for building slow towers",
            "cannon_tower_built": "Bonus for building cannon towers",
            "archer_tower_built": "Bonus for building archer towers",
        }
