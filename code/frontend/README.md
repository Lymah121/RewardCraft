# RewardCraft Frontend

React + TypeScript frontend for the RewardCraft educational AI tool.

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

The app will start at **http://localhost:3000**

> **Note**: Make sure the backend server is running at `http://localhost:8000` before starting the frontend.

## Project Structure

```
frontend/
├── src/
│   ├── components/          # React components
│   │   ├── GameCanvas.tsx   # Tower defense game visualization
│   │   ├── QTableHeatmap.tsx # Q-table visualization (MOST IMPORTANT)
│   │   └── RewardDesigner.tsx # Reward configuration sliders
│   ├── hooks/               # Custom React hooks
│   │   └── useWebSocket.ts  # WebSocket connection management
│   ├── App.tsx              # Main application component
│   ├── App.css              # Main application styles
│   ├── main.tsx             # Application entry point
│   ├── index.css            # Global styles
│   └── types.ts             # TypeScript type definitions
├── index.html               # HTML template
├── vite.config.ts           # Vite configuration
├── tsconfig.json            # TypeScript configuration
└── package.json             # Dependencies and scripts
```

## Key Components

### 1. QTableHeatmap (MOST IMPORTANT)

The Q-table heatmap is the **core educational component** that visualizes AI learning in real-time.

**Features:**
- States displayed as rows, Actions as columns
- Color-coded Q-values:
  - Red: Negative/bad actions
  - Yellow: Neutral
  - Green: Positive/good actions
- Current state/action highlighted with yellow border and star ⭐
- Animated Q-value updates when learning occurs
- Hover tooltips showing full state descriptions
- Shows learning statistics (states explored, steps taken, exploration rate)

**Educational Impact:**
Students can literally **see** the AI learning:
- Watch Q-values change from 0 to higher/lower values
- See which state-action pairs the AI prefers (green)
- Understand why the AI makes certain decisions

### 2. RewardDesigner

Allows students to design the reward function that shapes AI behavior.

**Features:**
- 5 adjustable reward sliders:
  - 🎯 Enemy defeated (+10 default)
  - 💔 Enemy reached base (-50 default)
  - 🏗️ Tower built (-2 default)
  - 💰 Gold saved (+1 default)
  - ✅ Wave completed (+20 default)
- Color-coded values (red=negative, green=positive)
- Real-time preview of reward configuration
- Educational tips on reward design
- Apply/Reset controls

**Educational Impact:**
- Students learn that **rewards control AI behavior**
- Experiment with different reward structures
- See immediate effects on AI decisions

### 3. GameCanvas

Visualizes the tower defense game.

**Features:**
- 10x10 grid with path on row 5
- Real-time visualization of:
  - Towers (blue triangles with range circles)
  - Enemies (red circles with HP bars)
  - Path (yellow highlighted row)
  - Spawn (S) and Base (B) markers
- Resource display (lives, gold, wave)
- Victory/defeat overlays

### 4. useWebSocket Hook

Manages real-time connection to training server.

**Features:**
- Auto-connect/reconnect
- Command helpers (startTraining, stopTraining, getStatus)
- Heartbeat ping every 30 seconds
- Message handler callbacks
- Connection status tracking

## Color System

Following the pedagogical color palette from `UI_MOCKUPS.md`:

```css
--positive-green: #10B981;   /* Rewards, success */
--negative-red: #EF4444;     /* Penalties, failure */
--neutral-blue: #3B82F6;     /* UI elements */
--gold-yellow: #F59E0B;      /* Gold, resources */

/* Q-Table specific */
--q-negative: #DC2626;       /* Q < 0 */
--q-neutral: #FCD34D;        /* Q ≈ 0 */
--q-positive: #10B981;       /* Q > 0 */
```

## WebSocket Protocol

The frontend connects to `ws://localhost:8000/ws/training` for real-time training updates.

### Commands (Client → Server)

```typescript
// Start training
{
  command: 'start_training',
  num_episodes: 100,
  reward_config: {
    enemy_defeated: 10,
    // ... other rewards
  },
  speed_multiplier: 2.0
}

// Stop training
{ command: 'stop_training' }

// Get status
{ command: 'get_status' }

// Heartbeat
{ command: 'ping' }
```

### Updates (Server → Client)

```typescript
// Training started
{
  type: 'training_started',
  num_episodes: 100,
  // ...
}

// Each AI step
{
  type: 'step',
  episode: 5,
  step: 12,
  state: 'state_2_1_0_0_1',
  action: 'BUILD_LEFT',
  reward: 10,
  q_value_old: 0.0,
  q_value_new: 1.0,
  game_state: { /* ... */ }
}

// Episode complete
{
  type: 'episode_end',
  episode: 5,
  total_reward: 125.5,
  victory: true
}

// Training complete
{
  type: 'training_complete',
  summary: { /* full results */ }
}
```

## REST API Integration

The frontend also uses REST endpoints for non-real-time operations:

```typescript
// Initialize AI
POST /api/initialize

// Update reward configuration
POST /api/ai/reward-config
GET  /api/ai/reward-config

// Get Q-table
GET  /api/ai/q-table

// Get training status
GET  /api/training/status
GET  /api/training/history
```

## Development

### Hot Reload

Vite provides instant hot module replacement (HMR). Changes to components will update in the browser without full refresh.

### Type Checking

```bash
npm run build  # Runs TypeScript compiler
```

### Proxy Configuration

The Vite dev server proxies API requests to the backend:

```typescript
// vite.config.ts
proxy: {
  '/api': 'http://localhost:8000',
  '/ws': {
    target: 'ws://localhost:8000',
    ws: true,
  },
}
```

## Educational Design Principles

Every component is designed with pedagogy in mind:

1. **Transparency**: Students can see the entire AI state
2. **Real-time Feedback**: Changes are visible immediately
3. **Color Coding**: Visual cues for good/bad/neutral
4. **Clear Labels**: Human-readable state descriptions
5. **Experimentation**: Easy to try different reward configurations

## User Flow

1. **Initialize**: Student starts the app, AI initializes
2. **Design Rewards**: Student adjusts reward sliders
3. **Start Training**: Click "Start Training" button
4. **Watch Learning**:
   - See Q-table values change in real-time
   - Watch AI make decisions
   - Observe win rate improve
5. **Experiment**: Change rewards and see different behaviors

## Performance Notes

- WebSocket updates are throttled to prevent overwhelming the UI
- Q-table only shows visited states by default (can show all 162)
- Canvas rendering uses requestAnimationFrame for smooth updates
- Component re-renders are optimized with React.memo and useCallback

## Troubleshooting

### WebSocket Won't Connect

- Ensure backend is running: `cd ../backend && python main.py`
- Check browser console for connection errors
- Verify URL: `ws://localhost:8000/ws/training`

### Q-Table Not Showing

- Click "Reset AI" to initialize
- Check that training has started
- Q-table starts empty until states are visited

### Slow Performance

- Reduce number of episodes
- Increase `speed_multiplier` in training command
- Close browser DevTools during training

## Next Steps

After the frontend is working:

1. Test full integration with backend
2. Add episode reward graph visualization
3. Implement save/load Q-table functionality
4. Add more educational tooltips and hints
5. Create tutorial mode for first-time users

## License

Educational project for teaching Reinforcement Learning concepts to high school students.
