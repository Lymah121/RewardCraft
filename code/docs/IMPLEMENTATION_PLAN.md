# RewardCraft Tower Defense - Implementation Plan

**For**: Sonnet and future development
**Author**: Claude (Senior Software Developer & Game Designer)
**Date**: November 18, 2024
**Focus**: Clear, pedagogically-sound implementation with manageable scope

## 🎯 Core Design Philosophy

### What Makes Learning Clear
1. **See the State**: Students must SEE what the AI sees (state representation)
2. **See the Decision**: Students must SEE the AI choosing (action selection)
3. **See the Result**: Students must SEE immediate feedback (reward signal)
4. **See the Learning**: Students must SEE behavior change (Q-value updates)

### Critical Simplifications
- **NO neural networks in Phase 1-2** (keep Q-table visible)
- **Discrete state space** (maximum 1000 states initially)
- **Fixed action space** (5-7 actions max)
- **Deterministic outcomes** (no randomness in game mechanics)
- **Single path initially** (complexity comes from tower placement, not navigation)

## 📋 Phase-Based Development Plan

Each phase is a **complete, shippable product**. If we only complete Phase 1, students still learn RL fundamentals.

---

## PHASE 1: Core Learning Loop (Weeks 1-3)
**Goal**: Students understand State → Action → Reward → Learning

### 1.1 Minimal Game Implementation
```python
# Simplified Tower Defense
- Grid: 10x10 fixed
- Path: Single straight line (row 5)
- Towers: ONE type (BasicTower: cost=50, damage=10, range=2)
- Enemies: ONE type (BasicEnemy: hp=30, speed=1, reward=20)
- Waves: 3 fixed waves (5, 7, 10 enemies)
```

### 1.2 State Representation (KEEP IT SIMPLE)
```python
# Only 5 state variables initially
state = {
    "gold_level": 0,  # 0=poor(<50), 1=okay(50-100), 2=rich(>100)
    "enemies_on_field": 0,  # 0=none, 1=few(1-3), 2=many(>3)
    "towers_built": 0,  # 0=none, 1=few(1-2), 2=many(>2)
    "wave_progress": 0,  # 0=early, 1=middle, 2=late
    "last_action_success": 0  # 0=failed, 1=succeeded
}
# Total states: 3 * 3 * 3 * 3 * 2 = 162 states (manageable!)
```

### 1.3 Actions (EXACTLY 5)
```python
actions = [
    "BUILD_LEFT",    # Build tower on left side
    "BUILD_CENTER",  # Build tower in center
    "BUILD_RIGHT",   # Build tower on right side
    "SAVE",          # Do nothing, save gold
    "SELL_OLDEST"    # Sell oldest tower for gold
]
```

### 1.4 Reward Function Interface (SUPER SIMPLE)
```yaml
Level 1 Interface:
┌────────────────────────────────────┐
│ Design Your AI's Rewards           │
├────────────────────────────────────┤
│ When enemy defeated:    [+10] 🎯  │
│ When enemy reaches base: [-50] 💔  │
│ When tower built:        [-2] 🏗️   │
│ When gold saved:         [+1] 💰   │
│ When wave completed:     [+20] ✅  │
└────────────────────────────────────┘
[Train AI] [Reset] [Help]
```

### 1.5 Visualization Requirements
```
Main Screen Layout:
┌─────────────────┬──────────────────┐
│                 │                  │
│  GAME CANVAS    │  AI BRAIN VIEW   │
│                 │                  │
│  Shows towers,  │  Shows Q-table   │
│  enemies, path  │  as colored grid │
│                 │                  │
├─────────────────┴──────────────────┤
│         REWARD DESIGNER            │
├─────────────────────────────────────┤
│         LEARNING GRAPH             │
└─────────────────────────────────────┘
```

### 1.6 Core Learning Display
```python
# Q-Table Visualization (THE MOST IMPORTANT PART)
# Show as heatmap where:
# - Rows = States (show state description on hover)
# - Columns = Actions
# - Color = Q-value (red=bad, green=good)
# - Highlight = Current state/action
```

### 1.7 Implementation Priority
1. **Game loop** (enemies move, towers shoot)
2. **State encoder** (game state → discrete state)
3. **Q-learning algorithm** (simple tabular)
4. **Reward calculator** (based on student design)
5. **Q-table visualizer** (colored grid)
6. **Training loop** (play → learn → update display)

### 1.8 Success Criteria for Phase 1
- [ ] Student can see enemies moving and towers shooting
- [ ] Student can design rewards with sliders
- [ ] Student can watch Q-table colors change during training
- [ ] Student can see agent's behavior improve over episodes
- [ ] Student can identify when agent learns bad behavior

---

## PHASE 2: Meaningful Choices (Weeks 4-5)
**Goal**: Students understand multi-objective optimization and trade-offs

### 2.1 Game Expansion
```python
# Add complexity gradually
- Towers: Add SlowTower (cost=75, damage=5, slow=50%)
- Enemies: Add FastEnemy (hp=20, speed=2, reward=30)
- Waves: 5 waves with mixed enemy types
- Gold: Add interest (5% per wave on saved gold)
```

### 2.2 Enhanced State (Still Discrete)
```python
state = {
    "gold_level": 0-3,  # More granular
    "enemy_types": 0-2,  # None/Fast/Mixed
    "tower_mix": 0-2,    # None/Basic/Mixed
    "wave_number": 0-4,  # Actual wave
    "immediate_threat": 0-2  # Distance to base
}
# Still under 500 states
```

### 2.3 Reward Designer Level 2
```yaml
Multi-Objective Rewards:
┌────────────────────────────────────┐
│ Balance These Goals:               │
├────────────────────────────────────┤
│ Defense Weight:    [====|    ] 70% │
│ Economy Weight:    [==|      ] 30% │
│                                     │
│ Specific Bonuses:                  │
│ Fast enemy killed: [+15] ⚡        │
│ Gold interest earned: [+5] 📈      │
│ Perfect wave (no damage): [+50] 🛡️ │
└────────────────────────────────────┘
```

### 2.4 New Visualizations
- **Strategy Indicator**: Show if AI is defensive/economic/balanced
- **Decision Tree**: Simple tree showing "IF enemy close THEN build"
- **Trade-off Graph**: Show defense vs economy over time

---

## PHASE 3: Strategic Depth (Weeks 6-7)
**Goal**: Students understand conditional logic and specification gaming

### 3.1 Full Game Complexity
```python
# Complete tower defense
- Grid: 15x10 with obstacles
- Towers: 4 types (Basic, Slow, Splash, Economy)
- Enemies: 4 types (Basic, Fast, Tank, Flying)
- Paths: Branching path with strategic positions
```

### 3.2 Conditional Reward Interface
```python
# Visual Condition Builder
IF [wave_number] [<] [5]
   AND [gold] [>] [100]
THEN [action=BUILD_ECONOMY] → [+30]

IF [enemies_near_base] [>] [3]
THEN [action=BUILD_DAMAGE] → [+50]
```

### 3.3 Specification Gaming Scenarios
Pre-built "broken" reward functions that cause:
1. **The Hoarder**: Never builds, just saves
2. **The Spammer**: Builds randomly everywhere
3. **The Quitter**: Gives up after first enemy

Students must debug these!

---

## PHASE 4: Full Designer Mode (Week 8+)
**Goal**: Students become true AI system designers

### 4.1 Code Editor
```python
def student_reward_function(state, action, next_state, info):
    """Students write actual Python"""
    reward = 0

    # Their code here
    if info['enemy_defeated']:
        efficiency = info['damage'] / info['gold_spent']
        reward += 10 * efficiency

    return reward
```

### 4.2 Hyperparameter Control
- Learning rate slider with live updates
- Exploration vs exploitation visualization
- Discount factor effects on long-term planning

---

## 🏗️ Technical Architecture (Simplified)

### Backend Structure
```
/backend/
  /game/
    engine.py         # Simple game loop
    tower_defense.py  # Game rules
    state_encoder.py  # Game → discrete state

  /ai/
    q_learning.py     # Simple tabular Q-learning
    reward_function.py # Student-designed rewards

  /api/
    training_api.py   # REST endpoints
    websocket.py      # Real-time updates

  server.py           # FastAPI app
```

### Frontend Structure
```
/frontend/
  /src/
    /components/
      GameCanvas.tsx       # Simple canvas renderer
      QTableHeatmap.tsx    # Critical visualization
      RewardDesigner.tsx   # Sliders for phase 1-2
      LearningGraph.tsx    # Episode rewards

    /game/
      renderer.ts          # Draw game state
      animations.ts        # Simple movements

    /api/
      training.ts          # WebSocket connection
```

### Key Simplifications
1. **No Redux** - Use React Context for state
2. **No TypeScript strictness** - Allow 'any' for speed
3. **No unit tests initially** - Focus on integration
4. **No authentication** - Local only
5. **No database** - JSON file storage

---

## 📊 Critical Pedagogical Features

### 1. The "AHA!" Moment Creators
```python
# These MUST work perfectly
1. Q-value changes color when action taken
2. Arrow showing "This state → This action → This reward"
3. Before/after behavior comparison
4. "Why did it do that?" explanation
```

### 2. Visual Learning Aids
```
State Bubble: [🏪 Poor | 👹 Many enemies | 🏗️ Few towers]
                           ↓
Action Arrow: ---------> BUILD_CENTER
                           ↓
Reward Burst: ★★★ +10 points! ★★★
                           ↓
Q-Update Animation: Q[state][action] : 2.3 → 5.7 ✨
```

### 3. Common Misconception Handlers
- **"Why isn't it learning?"** → Show exploration vs exploitation
- **"Why does it keep dying?"** → Show reward balance
- **"It worked then broke!"** → Show overfitting to specific wave

---

## 🚀 Implementation Order (CRITICAL PATH)

### Week 1: Playable Game
1. Basic tower defense mechanics
2. Manual play mode
3. Simple graphics

### Week 2: AI Integration
1. State encoder
2. Q-learning algorithm
3. Connect to game

### Week 3: Visualization
1. Q-table heatmap (MOST IMPORTANT)
2. Reward designer UI
3. Learning graph

### Week 4: Polish Phase 1
1. Bug fixes
2. Clear tutorials
3. Test with someone unfamiliar

### Week 5-6: Add Phase 2 Features
(Only if Phase 1 is solid)

---

## ⚠️ Common Pitfalls to Avoid

1. **DON'T** make state space too large (kills learning)
2. **DON'T** add randomness (confuses students)
3. **DON'T** hide the Q-table (it's the main learning tool)
4. **DON'T** make rewards too complex initially
5. **DON'T** add features before core loop works

---

## 📝 Definition of Done for Phase 1

A high school student who has never heard of RL should be able to:
1. ✅ Explain what a state is (what the AI sees)
2. ✅ Explain what an action is (what the AI can do)
3. ✅ Explain what a reward is (how the AI learns)
4. ✅ See Q-values change and understand why
5. ✅ Design a reward function that makes the AI win
6. ✅ Design a BAD reward function and predict the behavior
7. ✅ Fix a broken reward function by observing behavior

If we achieve this in Phase 1, we've succeeded.

---

## 🎮 Sample Student Experience (Phase 1)

```
1. Student opens app
2. Sees simple tower defense with "Play Yourself" button
3. Plays one round, understands the goal
4. Clicks "Train an AI"
5. Sees reward designer with 5 sliders
6. Adjusts rewards, clicks "Start Training"
7. Watches split screen:
   - Left: Game playing itself
   - Right: Q-table changing colors
8. Sees AI fail initially (red squares in Q-table)
9. Sees AI improve (squares turn green)
10. After 50 episodes, AI wins consistently
11. Student changes rewards to break it
12. Sees AI learn bad behavior
13. "AHA! The rewards control everything!"
```

This is the experience we're building. Everything else is secondary.

---

## Next Documents to Read
1. `API_SPECIFICATION.md` - Exact endpoints and data formats
2. `GAME_RULES_SIMPLIFIED.md` - Precise game mechanics
3. `Q_LEARNING_IMPLEMENTATION.md` - Algorithm details
4. `UI_MOCKUPS.md` - Screen layouts and flows

Remember: **Phase 1 is the MVP**. If we nail Phase 1, we've created something valuable. Everything else is bonus.