# Simplified Game Rules - Phase 1 Tower Defense

## Core Concept
A tower defense game stripped to its absolute essentials for clear RL learning.

## Game Board

### Grid Layout (10x10)
```
    0   1   2   3   4   5   6   7   8   9
0   .   .   .   .   .   .   .   .   .   .
1   .   .   .   .   .   .   .   .   .   .
2   .   .   .   .   .   .   .   .   .   .
3   .   .   .   .   .   .   .   .   .   .
4   .   .   .   .   .   .   .   .   .   .
5   S============================>====B   <-- Enemy Path (row 5)
6   .   .   .   .   .   .   .   .   .   .
7   .   .   .   .   .   .   .   .   .   .
8   .   .   .   .   .   .   .   .   .   .
9   .   .   .   .   .   .   .   .   .   .

S = Spawn point (0, 5)
B = Base (9, 5)
= = Path tiles (enemies walk here)
. = Buildable tiles (can place towers)
```

### Tower Placement Zones
```
LEFT ZONE:   Columns 1-3
CENTER ZONE: Columns 4-6
RIGHT ZONE:  Columns 7-8
```

## Game Elements

### Tower (Only ONE type in Phase 1)
```yaml
BasicTower:
  Cost: 50 gold
  Damage: 10 hp
  Range: 2 tiles (manhattan distance)
  Attack Speed: 1 shot per second
  Target Priority: Closest enemy
  Sell Value: 35 gold (70% of cost)
```

### Enemy (Only ONE type in Phase 1)
```yaml
BasicEnemy:
  HP: 30
  Speed: 1 tile per second
  Gold Reward: 20 (when killed)
  Damage to Base: 1 life (if reaches base)
```

### Resources
```yaml
Starting Gold: 100
Starting Lives: 20
Gold per Wave Survived: 30 bonus
```

## Wave Structure

### Phase 1 Waves (Fixed)
```
Wave 1: 5 enemies, 2 second spacing
Wave 2: 7 enemies, 1.5 second spacing
Wave 3: 10 enemies, 1 second spacing
```

### Wave Timing
- 5 seconds prep time before Wave 1
- 10 seconds between waves
- Game ends after Wave 3 or when lives = 0

## Game Flow

### 1. Start of Episode
```
1. Reset gold to 100
2. Reset lives to 20
3. Clear all towers
4. Start 5-second countdown
```

### 2. During Wave
```
Every frame (60 fps):
1. Spawn enemies (if scheduled)
2. Move enemies along path
3. Towers acquire targets
4. Towers shoot (if target in range)
5. Apply damage
6. Remove dead enemies (give gold)
7. Check if enemies reached base (lose life)
```

### 3. Between Waves
```
1. Give wave completion bonus (30 gold)
2. AI makes decisions (build/save/sell)
3. Wait 10 seconds
4. Start next wave
```

### 4. End Conditions
```
Victory: Complete all 3 waves with lives > 0
Defeat: Lives reach 0
```

## Tower Mechanics

### Range Calculation
```python
def in_range(tower_x, tower_y, enemy_x, enemy_y):
    distance = abs(tower_x - enemy_x) + abs(tower_y - enemy_y)
    return distance <= 2
```

### Damage Application
```python
def shoot(tower, enemy):
    enemy.hp -= tower.damage  # Instant damage, no projectile
    if enemy.hp <= 0:
        player.gold += 20
        enemy.remove()
```

### Build Restrictions
- Cannot build on path tiles
- Cannot build on occupied tiles
- Must have enough gold

## AI Decision Points

### When AI Makes Decisions
1. **Start of game** (before Wave 1)
2. **After each wave** (during 10-second break)
3. **Every 5 seconds during wave** (optional, can be disabled)

### Decision Process
```python
1. Get current state
2. Look up Q-values for state
3. Choose action (epsilon-greedy)
4. Execute action if valid
5. Calculate reward
6. Update Q-table
```

## State Representation (Discrete)

### State Variables
```python
state = {
    "gold_level": gold_to_level(gold),        # 0, 1, or 2
    "enemies_on_field": count_enemies(),      # 0, 1, or 2
    "towers_built": count_towers(),           # 0, 1, or 2
    "wave_progress": get_wave_progress(),     # 0, 1, or 2
    "last_action_success": last_success()     # 0 or 1
}
```

### Discretization Functions
```python
def gold_to_level(gold):
    if gold < 50: return 0   # Poor
    if gold < 100: return 1  # Okay
    return 2                 # Rich

def count_enemies():
    n = len(enemies)
    if n == 0: return 0      # None
    if n <= 3: return 1      # Few
    return 2                 # Many

def count_towers():
    n = len(towers)
    if n == 0: return 0      # None
    if n <= 2: return 1      # Few
    return 2                 # Many

def get_wave_progress():
    if wave_number == 1: return 0  # Early
    if wave_number == 2: return 1  # Middle
    return 2                        # Late
```

## Reward Events

### Events That Trigger Rewards
```python
rewards = {
    "enemy_defeated": 10,       # When tower kills enemy
    "enemy_reached_base": -50,  # When enemy reaches base
    "tower_built": -2,           # When AI builds tower
    "gold_saved": 1,             # Per 10 gold at wave end
    "wave_completed": 20,        # When wave ends with lives > 0
    "game_won": 100,             # Complete all waves
    "game_lost": -100            # Lives reach 0
}
```

### Reward Calculation Example
```python
def calculate_reward(old_state, action, new_state, events):
    reward = 0

    # Event-based rewards
    if events.enemy_defeated:
        reward += config.enemy_defeated * events.enemy_defeated_count

    if events.enemy_reached_base:
        reward += config.enemy_reached_base * events.enemy_count

    if action.startswith("BUILD"):
        reward += config.tower_built

    if action == "SAVE":
        reward += config.gold_saved * (new_state.gold // 10)

    if events.wave_completed:
        reward += config.wave_completed

    return reward
```

## Important Simplifications

### What We DON'T Have (Intentionally)
1. **No tower upgrades** - Only build/sell
2. **No special abilities** - Towers just shoot
3. **No maze building** - Path is fixed
4. **No tower types** - Just one basic tower
5. **No random damage** - Everything deterministic
6. **No projectiles** - Instant damage application
7. **No enemy armor** - Simple HP system
8. **No interest/economy** - Just flat gold rewards

### Why These Simplifications Matter
- **Deterministic**: Same action in same state = same result
- **Observable**: Student can see entire state
- **Learnable**: Small state space (162 states)
- **Debuggable**: Can trace every decision

## Visualization Requirements

### What Students MUST See
1. **Current State Label**: "Poor | Many enemies | Few towers | Early"
2. **Action Taken**: "BUILD_LEFT" with arrow pointing to position
3. **Immediate Reward**: "+10" or "-50" floating text
4. **Q-Value Change**: Old value → New value with color change
5. **Total Episode Reward**: Running sum

### Critical Learning Moments
```
Enemy Defeated:
- Flash green border on screen
- Show "+10" at enemy position
- Update Q-table cell with animation

Enemy Reaches Base:
- Flash red border on screen
- Show "-50" at base
- Lives counter pulses red
- Q-table cell turns more red

Tower Built:
- Show tower placement animation
- Show "-2" at tower position
- Highlight BUILD action in Q-table
```

## Testing Checklist

### Phase 1 Must-Haves
- [ ] Enemies spawn and move at correct speed
- [ ] Towers shoot closest enemy in range
- [ ] Gold increases when enemy killed
- [ ] Lives decrease when enemy reaches base
- [ ] AI can execute all 5 actions
- [ ] State correctly encodes game situation
- [ ] Rewards calculate correctly
- [ ] Q-table updates after each action
- [ ] Q-table visualization shows all states/actions
- [ ] Episode resets properly
- [ ] Training runs for N episodes
- [ ] Student can adjust all 5 reward values
- [ ] Graph shows episode rewards over time

If all these work, Phase 1 is complete!