"""
Tower Defense Game Engine - Phase 1
Simple, deterministic tower defense for RL learning
"""

import time
from typing import List, Dict, Tuple, Optional
from dataclasses import dataclass, field


@dataclass
class Enemy:
    """Basic enemy that walks along the path"""
    id: int
    x: float  # Current x position (float for smooth movement)
    y: int  # Current y position (always 5 in Phase 1)
    hp: int
    max_hp: int = 30
    speed: float = 1.0  # tiles per second
    gold_reward: int = 20
    path_index: int = 0  # Current position on path


@dataclass
class Tower:
    """Basic tower that shoots enemies"""
    id: int
    x: int
    y: int
    damage: int = 10
    range: int = 2  # Manhattan distance
    attack_speed: float = 1.0  # attacks per second
    last_shot_time: float = 0
    kills: int = 0
    cost: int = 50
    sell_value: int = 35


class TowerDefenseGame:
    """
    Core game engine for Phase 1 Tower Defense.

    Rules:
    - 10x10 grid
    - Path on row 5 (straight line)
    - One tower type, one enemy type
    - Deterministic behavior
    - Simple state for RL learning
    """

    def __init__(self):
        # Grid setup
        self.grid_width = 10
        self.grid_height = 10
        self.path_row = 5

        # Path is a straight line on row 5
        self.path = [(x, self.path_row) for x in range(self.grid_width)]
        self.spawn_point = (0, self.path_row)
        self.base_point = (9, self.path_row)

        # Game state
        self.enemies: List[Enemy] = []
        self.towers: List[Tower] = []
        self.gold = 100
        self.lives = 20
        self.current_wave = 0
        self.total_waves = 3

        # Wave configuration (enemies, spacing)
        self.wave_config = [
            (5, 2.0),   # Wave 1: 5 enemies, 2 second spacing
            (7, 1.5),   # Wave 2: 7 enemies, 1.5 second spacing
            (10, 1.0),  # Wave 3: 10 enemies, 1 second spacing
        ]

        # Timing
        self.time = 0.0
        self.dt = 1/60  # 60 FPS
        self.wave_start_time = 0.0
        self.wave_prep_time = 5.0  # 5 seconds before wave starts
        self.between_wave_time = 10.0  # 10 seconds between waves

        # Wave spawning state
        self.enemies_to_spawn = 0
        self.enemies_spawned = 0
        self.spawn_spacing = 0.0
        self.last_spawn_time = 0.0
        self.wave_active = False
        self.between_waves = False

        # Episode state
        self.episode_active = True
        self.victory = False
        self.defeat = False

        # Action tracking
        self.last_action = None
        self.last_action_success = True

        # Event tracking for rewards
        self.events = {
            "enemies_defeated": 0,
            "enemies_reached_base": 0,
            "towers_built": 0,
            "wave_completed": False,
            "game_won": False,
            "game_lost": False,
            "action_success": True
        }

        # ID counters
        self.next_enemy_id = 1
        self.next_tower_id = 1

    def reset(self):
        """Reset game to initial state for new episode"""
        self.enemies = []
        self.towers = []
        self.gold = 100
        self.lives = 20
        self.current_wave = 0
        self.time = 0.0
        self.wave_start_time = 0.0
        self.enemies_to_spawn = 0
        self.enemies_spawned = 0
        self.wave_active = False
        self.between_waves = False
        self.episode_active = True
        self.victory = False
        self.defeat = False
        self.last_action = None
        self.last_action_success = True
        self.next_enemy_id = 1
        self.next_tower_id = 1
        self._reset_events()

    def _reset_events(self):
        """Clear event counters"""
        self.events = {
            "enemies_defeated": 0,
            "enemies_reached_base": 0,
            "towers_built": 0,
            "wave_completed": False,
            "game_won": False,
            "game_lost": False,
            "action_success": self.last_action_success
        }

    def tick(self) -> Dict:
        """
        Advance game by one frame (1/60 second).
        Returns events that occurred this tick.
        """
        if not self.episode_active:
            return self.events

        self._reset_events()
        self.time += self.dt

        # Check if we need to start next wave
        if not self.wave_active and not self.between_waves:
            self._start_next_wave()

        # Spawn enemies if wave is active
        if self.wave_active and self.enemies_spawned < self.enemies_to_spawn:
            self._spawn_enemies()

        # Move enemies
        self._move_enemies()

        # Towers shoot
        self._towers_shoot()

        # Check wave completion
        if self.wave_active and len(self.enemies) == 0 and self.enemies_spawned >= self.enemies_to_spawn:
            self._complete_wave()

        # Check defeat
        if self.lives <= 0:
            self.episode_active = False
            self.defeat = True
            self.events["game_lost"] = True

        return self.events

    def _start_next_wave(self):
        """Start the next wave if available"""
        if self.current_wave >= self.total_waves:
            # All waves completed!
            self.episode_active = False
            self.victory = True
            self.events["game_won"] = True
            return

        # Start prep time if just starting wave
        if self.wave_start_time == 0:
            self.wave_start_time = self.time
            return

        # Wait for prep time
        if self.time - self.wave_start_time < self.wave_prep_time:
            return

        # Start wave
        self.wave_active = True
        enemies_count, spacing = self.wave_config[self.current_wave]
        self.enemies_to_spawn = enemies_count
        self.enemies_spawned = 0
        self.spawn_spacing = spacing
        self.last_spawn_time = self.time

    def _spawn_enemies(self):
        """Spawn enemies based on wave configuration"""
        if self.time - self.last_spawn_time >= self.spawn_spacing:
            enemy = Enemy(
                id=self.next_enemy_id,
                x=0.0,
                y=self.path_row,
                hp=30,
                max_hp=30
            )
            self.enemies.append(enemy)
            self.next_enemy_id += 1
            self.enemies_spawned += 1
            self.last_spawn_time = self.time

    def _move_enemies(self):
        """Move all enemies along the path"""
        enemies_to_remove = []

        for enemy in self.enemies:
            # Move enemy
            enemy.x += enemy.speed * self.dt

            # Check if reached base
            if enemy.x >= self.grid_width - 1:
                enemies_to_remove.append(enemy)
                self.lives -= 1
                self.events["enemies_reached_base"] += 1

        # Remove enemies that reached base
        for enemy in enemies_to_remove:
            self.enemies.remove(enemy)

    def _towers_shoot(self):
        """All towers attempt to shoot enemies in range"""
        for tower in self.towers:
            # Check if tower can shoot (cooldown)
            if self.time - tower.last_shot_time < (1.0 / tower.attack_speed):
                continue

            # Find closest enemy in range
            target = self._find_closest_enemy_in_range(tower)

            if target:
                # Shoot target
                target.hp -= tower.damage
                tower.last_shot_time = self.time

                # Check if enemy died
                if target.hp <= 0:
                    self.enemies.remove(target)
                    self.gold += target.gold_reward
                    tower.kills += 1
                    self.events["enemies_defeated"] += 1

    def _find_closest_enemy_in_range(self, tower: Tower) -> Optional[Enemy]:
        """Find the closest enemy within tower range"""
        closest = None
        min_distance = float('inf')

        for enemy in self.enemies:
            # Calculate Manhattan distance
            distance = abs(tower.x - int(enemy.x)) + abs(tower.y - enemy.y)

            if distance <= tower.range and distance < min_distance:
                min_distance = distance
                closest = enemy

        return closest

    def _complete_wave(self):
        """Complete current wave and prepare for next"""
        self.wave_active = False
        self.between_waves = True
        self.wave_start_time = self.time
        self.current_wave += 1

        # Give wave completion bonus
        self.gold += 30
        self.events["wave_completed"] = True

        # Reset for next wave after delay
        # (AI will make decisions during this time)

    def execute_action(self, action: str) -> Dict:
        """
        Execute an AI action.

        Args:
            action: One of BUILD_LEFT, BUILD_CENTER, BUILD_RIGHT, SAVE, SELL_OLDEST

        Returns:
            Dict of events that occurred
        """
        self._reset_events()
        self.last_action = action

        if action == "BUILD_LEFT":
            success = self._build_tower_in_zone(1, 3)
            self.last_action_success = success
            if success:
                self.events["towers_built"] += 1

        elif action == "BUILD_CENTER":
            success = self._build_tower_in_zone(4, 6)
            self.last_action_success = success
            if success:
                self.events["towers_built"] += 1

        elif action == "BUILD_RIGHT":
            success = self._build_tower_in_zone(7, 8)
            self.last_action_success = success
            if success:
                self.events["towers_built"] += 1

        elif action == "SAVE":
            # Do nothing, just save gold
            self.last_action_success = True

        elif action == "SELL_OLDEST":
            success = self._sell_oldest_tower()
            self.last_action_success = success

        else:
            self.last_action_success = False

        self.events["action_success"] = self.last_action_success
        return self.events

    def _build_tower_in_zone(self, min_col: int, max_col: int) -> bool:
        """
        Try to build a tower in the specified column range.
        Finds first available spot.
        """
        if self.gold < 50:
            return False

        # Try each column in zone
        for x in range(min_col, max_col + 1):
            # Try rows above and below path
            for y in [self.path_row - 1, self.path_row + 1,
                     self.path_row - 2, self.path_row + 2]:
                if y < 0 or y >= self.grid_height:
                    continue

                # Check if spot is available
                if self._can_build_at(x, y):
                    # Build tower
                    tower = Tower(
                        id=self.next_tower_id,
                        x=x,
                        y=y
                    )
                    self.towers.append(tower)
                    self.next_tower_id += 1
                    self.gold -= 50
                    return True

        return False

    def _can_build_at(self, x: int, y: int) -> bool:
        """Check if we can build a tower at this position"""
        # Can't build on path
        if y == self.path_row:
            return False

        # Can't build on occupied tile
        for tower in self.towers:
            if tower.x == x and tower.y == y:
                return False

        return True

    def _sell_oldest_tower(self) -> bool:
        """Sell the oldest tower (first built)"""
        if not self.towers:
            return False

        tower = self.towers[0]
        self.towers.remove(tower)
        self.gold += tower.sell_value
        return True

    def get_state(self) -> Dict:
        """
        Get current game state.
        Returns complete game state for visualization and RL.
        """
        return {
            "grid": {
                "width": self.grid_width,
                "height": self.grid_height,
                "path_row": self.path_row
            },
            "enemies": [
                {
                    "id": e.id,
                    "x": e.x,
                    "y": e.y,
                    "hp": e.hp,
                    "max_hp": e.max_hp
                }
                for e in self.enemies
            ],
            "towers": [
                {
                    "id": t.id,
                    "x": t.x,
                    "y": t.y,
                    "kills": t.kills
                }
                for t in self.towers
            ],
            "resources": {
                "gold": self.gold,
                "lives": self.lives
            },
            "wave": {
                "current": self.current_wave + 1,  # 1-indexed for display
                "total": self.total_waves,
                "active": self.wave_active,
                "between_waves": self.between_waves,
                "enemies_remaining": len(self.enemies)
            },
            "episode": {
                "active": self.episode_active,
                "victory": self.victory,
                "defeat": self.defeat
            },
            "last_action": self.last_action,
            "last_action_success": self.last_action_success,
            "time": self.time
        }

    def get_valid_actions(self) -> List[str]:
        """Get list of currently valid actions"""
        actions = ["SAVE"]  # Can always save

        # Can build if have gold
        if self.gold >= 50:
            actions.extend(["BUILD_LEFT", "BUILD_CENTER", "BUILD_RIGHT"])

        # Can sell if have towers
        if self.towers:
            actions.append("SELL_OLDEST")

        return actions

    def is_done(self) -> bool:
        """Check if episode is complete"""
        return not self.episode_active
