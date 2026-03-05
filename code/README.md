# 🎮 RewardCraft: Tower Defense AI Trainer

An educational tool that teaches **Reinforcement Learning** to high school students through tower defense gameplay. Students design reward functions and watch AI learn in real-time.

## 🎯 Core Learning Goal

**Students understand that AI behavior is entirely controlled by rewards.**

## 📦 What's Included

- **Tower Defense Game**: Simple 10x10 grid with 3 waves
- **Q-Learning AI**: Tabular Q-learning with 162 discrete states
- **Reward Designer**: Students configure 5 reward parameters
- **Q-Table Heatmap**: Real-time visualization of AI learning
- **Training System**: 100-episode training sessions with live updates

## 🚀 Quick Start

### Prerequisites

- Python 3.8+ (with `uv` package manager)
- Node.js 18+
- Modern web browser

### 1. Start Backend

```bash
cd code/backend
source .venv/bin/activate  # or: .venv\Scripts\activate on Windows
python main.py
```

Backend runs at **http://localhost:8000**

### 2. Start Frontend

In a new terminal:

```bash
cd code/frontend
npm run dev
```

Frontend runs at **http://localhost:3000**

### 3. Open in Browser

Visit **http://localhost:3000** and start training!

## 🎓 Educational Experience

### For Students

1. **Design Rewards**: Adjust sliders to set reward values
   - 🎯 Enemy defeated: +10
   - 💔 Enemy reached base: -50
   - 🏗️ Tower built: -2
   - 💰 Gold saved: +1
   - ✅ Wave completed: +20

2. **Start Training**: Click "Start Training" and watch for 2-3 minutes

3. **Observe Learning**: See the Q-table change from all zeros to colored values
   - Green cells = AI learned this is a good action
   - Red cells = AI learned this is a bad action
   - Yellow cells = Neutral/uncertain

4. **Experiment**: Change rewards and see different behaviors!
   - Make tower_built = -50 → AI won't build towers!
   - Make enemy_defeated = 100 → AI becomes aggressive
   - Make gold_saved = 20 → AI hoards gold

### Key Educational Moments

**"Aha!" Moment 1:**
> "Oh! When I made the tower cost really negative, the AI stopped building towers entirely. The rewards control everything!"

**"Aha!" Moment 2:**
> "Look at the Q-table! The AI learned that SAVing gold is good when it already has towers built!"

**"Aha!" Moment 3:**
> "If I reward defeating enemies but don't penalize losing, the AI doesn't care about defense!"

## 📊 Project Structure

```
code/
├── backend/           # Python FastAPI server
│   ├── game/         # Tower defense engine
│   ├── ai/           # Q-learning algorithm
│   ├── api/          # REST + WebSocket API
│   └── main.py       # Server entry point
│
├── frontend/         # React TypeScript UI
│   ├── src/
│   │   ├── components/
│   │   │   ├── QTableHeatmap.tsx    # Most important!
│   │   │   ├── RewardDesigner.tsx   # Reward sliders
│   │   │   └── GameCanvas.tsx       # Game visualization
│   │   └── hooks/
│   │       └── useWebSocket.ts      # Real-time connection
│   └── package.json
│
└── docs/             # Implementation guides
    ├── IMPLEMENTATION_PLAN.md
    ├── GAME_RULES_SIMPLIFIED.md
    ├── Q_LEARNING_IMPLEMENTATION.md
    └── API_SPECIFICATION.md
```

## 🎮 How It Works

### Game Mechanics

- **Grid**: 10×10 tiles
- **Path**: Row 5 (left to right)
- **Waves**: 3 waves with 5, 7, and 10 enemies
- **Resources**: Start with 100 gold, 20 lives
- **Tower**: Costs 50 gold, does 10 damage, range 2
- **Enemy**: 30 HP, moves 1 tile/second, worth 20 gold

### AI System

- **Algorithm**: Tabular Q-Learning
- **State Space**: 162 states (3×3×3×3×2)
  - Gold level: Poor/Okay/Rich
  - Enemies: None/Few/Many
  - Towers: None/Few/Many
  - Wave: Early/Middle/Late
  - Last action: Success/Fail
- **Actions**: 5 total
  - BUILD_LEFT, BUILD_CENTER, BUILD_RIGHT
  - SAVE (do nothing)
  - SELL_OLDEST
- **Learning Rate**: 0.1
- **Discount Factor**: 0.95
- **Epsilon**: 0.1 (10% exploration)

### Training Process

1. AI observes current state
2. Chooses action (ε-greedy: 90% best, 10% random)
3. Executes action in game
4. Receives reward based on student's configuration
5. Updates Q-table using: Q(s,a) ← Q(s,a) + α[r + γ max Q(s',a') - Q(s,a)]
6. Repeat for 100 episodes

## 🔧 Technical Details

### Backend (Python)

- **Framework**: FastAPI
- **WebSocket**: Real-time training updates
- **Package Manager**: `uv` (fast pip replacement)
- **No External AI Libraries**: Pure Python Q-learning
- **Deterministic**: No randomness in game mechanics

### Frontend (TypeScript + React)

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite (fast dev server)
- **Styling**: CSS with CSS variables
- **WebSocket**: Native browser WebSocket API
- **Canvas**: HTML5 Canvas for game rendering

## 📝 API Endpoints

### REST API

- `POST /api/initialize` - Reset game and AI
- `POST /api/ai/reward-config` - Update rewards
- `GET /api/ai/q-table` - Get Q-table data
- `GET /api/training/status` - Training progress
- `GET /api/training/history` - Episode history

### WebSocket

- `ws://localhost:8000/ws/training`
- Commands: `start_training`, `stop_training`, `get_status`
- Updates: `episode_start`, `step`, `episode_end`, `training_complete`

## 🧪 Testing

### Backend Tests

```bash
cd code/backend
python test_core.py    # Test game engine and AI
python test_api.py     # Test REST endpoints
```

### Manual Testing

1. Start both servers
2. Open http://localhost:3000
3. Click "Start Training"
4. Verify:
   - Q-table fills with values
   - Episodes complete (100 total)
   - Win rate shown
   - Game visualization updates

## 🎨 Design Principles

### Pedagogical

1. **Transparency**: Students see everything
2. **Immediacy**: Changes visible in seconds
3. **Experimentation**: Easy to try different rewards
4. **Clarity**: Simple game, simple states
5. **Visual Feedback**: Colors, animations, labels

### Technical

1. **Deterministic**: Same state + same action = same result
2. **Small State Space**: Only 162 states (can visualize all)
3. **No Randomness**: Reproducible results
4. **Fast Training**: Episodes complete in ~10 seconds each
5. **Real-time**: WebSocket updates every step

## 🎯 Phase 1 MVP - Complete! ✅

This implementation includes everything needed for the basic educational experience:

✅ Complete tower defense game engine
✅ Q-learning with tabular Q-table
✅ 162 discrete states (manageable, visualizable)
✅ Configurable reward system
✅ FastAPI backend with REST + WebSocket
✅ React frontend with real-time updates
✅ **Q-table heatmap visualization** (THE KEY COMPONENT)
✅ Reward designer interface
✅ Training progress tracking
✅ All tests passing

## 📚 Documentation

- **For Developers**: See individual README files in `backend/` and `frontend/`
- **Game Rules**: See `docs/GAME_RULES_SIMPLIFIED.md`
- **Q-Learning**: See `docs/Q_LEARNING_IMPLEMENTATION.md`
- **API Spec**: See `docs/API_SPECIFICATION.md`

## 🔮 Future Enhancements (Phase 2+)

Not included in Phase 1, but possible additions:

- [ ] Episode reward graph over time
- [ ] Save/load Q-tables
- [ ] Multiple tower types
- [ ] Different enemy types
- [ ] Procedural wave generation
- [ ] Comparison of different reward configs
- [ ] Tutorial mode for first-time users
- [ ] Export Q-table as CSV
- [ ] Student "missions" (e.g., "Make AI save 200 gold")

## 👥 Target Audience

**High school students (ages 14-18)** learning about:
- Artificial Intelligence
- Machine Learning
- Reinforcement Learning
- Reward Shaping
- AI Ethics (specification gaming)

**No prior programming experience required!**

## 📄 License

Educational project for teaching Reinforcement Learning concepts.

## 🙏 Credits

Built with pedagogical principles from:
- Constructionist learning theory
- Seymour Papert's work on learning through making
- Concrete-to-abstract teaching methodology

## 🐛 Troubleshooting

### Backend won't start
- Check Python version: `python --version` (needs 3.8+)
- Activate virtual environment: `source .venv/bin/activate`
- Install dependencies: `uv pip install -r requirements.txt`

### Frontend won't start
- Check Node version: `node --version` (needs 18+)
- Install dependencies: `npm install`
- Clear cache: `rm -rf node_modules && npm install`

### WebSocket won't connect
- Ensure backend is running first
- Check browser console for errors
- Verify URL: should be `ws://localhost:8000/ws/training`
- Check CORS settings in `main.py`

### Q-table not updating
- Click "Reset AI" to initialize
- Ensure training has started (check status indicator)
- Q-table starts empty - wait for states to be visited
- Refresh frontend if connection was lost

## 📞 Support

For issues or questions:
1. Check the documentation in `docs/`
2. Review `PROGRESS.md` for implementation status
3. Check browser and backend console logs
4. Verify all tests pass: `python test_core.py`

---

**Built to teach high school students that AI behavior is shaped by rewards! 🎓**
