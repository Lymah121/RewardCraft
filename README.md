# 🎮 RewardCraft

**Teaching Reinforcement Learning Through Tower Defense Gameplay**

An educational tool that helps high school students (ages 14-18) understand how AI behavior is shaped by reward design. Students configure reward functions and watch a Q-learning agent learn tower defense strategies in real-time.

## 🎯 What It Does

Students design reward functions through interactive sliders, then watch an AI agent learn to play tower defense. The Q-table heatmap updates live, showing exactly how the AI learns which actions are good or bad in each state.

**Core insight students discover: AI behavior is entirely controlled by how you design the rewards.**

## 📦 Project Structure

```
RewardCraft/
├── code/
│   ├── backend/          # Python FastAPI + Q-Learning engine
│   ├── frontend/         # React/TypeScript visualization UI
│   └── docs/             # API specs, game rules, implementation docs
├── paper/                # Research paper (LaTeX + PDF)
│   ├── reward_craft_paper.tex
│   ├── reward_craft_paper.pdf
│   └── figures/
└── reference_materials/  # Academic references
```

## 🚀 Quick Start

### Backend
```bash
cd code/backend
pip install -r requirements.txt
python main.py
# API at http://localhost:8000 | Docs at http://localhost:8000/docs
```

### Frontend
```bash
cd code/frontend
npm install && npm run dev
# UI at http://localhost:3000
```

## 🧠 Technical Highlights

- **Tabular Q-Learning** — Pure Python, no external AI libraries
- **486 Discrete States** — Small enough to visualize entirely
- **12 Actions** — Multiple tower types (Archer, Cannon, Slow) + upgrades
- **Real-time WebSocket** — Live training updates for visualization
- **FastAPI Backend** — REST + WebSocket API
- **React Frontend** — Interactive Q-table heatmap, reward designer, game canvas

## 📄 Research Paper

The `paper/` directory contains the full research paper on using game-based tools for AI education, formatted for IEEE conference submission.

## 🧪 Testing

```bash
cd code/backend
python test_core.py    # Game engine + AI tests
python test_api.py     # REST API endpoint tests
```

## 👥 Target Audience

High school students (ages 14-18) learning about AI, machine learning, and reward shaping — **no programming experience required**.

## 📄 License

Educational project for teaching Reinforcement Learning concepts.
