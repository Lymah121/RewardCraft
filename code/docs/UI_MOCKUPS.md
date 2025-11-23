# UI Mockups & Screen Flows - RewardCraft Tower Defense

## Design Principles
- **Clarity Over Aesthetics**: Every element teaches something
- **Split Attention**: Game on left, AI brain on right
- **Color Psychology**: Green = good/reward, Red = bad/penalty, Blue = neutral
- **Immediate Feedback**: Every action has visual response

## Main Screen Layout (1920x1080 target)

```
┌──────────────────────────────────────────────────────────────────────┐
│  RewardCraft: Tower Defense AI Trainer            [?] [Reset] [Quit] │
├────────────────────────┬─────────────────────────────────────────────┤
│                        │                                             │
│     GAME CANVAS        │            AI BRAIN VIEW                   │
│     (720x600)          │            (720x600)                       │
│                        │                                             │
│  [Shows actual game]   │  [Shows Q-table as heatmap]               │
│                        │                                             │
│  Lives: ❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️  │  Current State: "Poor|Many|None|Early"│
│  Gold: 💰 100          │  Best Action: "SAVE" (Q=8.5)              │
│  Wave: 1/3             │  Learning Episode: 23/100                  │
│                        │                                             │
├────────────────────────┴─────────────────────────────────────────────┤
│                         REWARD DESIGNER                              │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │ When enemy defeated:     [━━━━━╋━━━━] +10  🎯               │    │
│  │ When enemy reaches base: [╋━━━━━━━━━] -50  💔               │    │
│  │ When tower built:        [━━╋━━━━━━━] -2   🏗️                │    │
│  │ When gold saved:         [━━━━╋━━━━━] +1   💰               │    │
│  │ When wave completed:     [━━━━━╋━━━━] +20  ✅               │    │
│  └─────────────────────────────────────────────────────────────┐    │
│  [▶️ Start Training] [⏸️ Pause] [⏹️ Stop] [🔄 Reset Rewards]        │
├───────────────────────────────────────────────────────────────────────┤
│                         LEARNING PROGRESS                            │
│  Episode Rewards: [────────────── Graph ─────────────────]          │
│  Win Rate: [████████░░] 80%  |  Avg Reward: 125.3                  │
└───────────────────────────────────────────────────────────────────────┘
```

## Detailed Component Designs

### 1. Game Canvas (Left Panel)
```
┌─────────────────────────────────────┐
│  Grid-based tower defense           │
│  ┌─┬─┬─┬─┬─┬─┬─┬─┬─┬─┐            │
│  ├─┼─┼─┼─┼─┼─┼─┼─┼─┼─┤            │
│  │ │ │ │ │ │ │ │ │ │ │            │
│  ├─┼─┼─┼─┼─┼─┼─┼─┼─┼─┤            │
│  │ │ │🔼│ │ │ │ │ │ │ │  Tower      │
│  ├─┼─┼─┼─┼─┼─┼─┼─┼─┼─┤            │
│  │S│━│━│━│👾│━│━│━│━│B│  Path      │
│  ├─┼─┼─┼─┼─┼─┼─┼─┼─┼─┤            │
│  │ │ │ │ │ │ │🔼│ │ │ │            │
│  ├─┼─┼─┼─┼─┼─┼─┼─┼─┼─┤            │
│  └─┴─┴─┴─┴─┴─┴─┴─┴─┴─┘            │
│                                      │
│  Resources:                          │
│  Lives: ❤️×20  Gold: 💰×100         │
│  Wave: 1/3  Enemies: 5 remaining    │
└─────────────────────────────────────┘

Visual Elements:
- Grid cells: 60x60 pixels
- Towers: Blue triangles with range circles
- Enemies: Red circles with health bars
- Path: Highlighted yellow tiles
- Spawn (S): Green square
- Base (B): Blue castle icon
```

### 2. AI Brain View (Right Panel)
```
┌─────────────────────────────────────┐
│  Q-TABLE HEATMAP                    │
│  ┌─────────────────────────────┐   │
│  │ States ↓  Actions →         │   │
│  │         BUILD BUILD BUILD    │   │
│  │         LEFT  CNTR RIGHT SAVE│   │
│  │ State1  [2.3] [1.5] [0.8] [5.7]│ │
│  │ State2  [-0.5][3.2] [2.1] [4.3]│ │
│  │ State3  [1.1] [2.8] [3.5] [6.2]│ │
│  │ ...                             │ │
│  └─────────────────────────────┘   │
│                                      │
│  Color Scale: [-10]━━━━━━━━━[+10]  │
│               Red  Yellow  Green     │
│                                      │
│  📍 Current State: State2           │
│  🎯 Selected Action: SAVE (Q=4.3)   │
│  📈 Exploration Rate: 10%           │
└─────────────────────────────────────┘

Interactive Features:
- Hover state row: Shows full description
- Click action: Shows why chosen
- Current state/action highlighted with border
- Animation when Q-values update
```

### 3. Reward Designer (Bottom Panel)
```
┌──────────────────────────────────────┐
│  DESIGN YOUR AI'S REWARDS            │
├──────────────────────────────────────┤
│                                       │
│  Enemy Defeated:    [-100]━━╋━━[+100]│
│                            +10 🎯    │
│                                       │
│  Enemy Reaches Base:[-100]╋━━━━[+100]│
│                            -50 💔     │
│                                       │
│  Tower Built:       [-100]━╋━━━[+100]│
│                            -2 🏗️      │
│                                       │
│  Gold Saved:        [-100]━━━╋━[+100]│
│                            +1 💰      │
│                                       │
│  Wave Completed:    [-100]━━━╋━[+100]│
│                            +20 ✅     │
│                                       │
│  [Apply Changes] [Reset to Default]  │
└──────────────────────────────────────┘

Interaction:
- Sliders snap to integer values
- Live preview of total possible reward
- Red/green color coding
- Tooltips explain each reward
```

### 4. Learning Progress Graph
```
┌──────────────────────────────────────┐
│  EPISODE REWARDS OVER TIME           │
│  300 ┤                      ╱        │
│      │                     ╱         │
│  200 ┤                    ╱          │
│      │                ╱╲ ╱           │
│  100 ┤            ╱╲╱  ╰╯            │
│      │        ╱╲╱                    │
│    0 ┤    ╱╲╱                        │
│      │╱╲╱                            │
│ -100 ┤                               │
│      └─┬──┬──┬──┬──┬──┬──┬──┬──┬───│
│        10  20  30  40  50  60  70    │
│                Episodes               │
│                                       │
│  📊 Stats:                           │
│  Best: 250 | Average: 125 | Last: 180│
└──────────────────────────────────────┘

Features:
- Rolling average line (smoother)
- Individual episode dots
- Hover for exact values
- Victory markers (green dots)
- Defeat markers (red dots)
```

## Screen Flow Diagrams

### 1. First Time User Flow
```
START
  ↓
[Welcome Screen]
  ├→ "Play Tutorial"
  │    ↓
  │  [Manual Play Mode]
  │    ↓
  │  "Now Train an AI!"
  ↓
[Main Screen - Reward Designer Highlighted]
  ↓
"Adjust these sliders to teach your AI"
  ↓
[User adjusts rewards]
  ↓
[Click "Start Training"]
  ↓
[Watch AI Learn - Q-table animates]
  ↓
[See results after 100 episodes]
```

### 2. Training Flow Visualization
```
Episode Start
  ↓
[Show State] → "Poor|None|None|Early"
  ↓
[Highlight Q-values] → SAVE: 8.5 (best)
  ↓
[Execute Action] → Animation: "SAVE"
  ↓
[Calculate Reward] → Show: "+1" floating
  ↓
[Update Q-table] → Cell flashes, value changes
  ↓
[New State] → "Okay|Few|None|Early"
  ↓
Repeat...
```

## Visual Feedback Animations

### Success Animations
```python
# Enemy Defeated
- Enemy explodes into coins
- "+10" floats up
- Q-table cell pulses green
- Gold counter increments with sparkle

# Wave Completed
- Screen border glows green
- "WAVE COMPLETE!" banner
- Bonus gold rains down
- Win rate % increases
```

### Failure Animations
```python
# Enemy Reaches Base
- Screen shakes
- Red flash at base
- "-50" in large red text
- Heart breaks animation
- Q-table cell pulses red

# Game Lost
- Grayscale filter on game
- "DEFEAT" overlay
- Show "What went wrong?" hint
```

## Color Palette

```css
/* Primary Colors */
--positive-green: #10B981;  /* Rewards, success */
--negative-red: #EF4444;    /* Penalties, failure */
--neutral-blue: #3B82F6;    /* UI elements */
--gold-yellow: #F59E0B;     /* Gold, resources */

/* Q-Table Heatmap */
--q-negative: #DC2626;      /* Q < 0 */
--q-neutral: #FCD34D;       /* Q ≈ 0 */
--q-positive: #10B981;      /* Q > 0 */

/* UI Background */
--bg-primary: #1F2937;      /* Dark gray */
--bg-secondary: #374151;    /* Medium gray */
--text-primary: #F3F4F6;    /* Light gray */
--text-secondary: #9CA3AF;  /* Muted gray */

/* Game Elements */
--tower-color: #60A5FA;     /* Light blue */
--enemy-color: #F87171;     /* Light red */
--path-color: #FDE68A;      /* Light yellow */
```

## Responsive Behavior

### Minimum Resolution: 1280x720
```
At lower resolutions:
- Stack panels vertically
- Reduce Q-table to show only current state ±2
- Simplify reward designer to 3 main rewards
- Hide learning graph (show on tab)
```

### Optimal Resolution: 1920x1080
```
Full layout as shown in mockups
All features visible simultaneously
```

## Accessibility Features

### Visual
- High contrast mode toggle
- Colorblind-friendly palette option
- Adjustable text size
- Screen reader descriptions

### Interaction
- Keyboard navigation
- Tab order logical flow
- Slider keyboard controls (+/- keys)
- Pause on focus loss

## Loading States

### Training Start
```
Q-table shows "Initializing..."
Gentle pulse animation
Progress bar 0-100%
```

### Episode Processing
```
Current action highlights
Arrow shows state transition
Reward appears and fades
Q-value morphs from old to new
```

## Error States

### Invalid Action
```
Red shake animation on action button
"Cannot build here!" tooltip
X mark appears and fades
```

### Training Failed
```
Red overlay on AI brain view
"Training stopped: [Reason]"
[Retry] [Debug] buttons
```

## Tutorial Overlays

### First Time Hints
```
┌─────────────────────┐
│ 👋 Welcome!         │
│                     │
│ This is where you   │
│ design rewards to   │
│ train your AI.      │
│                     │
│ [Got it!] [Tour]    │
└─────────────────────┘
```

Positioned with arrows pointing to relevant UI elements.

## Key Interaction Patterns

1. **Hover = Explain**: Everything has tooltips
2. **Click = Inspect**: Click anything to see details
3. **Drag = Adjust**: Sliders for values
4. **Animation = Learning**: Movement shows AI thinking

This UI design prioritizes **pedagogical clarity** over visual polish. Every pixel teaches something about reinforcement learning.