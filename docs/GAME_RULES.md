# RewardCraft Tower Defense - Game Rules

## Overview

RewardCraft is an educational tower defense game designed to teach reinforcement learning concepts. The game features a simplified, deterministic design that makes it ideal for Q-learning algorithms to learn optimal strategies.

---

## Game Board

### Grid Layout
- **Size**: 10x10 grid (columns 0-9, rows 0-9)
- **Path**: Straight horizontal line on **row 5**
- **Spawn Point**: Left side at position (0, 5) - marked with "S"
- **Base**: Right side at position (9, 5) - marked with "B"

```
   0   1   2   3   4   5   6   7   8   9
  ┌───┬───┬───┬───┬───┬───┬───┬───┬───┬───┐
0 │   │   │   │   │   │   │   │   │   │   │
  ├───┼───┼───┼───┼───┼───┼───┼───┼───┼───┤
1 │   │   │   │   │   │   │   │   │   │   │
  ├───┼───┼───┼───┼───┼───┼───┼───┼───┼───┤
2 │   │   │   │   │   │   │   │   │   │   │
  ├───┼───┼───┼───┼───┼───┼───┼───┼───┼───┤
3 │   │ T │   │   │ T │   │   │ T │   │   │  ← Tower row (above path)
  ├───┼───┼───┼───┼───┼───┼───┼───┼───┼───┤
4 │   │ T │   │   │ T │   │   │ T │   │   │  ← Tower row (above path)
  ├───┼───┼───┼───┼───┼───┼───┼───┼───┼───┤
5 │ S │ ● │ ● │ ● │ → │ → │ → │ → │ → │ B │  ← ENEMY PATH (row 5)
  ├───┼───┼───┼───┼───┼───┼───┼───┼───┼───┤
6 │   │ T │   │   │ T │   │   │ T │   │   │  ← Tower row (below path)
  ├───┼───┼───┼───┼───┼───┼───┼───┼───┼───┤
7 │   │ T │   │   │ T │   │   │ T │   │   │  ← Tower row (below path)
  ├───┼───┼───┼───┼───┼───┼───┼───┼───┼───┤
8 │   │   │   │   │   │   │   │   │   │   │
  ├───┼───┼───┼───┼───┼───┼───┼───┼───┼───┤
9 │   │   │   │   │   │   │   │   │   │   │
  └───┴───┴───┴───┴───┴───┴───┴───┴───┴───┘

S = Spawn Point    B = Base    T = Tower positions    ● = Enemies
```

---

## Resources

### Starting Resources
| Resource | Starting Value | Description |
|----------|---------------|-------------|
| Gold | 100 | Currency for building towers |
| Lives | 20 | Health points - game over at 0 |

### Earning Gold
- **Defeating an enemy**: +20 gold
- **Completing a wave**: +30 gold bonus

---

## Enemies

### Enemy Statistics
| Property | Value | Description |
|----------|-------|-------------|
| HP | 30 | Health points |
| Speed | 1.0 | Tiles per second |
| Gold Reward | 20 | Gold earned when defeated |

### Enemy Behavior
1. Enemies spawn at the **left side** (column 0, row 5)
2. They move **right** along the path at constant speed
3. If an enemy reaches the **base** (column 9), you lose **1 life**
4. Enemies are removed when defeated or when they reach the base

---

## Towers

### Tower Statistics
| Property | Value | Description |
|----------|-------|-------------|
| Cost | 50 gold | Price to build |
| Sell Value | 35 gold | Gold returned when sold (70%) |
| Damage | 10 | Damage per shot |
| Range | 2 | Manhattan distance |
| Attack Speed | 1.0 | Attacks per second |

### Tower Placement Rules
- **Cannot** build on the path (row 5)
- **Cannot** build on occupied tiles
- Towers can only be built in designated zones (see Actions)
- Build priority: Rows closest to path first (rows 4, 6, then 3, 7)

### Tower Targeting
- Towers automatically shoot the **closest enemy** within range
- Range is calculated using **Manhattan distance**: |tower_x - enemy_x| + |tower_y - enemy_y|
- Towers have a cooldown of 1 second between shots

---

## Waves

### Wave Configuration
| Wave | Enemies | Spawn Spacing | Description |
|------|---------|---------------|-------------|
| Wave 1 | 5 enemies | 2.0 seconds | Easy - time to build |
| Wave 2 | 7 enemies | 1.5 seconds | Medium - faster spawns |
| Wave 3 | 10 enemies | 1.0 seconds | Hard - rapid spawns |

### Wave Timing
- **Prep Time**: 5 seconds before first wave starts
- **Between Waves**: 10 seconds between waves (time to build more towers)

### Victory Condition
- Complete all 3 waves with at least 1 life remaining

### Defeat Condition
- Lose all 20 lives (lives reach 0)

---

## AI Actions

The AI can perform **5 actions**:

| Action | Description | Requirement |
|--------|-------------|-------------|
| `BUILD_LEFT` | Build tower in columns 1-3 | 50+ gold |
| `BUILD_CENTER` | Build tower in columns 4-6 | 50+ gold |
| `BUILD_RIGHT` | Build tower in columns 7-8 | 50+ gold |
| `SAVE` | Do nothing, save gold | Always available |
| `SELL_OLDEST` | Sell the first tower built | At least 1 tower |

### Build Zones
```
   0   1   2   3   4   5   6   7   8   9
      ╔═══════════╗ ╔═══════════╗ ╔═══════╗
      ║   LEFT    ║ ║  CENTER   ║ ║ RIGHT ║
      ║  cols 1-3 ║ ║  cols 4-6 ║ ║ cols  ║
      ║           ║ ║           ║ ║  7-8  ║
      ╚═══════════╝ ╚═══════════╝ ╚═══════╝
```

---

## Rewards (Default Configuration)

The AI learns through rewards. Students can adjust these values:

| Event | Default Reward | Description |
|-------|---------------|-------------|
| Enemy Defeated | +10 | Reward for killing an enemy |
| Enemy Reached Base | -50 | Penalty for losing a life |
| Tower Built | -2 | Small cost for building |
| Gold Saved | +1 per 10 gold | Bonus for saving gold |
| Wave Completed | +20 | Bonus for finishing a wave |
| Game Won | +100 | Big bonus for victory |
| Game Lost | -100 | Big penalty for defeat |

### Reward Design Tips
- **Aggressive AI**: Increase `enemy_defeated`, decrease `tower_built` penalty
- **Defensive AI**: Increase `enemy_reached_base` penalty
- **Economic AI**: Increase `gold_saved` bonus
- **Risk-Taking AI**: Decrease penalties, increase `game_won` bonus

---

## State Representation (For Q-Learning)

The game state is discretized into 162 possible states:

| Variable | Values | Description |
|----------|--------|-------------|
| Gold Level | 0=Poor(<50), 1=Okay(50-100), 2=Rich(>100) | Current gold |
| Enemies on Field | 0=None, 1=Few(1-3), 2=Many(4+) | Active enemies |
| Towers Built | 0=None, 1=Few(1-2), 2=Many(3+) | Tower count |
| Wave Progress | 0=Early(wave 1), 1=Middle(wave 2), 2=Late(wave 3) | Current wave |
| Last Action Success | 0=Failed, 1=Success | Previous action result |

**Total States**: 3 × 3 × 3 × 3 × 2 = **162 states**

---

## Game Timing

| Event | Duration |
|-------|----------|
| Game tick | 1/60 second (60 FPS) |
| Wave prep time | 5 seconds |
| Between waves | 10 seconds |
| Tower cooldown | 1 second |
| Enemy speed | 1 tile per second |

---

## Strategy Tips

1. **Early Game**: Build towers in the LEFT zone first - enemies are slow
2. **Mid Game**: Fill CENTER zone - enemies spawn faster
3. **Late Game**: Cover RIGHT zone - catch enemies your other towers missed
4. **Economy**: Don't overbuild - save gold for emergencies
5. **Selling**: Sell oldest towers if you need emergency gold

---

## Understanding the Q-Table (AI Brain View)

The Q-Table is the "brain" of the AI - it stores learned values for every state-action pair. This is the core of Q-Learning!

### What is a Q-Table?

A Q-Table is a lookup table where:
- **Rows** = States (situations the AI can be in)
- **Columns** = Actions (choices the AI can make)
- **Cells** = Q-Values (how good that action is in that state)

```
                    ┌─────────┬─────────┬─────────┬─────────┬─────────────┐
                    │  LEFT   │ CENTER  │  RIGHT  │  SAVE   │ SELL_OLDEST │
┌───────────────────┼─────────┼─────────┼─────────┼─────────┼─────────────┤
│ Poor, No enemies  │  72.2   │  74.7   │  73.9   │  80.0   │    73.3     │
├───────────────────┼─────────┼─────────┼─────────┼─────────┼─────────────┤
│ Rich, Few enemies │  38.8   │  14.3   │  27.4   │ 133.1   │     5.0     │
├───────────────────┼─────────┼─────────┼─────────┼─────────┼─────────────┤
│ Okay, Many towers │  -0.1   │  -0.0   │   8.0   │   1.9   │    68.5     │
└───────────────────┴─────────┴─────────┴─────────┴─────────┴─────────────┘
```

### Q-Value Color Coding

| Color | Q-Value Range | Meaning |
|-------|---------------|---------|
| 🟥 Red | < -5 | Very Bad - avoid this action |
| 🟧 Light Red | -5 to 0 | Bad - usually leads to poor outcomes |
| 🟨 Yellow | 0 to 5 | Neutral - uncertain or average |
| 🟩 Light Green | 5 to 10 | Good - positive expected outcome |
| 🟢 Green | > 10 | Very Good - best action to take |

### How to Read the Q-Table

1. **Find the current state row** (highlighted with yellow border)
2. **Look across the columns** to see Q-values for each action
3. **The highest Q-value** indicates the best action the AI has learned
4. **Green cells** = AI prefers this action in this state
5. **Red cells** = AI has learned to avoid this action

### Example Reading

If the state is "Rich | No enemies | No towers | Early":
```
LEFT: 29.2  CENTER: 16.7  RIGHT: 20.0  SAVE: 142.1  SELL: 1.9
```
- The AI learned **SAVE (142.1)** is the best action here
- This makes sense: when rich with no enemies, save gold for later!

### Q-Table Statistics

| Statistic | Description |
|-----------|-------------|
| **States** | Number of unique states the AI has visited |
| **Steps** | Total actions taken during training |
| **Exploration** | % chance of random action (epsilon) |

### How Q-Values Are Updated

The AI uses the **Q-Learning formula**:

```
Q(s,a) = Q(s,a) + α × [R + γ × max(Q(s',a')) - Q(s,a)]
```

Where:
- `Q(s,a)` = Current Q-value for state s and action a
- `α` = Learning rate (0.1) - how fast to learn
- `R` = Reward received
- `γ` = Discount factor (0.95) - how much to value future rewards
- `max(Q(s',a'))` = Best Q-value in the next state

### What the AI Learns

After training, patterns emerge in the Q-Table:

| Pattern | What It Means |
|---------|---------------|
| High SAVE values when rich | AI learned to save gold strategically |
| High BUILD values when poor | AI learned early building is important |
| High SELL values with many towers | AI learned to sell when over-built |
| Negative values for actions | AI learned these actions lead to losses |

### State Labels Explained

Each state label has 5 components:

```
"Rich | Few enemies | Many towers | Middle | Success"
  │         │             │          │         │
  │         │             │          │         └── Last action worked
  │         │             │          └── Wave 2 (middle game)
  │         │             └── 3+ towers built
  │         └── 1-3 enemies on field
  └── 100+ gold available
```

---

## Technical Notes

- **Deterministic**: Same actions in same state always produce same result
- **Turn-based decisions**: AI makes one decision, then game simulates
- **Manhattan distance**: Used for range calculation (no diagonals)
- **FIFO selling**: `SELL_OLDEST` always sells the first tower you built
- **Tabular Q-Learning**: Uses a table (not neural network) for simplicity
