"""
Tower Defense Game Engine - Phase 3
Enhanced with multiple tower types, enemy types, and upgrades
"""

import time
from typing import List, Dict, Tuple, Optional
from dataclasses import dataclass, field
from enum import Enum


class TowerType(Enum):
    """Tower types with different characteristics"""
    ARCHER = "archer"      # Fast, low damage, medium range
    CANNON = "cannon"      # Slow, high damage, short range
    SLOW = "slow"          # Slows enemies, no damage, long range


class EnemyType(Enum):
    """Enemy types with different characteristics"""
    NORMAL = "normal"      # Standard enemy
    FAST = "fast"          # Fast but weak
    TANKY = "tanky"        # Slow but tough
    BOSS = "boss"          # Very tough, high reward


# Tower stats by type: (damage, range, attack_speed, cost, slow_amount)
TOWER_STATS = {
    TowerType.ARCHER: {"damage": 8, "range": 3, "attack_speed": 2.0, "cost": 40, "slow": 0},
    TowerType.CANNON: {"damage": 25, "range": 2, "attack_speed": 0.5, "cost": 60, "slow": 0},
    TowerType.SLOW: {"damage": 0, "range": 4, "attack_speed": 1.0, "cost": 50, "slow": 0.5},
}

# Enemy stats by type: (hp, speed, gold_reward)
ENEMY_STATS = {
    EnemyType.NORMAL: {"hp": 30, "speed": 1.0, "gold": 20},
    EnemyType.FAST: {"hp": 15, "speed": 2.0, "gold": 15},
    EnemyType.TANKY: {"hp": 80, "speed": 0.5, "gold": 35},
    EnemyType.BOSS: {"hp": 200, "speed": 0.3, "gold": 100},
}

# Upgrade costs and multipliers
UPGRADE_COST = 30
UPGRADE_DAMAGE_MULTIPLIER = 1.5
UPGRADE_RANGE_BONUS = 1


@dataclass
class Enemy:
    """Enemy with type-based stats"""
    id: int
    x: float
    y: int
    hp: int
    max_hp: int
    speed: float
    base_speed: float  # Original speed (for slow effect tracking)
    gold_reward: int
    enemy_type: EnemyType = EnemyType.NORMAL
    path_index: int = 0
    slow_timer: float = 0  # Time remaining on slow effect


@dataclass
class Tower:
    """Tower with type and upgrade level"""
    id: int
    x: int
    y: int
    tower_type: TowerType = TowerType.ARCHER
    damage: int = 10
    range: int = 2
    attack_speed: float = 1.0
    slow_amount: float = 0
    last_shot_time: float = 0
    kills: int = 0
    cost: int = 50
    sell_value: int = 35
    level: int = 1  # Upgrade level (1-3)


class TowerDefenseGame:
    """
    Core game engine for Phase 3 Tower Defense.

    New Features:
    - Multiple tower types (Archer, Cannon, Slow)
    - Multiple enemy types (Normal, Fast, Tanky, Boss)
    - Tower upgrades (3 levels)
    - Enhanced wave system with mixed enemy types
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
        self.total_waves = 5  # More waves in Phase 3

        # Wave configuration: list of (enemy_type, count) tuples
        self.wave_config = [
            # Wave 1: Easy - just normal enemies
            [(EnemyType.NORMAL, 5)],
            # Wave 2: Introduce fast enemies
            [(EnemyType.NORMAL, 4), (EnemyType.FAST, 3)],
            # Wave 3: Mix with tanky
            [(EnemyType.NORMAL, 5), (EnemyType.FAST, 3), (EnemyType.TANKY, 2)],
            # Wave 4: Heavy wave
            [(EnemyType.TANKY, 4), (EnemyType.FAST, 5), (EnemyType.NORMAL, 3)],
            # Wave 5: Boss wave
            [(EnemyType.NORMAL, 5), (EnemyType.TANKY, 3), (EnemyType.BOSS, 1)],
        ]

        # Timing
        self.time = 0.0
        self.dt = 1/60  # 60 FPS
        self.wave_start_time = 0.0
        self.wave_prep_time = 5.0
        self.between_wave_time = 10.0

        # Wave spawning state
        self.spawn_queue: List[EnemyType] = []  # Queue of enemy types to spawn
        self.spawn_spacing = 1.5  # Seconds between spawns
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
            "towers_upgraded": 0,
            "wave_completed": False,
            "game_won": False,
            "game_lost": False,
            "action_success": True,
            "boss_defeated": False,
            "fast_defeated": 0,
            "tanky_defeated": 0,
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
        self.spawn_queue = []
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
            "towers_upgraded": 0,
            "wave_completed": False,
            "game_won": False,
            "game_lost": False,
            "action_success": self.last_action_success,
            "boss_defeated": False,
            "fast_defeated": 0,
            "tanky_defeated": 0,
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

        # Update slow effects
        self._update_slow_effects()

        # Between-wave wait handling: when the break is over, allow the next wave to start
        if self.between_waves and (self.time - self.wave_start_time >= self.between_wave_time):
            self.between_waves = False
            self.wave_start_time = self.time  # reset timer for next prep

        # Check if we need to start next wave
        if not self.wave_active and not self.between_waves:
            self._start_next_wave()

        # Spawn enemies from queue
        if self.wave_active and self.spawn_queue:
            self._spawn_enemies()

        # Move enemies
        self._move_enemies()

        # Towers shoot
        self._towers_shoot()

        # Check wave completion
        if self.wave_active and len(self.enemies) == 0 and not self.spawn_queue:
            self._complete_wave()

        # Check defeat
        if self.lives <= 0:
            self.episode_active = False
            self.defeat = True
            self.events["game_lost"] = True

        return self.events

    def _update_slow_effects(self):
        """Update slow effect timers on enemies"""
        for enemy in self.enemies:
            if enemy.slow_timer > 0:
                enemy.slow_timer -= self.dt
                if enemy.slow_timer <= 0:
                    # Restore original speed
                    enemy.speed = enemy.base_speed

    def _start_next_wave(self):
        """Start the next wave if available"""
        if self.current_wave >= self.total_waves:
            self.episode_active = False
            self.victory = True
            self.events["game_won"] = True
            return

        if self.wave_start_time == 0:
            self.wave_start_time = self.time
            return

        if self.time - self.wave_start_time < self.wave_prep_time:
            return

        # Build spawn queue from wave config
        self.wave_active = True
        self.spawn_queue = []
        for enemy_type, count in self.wave_config[self.current_wave]:
            self.spawn_queue.extend([enemy_type] * count)

        self.last_spawn_time = self.time

    def _spawn_enemies(self):
        """Spawn enemies from the queue"""
        if self.time - self.last_spawn_time >= self.spawn_spacing:
            if self.spawn_queue:
                enemy_type = self.spawn_queue.pop(0)
                stats = ENEMY_STATS[enemy_type]

                enemy = Enemy(
                    id=self.next_enemy_id,
                    x=0.0,
                    y=self.path_row,
                    hp=stats["hp"],
                    max_hp=stats["hp"],
                    speed=stats["speed"],
                    base_speed=stats["speed"],
                    gold_reward=stats["gold"],
                    enemy_type=enemy_type
                )
                self.enemies.append(enemy)
                self.next_enemy_id += 1
                self.last_spawn_time = self.time

    def _move_enemies(self):
        """Move all enemies along the path"""
        enemies_to_remove = []

        for enemy in self.enemies:
            enemy.x += enemy.speed * self.dt

            if enemy.x >= self.grid_width - 1:
                enemies_to_remove.append(enemy)
                self.lives -= 1
                self.events["enemies_reached_base"] += 1

        for enemy in enemies_to_remove:
            self.enemies.remove(enemy)

    def _towers_shoot(self):
        """All towers attempt to shoot enemies in range"""
        for tower in self.towers:
            if self.time - tower.last_shot_time < (1.0 / tower.attack_speed):
                continue

            target = self._find_closest_enemy_in_range(tower)

            if target:
                tower.last_shot_time = self.time

                # Slow tower applies slow effect
                if tower.tower_type == TowerType.SLOW:
                    target.slow_timer = 2.0  # 2 second slow
                    target.speed = target.base_speed * (1 - tower.slow_amount)
                else:
                    # Damage tower
                    target.hp -= tower.damage

                    if target.hp <= 0:
                        self._kill_enemy(target, tower)

    def _kill_enemy(self, enemy: Enemy, tower: Tower):
        """Handle enemy death"""
        self.enemies.remove(enemy)
        self.gold += enemy.gold_reward
        tower.kills += 1
        self.events["enemies_defeated"] += 1

        # Track special enemy kills
        if enemy.enemy_type == EnemyType.BOSS:
            self.events["boss_defeated"] = True
        elif enemy.enemy_type == EnemyType.FAST:
            self.events["fast_defeated"] += 1
        elif enemy.enemy_type == EnemyType.TANKY:
            self.events["tanky_defeated"] += 1

    def _find_closest_enemy_in_range(self, tower: Tower) -> Optional[Enemy]:
        """Find the closest enemy within tower range"""
        closest = None
        min_distance = float('inf')

        for enemy in self.enemies:
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

        self.gold += 30 + (self.current_wave * 10)  # Increasing bonus
        self.events["wave_completed"] = True

    def execute_action(self, action: str) -> Dict:
        """
        Execute an AI action.

        Phase 3 Actions:
        - BUILD_ARCHER_LEFT/CENTER/RIGHT
        - BUILD_CANNON_LEFT/CENTER/RIGHT
        - BUILD_SLOW_LEFT/CENTER/RIGHT
        - UPGRADE_OLDEST
        - SAVE
        - SELL_OLDEST
        """
        self._reset_events()
        self.last_action = action

        # Parse action
        if action.startswith("BUILD_"):
            parts = action.split("_")
            if len(parts) == 3:
                tower_type_str = parts[1].lower()
                zone = parts[2]

                tower_type_map = {
                    "archer": TowerType.ARCHER,
                    "cannon": TowerType.CANNON,
                    "slow": TowerType.SLOW,
                }

                if tower_type_str in tower_type_map:
                    tower_type = tower_type_map[tower_type_str]
                    zone_map = {"LEFT": (1, 3), "CENTER": (4, 6), "RIGHT": (7, 8)}

                    if zone in zone_map:
                        min_col, max_col = zone_map[zone]
                        success = self._build_tower(tower_type, min_col, max_col)
                        self.last_action_success = success
                        if success:
                            self.events["towers_built"] += 1
                    else:
                        self.last_action_success = False
                else:
                    self.last_action_success = False
            # Legacy support for Phase 1/2 actions
            elif len(parts) == 2:
                zone = parts[1]
                zone_map = {"LEFT": (1, 3), "CENTER": (4, 6), "RIGHT": (7, 8)}
                if zone in zone_map:
                    min_col, max_col = zone_map[zone]
                    success = self._build_tower(TowerType.ARCHER, min_col, max_col)
                    self.last_action_success = success
                    if success:
                        self.events["towers_built"] += 1
                else:
                    self.last_action_success = False

        elif action == "UPGRADE_OLDEST":
            success = self._upgrade_oldest_tower()
            self.last_action_success = success
            if success:
                self.events["towers_upgraded"] += 1

        elif action == "SAVE":
            self.last_action_success = True

        elif action == "SELL_OLDEST":
            success = self._sell_oldest_tower()
            self.last_action_success = success

        else:
            self.last_action_success = False

        self.events["action_success"] = self.last_action_success
        return self.events

    def _build_tower(self, tower_type: TowerType, min_col: int, max_col: int) -> bool:
        """Build a tower of specified type in the zone"""
        stats = TOWER_STATS[tower_type]
        cost = stats["cost"]

        if self.gold < cost:
            return False

        for x in range(min_col, max_col + 1):
            for y in [self.path_row - 1, self.path_row + 1,
                     self.path_row - 2, self.path_row + 2]:
                if y < 0 or y >= self.grid_height:
                    continue

                if self._can_build_at(x, y):
                    tower = Tower(
                        id=self.next_tower_id,
                        x=x,
                        y=y,
                        tower_type=tower_type,
                        damage=stats["damage"],
                        range=stats["range"],
                        attack_speed=stats["attack_speed"],
                        slow_amount=stats["slow"],
                        cost=cost,
                        sell_value=int(cost * 0.7),
                        level=1
                    )
                    self.towers.append(tower)
                    self.next_tower_id += 1
                    self.gold -= cost
                    return True

        return False

    def _upgrade_oldest_tower(self) -> bool:
        """Upgrade the oldest tower that can be upgraded"""
        for tower in self.towers:
            if tower.level < 3 and self.gold >= UPGRADE_COST:
                tower.level += 1
                tower.damage = int(tower.damage * UPGRADE_DAMAGE_MULTIPLIER)
                tower.range += UPGRADE_RANGE_BONUS
                tower.sell_value += int(UPGRADE_COST * 0.5)
                self.gold -= UPGRADE_COST
                return True
        return False

    def _can_build_at(self, x: int, y: int) -> bool:
        """Check if we can build a tower at this position"""
        if y == self.path_row:
            return False

        for tower in self.towers:
            if tower.x == x and tower.y == y:
                return False

        return True

    def _sell_oldest_tower(self) -> bool:
        """Sell the oldest tower"""
        if not self.towers:
            return False

        tower = self.towers[0]
        self.towers.remove(tower)
        self.gold += tower.sell_value
        return True

    def get_state(self) -> Dict:
        """Get current game state for visualization and RL"""
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
                    "max_hp": e.max_hp,
                    "type": e.enemy_type.value,
                    "is_slowed": e.slow_timer > 0
                }
                for e in self.enemies
            ],
            "towers": [
                {
                    "id": t.id,
                    "x": t.x,
                    "y": t.y,
                    "type": t.tower_type.value,
                    "level": t.level,
                    "kills": t.kills,
                    "damage": t.damage,
                    "range": t.range
                }
                for t in self.towers
            ],
            "resources": {
                "gold": self.gold,
                "lives": self.lives
            },
            "wave": {
                "current": self.current_wave + 1,
                "total": self.total_waves,
                "active": self.wave_active,
                "between_waves": self.between_waves,
                "enemies_remaining": len(self.enemies) + len(self.spawn_queue)
            },
            "episode": {
                "active": self.episode_active,
                "victory": self.victory,
                "defeat": self.defeat
            },
            "last_action": self.last_action,
            "last_action_success": self.last_action_success,
            "time": self.time,
            # Phase 3 additions
            "gold": self.gold,
            "lives": self.lives,
            "current_wave": self.current_wave + 1,
            "total_waves": self.total_waves,
            "game_over": self.victory or self.defeat,
            "victory": self.victory
        }

    def get_valid_actions(self) -> List[str]:
        """Get list of currently valid actions"""
        actions = ["SAVE"]

        # Build actions for each tower type
        for tower_type in TowerType:
            cost = TOWER_STATS[tower_type]["cost"]
            if self.gold >= cost:
                name = tower_type.value.upper()
                actions.extend([
                    f"BUILD_{name}_LEFT",
                    f"BUILD_{name}_CENTER",
                    f"BUILD_{name}_RIGHT"
                ])

        # Upgrade if possible
        if self.gold >= UPGRADE_COST:
            for tower in self.towers:
                if tower.level < 3:
                    actions.append("UPGRADE_OLDEST")
                    break

        # Sell if have towers
        if self.towers:
            actions.append("SELL_OLDEST")

        return actions

    def is_done(self) -> bool:
        """Check if episode is complete"""
        return not self.episode_active
