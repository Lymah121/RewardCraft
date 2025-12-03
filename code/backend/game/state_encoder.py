"""
State Encoder - Phase 3
Converts game state to discrete representation for Q-learning
Enhanced for multiple enemy/tower types
"""

from typing import Dict


class StateEncoder:
    """
    Converts complex game state into discrete state for Q-learning.

    Phase 3 State Variables:
    - gold_level: 0=poor(<50), 1=okay(50-100), 2=rich(>100)
    - enemies_on_field: 0=none, 1=few(1-3), 2=many(4+)
    - towers_built: 0=none, 1=few(1-2), 2=many(3+)
    - wave_progress: 0=early(1-2), 1=middle(3-4), 2=late(5)
    - threat_level: 0=low, 1=medium, 2=high (based on enemy types)
    - has_slow_tower: 0=no, 1=yes

    Total states: 3 * 3 * 3 * 3 * 3 * 2 = 486 states
    """

    def __init__(self):
        # Discretization thresholds
        self.gold_thresholds = [50, 100]
        self.enemy_thresholds = [1, 4]
        self.tower_thresholds = [1, 3]

    def encode(self, game_state: Dict) -> Dict:
        """
        Convert game state to discrete representation.

        Args:
            game_state: Raw game state from engine

        Returns:
            Dictionary with discrete state variables
        """
        # Handle both old and new state formats
        if "resources" in game_state:
            gold = game_state["resources"]["gold"]
        else:
            gold = game_state.get("gold", 100)

        enemies = game_state.get("enemies", [])
        towers = game_state.get("towers", [])

        if "wave" in game_state:
            wave = game_state["wave"]["current"]
        else:
            wave = game_state.get("current_wave", 1)

        last_success = game_state.get("last_action_success", True)

        # Calculate threat level based on enemy types
        threat_level = self._calculate_threat(enemies)

        # Check if player has slow tower
        has_slow = self._has_slow_tower(towers)

        encoded = {
            "gold_level": self._discretize_gold(gold),
            "enemies_on_field": self._discretize_enemies(len(enemies)),
            "towers_built": self._discretize_towers(len(towers)),
            "wave_progress": self._discretize_wave(wave),
            "threat_level": threat_level,
            "has_slow_tower": 1 if has_slow else 0,
            # Keep last_action_success for backward compatibility
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
        if wave_number <= 2:
            return 0  # Early
        elif wave_number <= 4:
            return 1  # Middle
        else:
            return 2  # Late (wave 5)

    def _calculate_threat(self, enemies: list) -> int:
        """
        Calculate threat level based on enemy types.
        0 = low (only normal/fast)
        1 = medium (has tanky)
        2 = high (has boss)
        """
        has_tanky = False
        has_boss = False

        for enemy in enemies:
            enemy_type = enemy.get("type", "normal")
            if enemy_type == "boss":
                has_boss = True
            elif enemy_type == "tanky":
                has_tanky = True

        if has_boss:
            return 2  # High threat
        elif has_tanky:
            return 1  # Medium threat
        else:
            return 0  # Low threat

    def _has_slow_tower(self, towers: list) -> bool:
        """Check if player has at least one slow tower"""
        for tower in towers:
            if tower.get("type", "archer") == "slow":
                return True
        return False

    def get_state_key(self, state: Dict) -> str:
        """
        Create string key for Q-table from encoded state.

        Phase 3 Format: "state_gold_enemies_towers_wave_threat_slow"
        Example: "state_2_1_2_1_1_1" = Rich, Few enemies, Many towers, Middle, Medium threat, Has slow
        """
        return (f"state_{state['gold_level']}_{state['enemies_on_field']}_"
                f"{state['towers_built']}_{state['wave_progress']}_"
                f"{state['threat_level']}_{state['has_slow_tower']}")

    def get_state_label(self, state_key: str) -> str:
        """
        Create human-readable label from state key.
        """
        gold_labels = ["Poor", "Okay", "Rich"]
        enemy_labels = ["No enemies", "Few enemies", "Many enemies"]
        tower_labels = ["No towers", "Few towers", "Many towers"]
        wave_labels = ["Early", "Middle", "Late"]
        threat_labels = ["Low threat", "Medium threat", "High threat"]
        slow_labels = ["No slow", "Has slow"]

        try:
            parts = state_key.split('_')[1:]  # Remove "state" prefix

            if len(parts) >= 6:
                # Phase 3 format
                label = f"{gold_labels[int(parts[0])]} | "
                label += f"{enemy_labels[int(parts[1])]} | "
                label += f"{tower_labels[int(parts[2])]} | "
                label += f"{wave_labels[int(parts[3])]} | "
                label += f"{threat_labels[int(parts[4])]} | "
                label += f"{slow_labels[int(parts[5])]}"
            else:
                # Phase 1/2 backward compatibility
                label = f"{gold_labels[int(parts[0])]} | "
                label += f"{enemy_labels[int(parts[1])]} | "
                label += f"{tower_labels[int(parts[2])]} | "
                label += f"{wave_labels[int(parts[3])]}"
                if len(parts) > 4:
                    label += f" | {'Success' if int(parts[4]) else 'Failed'}"

            return label
        except (IndexError, ValueError):
            return "Unknown state"

    def get_state_space_size(self) -> int:
        """Calculate total number of possible states"""
        # Phase 3: 3 * 3 * 3 * 3 * 3 * 2 = 486 states
        return 3 * 3 * 3 * 3 * 3 * 2
