# 🎮 RewardCraft Tower Defense - Implementation Guide for Sonnet

## Welcome, Sonnet! 👋

You're about to build an educational game that teaches high school students Reinforcement Learning through tower defense. This document contains everything you need to succeed.

## 🎯 Mission Statement

Build a game where students design reward functions to train an AI that plays tower defense. The AI learns through Q-learning, and students can SEE the learning process happening in real-time.

**Core Learning Goal**: Students understand that AI behavior is controlled by rewards.

## 📚 Essential Documents to Read (In Order)

1. **IMPLEMENTATION_PLAN.md** - The master plan with phases
2. **GAME_RULES_SIMPLIFIED.md** - Exact game mechanics for Phase 1
3. **API_SPECIFICATION.md** - All endpoints and data formats
4. **Q_LEARNING_IMPLEMENTATION.md** - Complete algorithm code
5. **UI_MOCKUPS.md** - Screen layouts and visual design

## 🚀 Quick Start Implementation Path

### Day 1-2: Core Game Engine
```python
# Start with backend/game/engine.py
1. Create 10x10 grid
2. Fixed path on row 5
3. Enemy movement (1 tile/second)
4. Tower shooting (instant damage)
5. Gold/lives tracking
```

### Day 3-4: Q-Learning Integration
```python
# Use code from Q_LEARNING_IMPLEMENTATION.md
1. Copy the QLearningAgent class
2. Copy the StateEncoder class
3. Copy the RewardCalculator class
4. Test with hardcoded rewards first
```

### Day 5-6: FastAPI Backend
```python
# Follow API_SPECIFICATION.md exactly
1. Set up FastAPI server
2. Implement /api/game/* endpoints
3. Add WebSocket for real-time updates
4. Test with Postman/Insomnia
```

### Day 7-8: React Frontend
```javascript
// Focus on visualization
1. Canvas for game rendering
2. Heatmap for Q-table
3. Sliders for reward design
4. WebSocket connection
```

### Day 9-10: Integration & Polish
```
1. Connect frontend to backend
2. Test full training loop
3. Add animations for learning
4. Fix bugs
```

## ⚠️ Critical Success Factors

### MUST HAVE in Phase 1
✅ **Q-table is ALWAYS visible** as a heatmap
✅ **Current state/action highlighted** in real-time
✅ **Rewards appear as floating numbers** when earned
✅ **Only 5 actions** (BUILD_LEFT, BUILD_CENTER, BUILD_RIGHT, SAVE, SELL_OLDEST)
✅ **Only 162 states** (3×3×3×3×2)
✅ **No randomness** in game mechanics
✅ **Students can adjust 5 reward sliders**

### DON'T Build (Yet)
❌ Multiple tower types
❌ Complex enemy types
❌ Neural networks
❌ Saving/loading
❌ User accounts
❌ Complex animations
❌ Sound effects

## 🏗️ Project Structure

```
/code/
  /backend/
    /game/
      engine.py          # Core game loop (YOU START HERE)
      state_encoder.py   # Convert game → discrete state
    /ai/
      q_learning.py      # Q-learning agent (COPY FROM DOCS)
      reward_function.py # Student reward calculator
      trainer.py         # Training loop manager
    /api/
      routes.py          # REST endpoints
      websocket.py       # Real-time updates
    main.py             # FastAPI app entry point

  /frontend/
    /src/
      /components/
        GameCanvas.tsx   # Render tower defense game
        QTableHeatmap.tsx # MOST IMPORTANT COMPONENT
        RewardDesigner.tsx # Sliders for rewards
      /hooks/
        useWebSocket.ts  # Connect to backend
      App.tsx           # Main layout

  /shared/
    types.ts            # Shared TypeScript types
```

## 💡 Implementation Tips

### For the Game Engine
```python
class TowerDefenseGame:
    def __init__(self):
        self.grid = [[0]*10 for _ in range(10)]  # Simple 2D array
        self.path = [(i, 5) for i in range(10)]  # Row 5 is path
        self.enemies = []  # List of dicts
        self.towers = []   # List of dicts
        self.gold = 100
        self.lives = 20

    def tick(self):
        """Called 60 times per second"""
        self.move_enemies()
        self.towers_shoot()
        self.check_collisions()
```

### For the Q-Table Visualization
```javascript
// This is THE MOST IMPORTANT visualization
const QTableHeatmap = ({ qTable }) => {
  return (
    <div className="grid grid-cols-6"> {/* 5 actions + 1 for labels */}
      {Object.entries(qTable).map(([state, actions]) => (
        <div key={state} className="flex">
          <div className="state-label">{state}</div>
          {Object.entries(actions).map(([action, qValue]) => (
            <div
              className="q-cell"
              style={{
                backgroundColor: getHeatmapColor(qValue),
                border: isCurrentStateAction(state, action) ? '3px solid yellow' : 'none'
              }}
            >
              {qValue.toFixed(1)}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};
```

### For the Reward Designer
```javascript
// Keep it dead simple
const RewardDesigner = ({ onUpdate }) => {
  const [rewards, setRewards] = useState({
    enemy_defeated: 10,
    enemy_reached_base: -50,
    tower_built: -2,
    gold_saved: 1,
    wave_completed: 20
  });

  return (
    <div>
      {Object.entries(rewards).map(([key, value]) => (
        <div key={key}>
          <label>{formatLabel(key)}</label>
          <input
            type="range"
            min="-100"
            max="100"
            value={value}
            onChange={e => updateReward(key, e.target.value)}
          />
          <span>{value}</span>
        </div>
      ))}
      <button onClick={() => onUpdate(rewards)}>Apply Changes</button>
    </div>
  );
};
```

## 🧪 Testing Checklist

### Before Showing to Anyone
- [ ] Can you manually play the game?
- [ ] Do enemies move at correct speed (1 tile/sec)?
- [ ] Do towers shoot enemies in range?
- [ ] Does gold increase when enemy killed?
- [ ] Does the AI make decisions?
- [ ] Does the Q-table update visually?
- [ ] Can you adjust reward sliders?
- [ ] Does the AI behavior change with different rewards?

### The "Aha!" Moment Test
1. Set "enemy_defeated" reward to +50
2. Set "tower_built" reward to -50
3. Watch AI refuse to build towers
4. Student says "Oh! The reward controls everything!"
5. ✅ Success!

## 🐛 Common Issues & Solutions

### Issue: Q-table too big to visualize
**Solution**: Only show states that have been visited

### Issue: AI not learning
**Solution**: Check epsilon (should start at 0.1), learning rate (0.1), and reward scale

### Issue: Game runs too fast
**Solution**: Add speed control (1x, 2x, 5x, pause)

### Issue: State encoding wrong
**Solution**: Use the exact discretization from GAME_RULES_SIMPLIFIED.md

### Issue: WebSocket disconnecting
**Solution**: Implement heartbeat ping every 30 seconds

## 📞 Communication

When you have questions, refer to these docs first:
1. Implementation question? → Check `IMPLEMENTATION_PLAN.md`
2. Game mechanics? → Check `GAME_RULES_SIMPLIFIED.md`
3. API format? → Check `API_SPECIFICATION.md`
4. Algorithm details? → Check `Q_LEARNING_IMPLEMENTATION.md`

## 🎓 Remember the Pedagogical Goal

Every line of code should help students understand:
1. **States** - What the AI "sees"
2. **Actions** - What the AI can "do"
3. **Rewards** - How the AI "learns"
4. **Q-values** - The AI's "memory"

If a feature doesn't help teach these concepts, it can wait for Phase 2.

## 🏁 Definition of Success

A high school student who has never heard of RL can:
1. Explain what rewards do
2. Design rewards that make the AI win
3. Design BAD rewards and predict the failure
4. See and understand the Q-table changes

**Everything else is bonus.**

---

Good luck, Sonnet! Remember: **Phase 1 is the MVP**. Get that working first, and everything else becomes easier.

Start with `backend/game/engine.py` and build from there. You've got this! 🚀