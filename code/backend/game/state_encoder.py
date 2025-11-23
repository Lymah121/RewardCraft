"""
State Encoder - Converts game state to discrete representation for Q-learning
Keeping it simple with only 162 total states (3×3×3×3×2)
"""

from typing import Dict


class StateEncoder:
    """
    Converts complex game state into discrete state for Q-learning.

    State Variables:
    - gold_level: 0=poor(<50), 1=okay(50-100), 2=rich(>100)
    - enemies_on_field: 0=none, 1=few(1-3), 2=many(4+)
    - towers_built: 0=none, 1=few(1-2), 2=many(3+)
    - wave_progress: 0=early(wave 1), 1=middle(wave 2), 2=late(wave 3)
    - last_action_success: 0=failed, 1=succeeded

    Total states: 3 * 3 * 3 * 3 * 2 = 162 states
    """

    def __init__(self):
        # Discretization thresholds
        self.gold_thresholds = [50, 100]  # Poor < 50 < Okay < 100 < Rich
        self.enemy_thresholds = [1, 4]    # None = 0, Few = 1-3, Many = 4+
        self.tower_thresholds = [1, 3]    # None = 0, Few = 1-2, Many = 3+

    def encode(self, game_state: Dict) -> Dict:
        """
        Convert game state to discrete representation.

        Args:
            game_state: Raw game state from engine

        Returns:
            Dictionary with discrete state variables
        """
        gold = game_state["resources"]["gold"]
        num_enemies = len(game_state["enemies"])
        num_towers = len(game_state["towers"])
        wave = game_state["wave"]["current"]
        last_success = game_state.get("last_action_success", True)

        encoded = {
            "gold_level": self._discretize_gold(gold),
            "enemies_on_field": self._discretize_enemies(num_enemies),
            "towers_built": self._discretize_towers(num_towers),
            "wave_progress": self._discretize_wave(wave),
            "last_action_success": 1 if last_success else 0
        }

        return encoded

    def _discretize_gold(self, gold: int) -> int:
        """Convert gold amount to level 0, 1, or 2"""
        if gold < self.gold_thresholds[0]:
            return 0  # Poor
        elif gold < self.gold_thresholds[1]:
            return 1  # Okay
        else:
            return 2  # Rich

    def _discretize_enemies(self, count: int) -> int:
        """Convert enemy count to level 0, 1, or 2"""
        if count == 0:
            return 0  # None
        elif count < self.enemy_thresholds[1]:
            return 1  # Few (1-3)
        else:
            return 2  # Many (4+)

    def _discretize_towers(self, count: int) -> int:
        """Convert tower count to level 0, 1, or 2"""
        if count == 0:
            return 0  # None
        elif count < self.tower_thresholds[1]:
            return 1  # Few (1-2)
        else:
            return 2  # Many (3+)

    def _discretize_wave(self, wave_number: int) -> int:
        """Convert wave number to phase 0, 1, or 2"""
        if wave_number == 1:
            return 0  # Early
        elif wave_number == 2:
            return 1  # Middle
        else:
            return 2  # Late (wave 3 or beyond)

    def get_state_key(self, state: Dict) -> str:
        """
        Create string key for Q-table from encoded state.

        Format: "state_gold_enemies_towers_wave_success"
        Example: "state_2_1_2_0_1" = Rich, Few enemies, Many towers, Early, Success
        """
        return f"state_{state['gold_level']}_{state['enemies_on_field']}_{state['towers_built']}_{state['wave_progress']}_{state['last_action_success']}"

    def get_state_label(self, state_key: str) -> str:
        """
        Create human-readable label from state key.

        Example: "state_2_1_2_0_1" -> "Rich | Few enemies | Many towers | Early | Success"
        """
        # Labels for each dimension
        gold_labels = ["Poor", "Okay", "Rich"]
        enemy_labels = ["No enemies", "Few enemies", "Many enemies"]
        tower_labels = ["No towers", "Few towers", "Many towers"]
        wave_labels = ["Early", "Middle", "Late"]
        success_labels = ["Failed", "Success"]

        try:
            # Parse state key
            parts = state_key.split('_')[1:]  # Remove "state" prefix

            label = f"{gold_labels[int(parts[0])]} | "
            label += f"{enemy_labels[int(parts[1])]} | "
            label += f"{tower_labels[int(parts[2])]} | "
            label += f"{wave_labels[int(parts[3])]} | "
            label += f"{success_labels[int(parts[4])]}"

            return label
        except (IndexError, ValueError):
            return "Unknown state"

    def get_state_space_size(self) -> int:
        """Calculate total number of possible states"""
        return 3 * 3 * 3 * 3 * 2  # 162 states
