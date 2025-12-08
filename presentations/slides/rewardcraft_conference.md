# RewardCraft: Teaching AI Alignment Through Game-Based Reward Design

---

## Slide 1: Title

# RewardCraft
### Teaching Reinforcement Learning & AI Alignment Through Interactive Tower Defense

**[Your Name]**
University of Texas Permian Basin

*K-12 AI Education Conference 2025*

---

## Slide 2: The Challenge

### How do we teach AI concepts to high school students?

**Traditional Approaches:**
- Lectures on algorithms
- Abstract mathematical formulas
- Passive observation of pre-trained models

**The Problem:**
- Students don't *feel* how AI learns
- Ethics taught separately from technical skills
- No hands-on experience with AI design decisions

---

## Slide 3: Our Solution

### RewardCraft: Students as AI Trainers

Students design reward functions for an AI agent playing tower defense

| Student Role | What They Do |
|-------------|--------------|
| **Designer** | Create reward values for game events |
| **Observer** | Watch AI learn in real-time |
| **Debugger** | Fix unexpected AI behavior |
| **Ethicist** | Reflect on alignment implications |

---

## Slide 4: The Learning Cycle

### Four-Phase Experiential Learning

```
    ┌─────────────────────────────────────────┐
    │                                         │
    │   1. PLAY          2. TRAIN            │
    │   Understand       Design rewards       │
    │   the game         for the AI          │
    │                                         │
    │   4. REFLECT       3. OBSERVE          │
    │   Connect to       Watch the AI        │
    │   ethics           learn & fail        │
    │                                         │
    └─────────────────────────────────────────┘
```

---

## Slide 5: The Game Interface

### Tower Defense + Reward Designer

**Left Panel: Game Visualization**
- 10x10 grid with enemy path
- Three tower types: Archer, Cannon, Slow
- Four enemy types: Normal, Fast, Tanky, Boss
- Real-time HP bars and effects

**Center Panel: AI Transparency**
- Q-Table heatmap (what the AI "knows")
- Reward breakdown (why it made that choice)
- Learning curve (is it improving?)

**Right Panel: Student Controls**
- Reward sliders for each event
- Training hyperparameters
- Preset configurations

---

## Slide 6: Reward Design = Value Design

### Students Assign Rewards to Events

| Event | Description | Example Values |
|-------|-------------|----------------|
| Enemy Defeated | Kill an enemy | +5 to +25 |
| Enemy Reached Base | Enemy gets through | -20 to -150 |
| Tower Built | Spend gold on defense | -10 to +5 |
| Wave Completed | Survive a wave | +10 to +30 |
| Boss Defeated | Kill the boss enemy | +50 to +100 |
| Game Won | Complete all waves | +100 to +500 |
| Game Lost | Lose all lives | -100 to -500 |

**Key Insight:** These numbers encode *values* - what matters most?

---

## Slide 7: Specification Gaming Demo

### When AI Optimizes the Wrong Thing

**Experiment: "Greedy Killer" Preset**
```
enemy_defeated: +25  (high!)
enemy_reached_base: -20  (low penalty)
game_won: +50  (low reward)
```

**Result:**
- AI farms kills but ignores base defense
- High reward score (~2700) but 0% win rate!

**Student Discovery:**
> "The AI is doing exactly what I told it... but that's not what I *wanted*"

---

## Slide 8: Specification Gaming Examples

### Real-World Parallels

| RewardCraft Behavior | Real-World Analog |
|---------------------|-------------------|
| Hoarding gold instead of building | Company optimizing quarterly profits over long-term health |
| Farming kills but losing game | Social media maximizing engagement over user wellbeing |
| Building only cheap towers | Cost-cutting that sacrifices quality |

**Discussion Prompt:**
> "What happens when we can't easily measure what we actually want?"

---

## Slide 9: Technical Transparency

### Making AI Decisions Visible

**Q-Table Heatmap:**
- Shows value the AI assigns to each action in each state
- Students see learning happen in real-time
- Hot colors = AI prefers this action

**Reward Breakdown:**
- Every step shows *why* AI got that reward
- Components: enemy_defeated +10, tower_built -2, etc.
- Connects actions to consequences

**Learning Curve:**
- Episode rewards over time
- Win/loss markers
- Epsilon (exploration) decay visualization

---

## Slide 10: Preset Configurations

### Scaffolded Learning Through Presets

| Preset | Behavior | Teaching Goal |
|--------|----------|---------------|
| **Balanced** | Well-rounded play | Baseline comparison |
| **Win Focused** | Prioritizes survival | Long-term vs short-term |
| **Greedy Killer** | Farms kills, loses games | Specification gaming |
| **Gold Hoarder** | Saves instead of builds | Misaligned incentives |
| **Defensive** | Heavy base protection | Conservative strategies |

Students can load presets, observe behavior, then modify and experiment.

---

## Slide 11: Progressive Complexity

### Four Levels of Engagement

**Level 1: Basic Rewards**
- Simple positive/negative toggles
- "Should killing enemies be good or bad?"

**Level 2: Weighted Objectives**
- Numerical sliders (-150 to +100)
- Trade-offs between competing goals

**Level 3: Type-Specific Bonuses**
- Different rewards for boss vs normal enemies
- Tower type incentives (slow towers vs cannons)

**Level 4: Hyperparameters**
- Learning rate (α): How fast to learn
- Discount factor (γ): Future vs immediate
- Epsilon (ε): Explore vs exploit

---

## Slide 12: AI4K12 Alignment

### Big Idea 3: Learning

> "Computers can learn from data"

**RewardCraft demonstrates:**
- Trial-and-error learning (not explicit programming)
- Reward signals shape behavior
- Learning takes time and data
- Results depend on what you measure

**Competencies addressed:**
- Understand how AI is trained
- Recognize limitations of AI systems
- Critique AI design decisions

---

## Slide 13: Ethical Integration

### Ethics Woven Into Gameplay

**Not:** "Here's a video about AI ethics"

**Instead:** Students *experience* alignment challenges

| Technical Concept | Ethical Dimension |
|------------------|-------------------|
| Reward function design | Encoding human values |
| Specification gaming | Unintended consequences |
| Exploration vs exploitation | Risk tolerance |
| Training data/episodes | Learning from experience |

---

## Slide 14: Technical Architecture

### Full-Stack Implementation

```
┌─────────────────────────────────────────────────┐
│  Frontend (React + TypeScript)                  │
│  - Canvas-based game visualization              │
│  - Chart.js learning curves                     │
│  - Real-time WebSocket updates                  │
└─────────────────────────────────────────────────┘
                      │ WebSocket
                      ▼
┌─────────────────────────────────────────────────┐
│  Backend (Python + FastAPI)                     │
│  - Q-Learning agent                             │
│  - Tower defense game engine                    │
│  - Configurable reward calculator               │
└─────────────────────────────────────────────────┘
```

---

## Slide 15: Q-Learning in Action

### The Algorithm Students Explore

```
Q(s,a) ← Q(s,a) + α[r + γ·max(Q(s',a')) - Q(s,a)]
```

**Made tangible through:**
- Visual Q-table showing state-action values
- Epsilon-greedy exploration (random → confident)
- 486 possible states × 12 actions
- Real-time updates as learning happens

**Student language:**
> "The AI starts guessing randomly, then gradually learns which moves work best"

---

## Slide 16: Classroom Implementation

### 45-Minute Lesson Plan

| Time | Activity |
|------|----------|
| 0-5 min | Introduction: What is RL? |
| 5-10 min | Demo: Show interface, explain rewards |
| 10-25 min | Hands-on: Students design reward functions |
| 25-35 min | Experiment: Compare different designs |
| 35-45 min | Reflection: Specification gaming discussion |

**Materials provided:**
- Student worksheets
- Preset configurations
- Discussion prompts

---

## Slide 17: Student Outcomes

### What Students Learn

**Technical:**
- RL uses rewards to train AI (not explicit rules)
- Q-learning builds a "value map" of actions
- Training requires balancing exploration/exploitation

**Ethical:**
- Reward design encodes human values
- Poorly specified rewards cause unintended behavior
- "Aligned" AI requires careful design and testing

**Critical Thinking:**
- Question AI design decisions
- Recognize when AI optimizes wrong metrics
- Connect technical choices to real-world impact

---

## Slide 18: Future Directions

### Phase 4 and Beyond

**Planned Enhancements:**
- Multiplayer: Compare reward functions with peers
- Curriculum: Structured 5-lesson unit
- Assessment: Pre/post concept inventory
- Advanced: Neural network visualization mode

**Research Questions:**
- How does hands-on reward design affect AI literacy?
- Do students transfer alignment insights to other contexts?
- What misconceptions emerge and how do we address them?

---

## Slide 19: Try It Yourself

### Live Demo

**Let's design a reward function together!**

1. What should we reward/penalize?
2. How much weight for each event?
3. What behavior do we predict?
4. Did the AI do what we expected?

---

## Slide 20: Questions & Contact

### Thank You!

**Resources:**
- GitHub: [repository link]
- Demo: [hosted application link]
- Paper: [conference proceedings link]

**Contact:**
- Email: [your email]
- Twitter: [handle]

**Questions?**

---

## Appendix A: State Space Details

### 486 States Explained

The AI "sees" the game as combinations of:

| Factor | Values | Description |
|--------|--------|-------------|
| Left Towers | 0, 1, 2+ | How many towers on left |
| Center Towers | 0, 1, 2+ | How many towers in center |
| Right Towers | 0, 1, 2+ | How many towers on right |
| Enemy Count | Low, Med, High | Current threat level |
| Gold Level | Low, Med, High | Available resources |
| Wave Progress | Early, Late | Game progression |

3 × 3 × 3 × 3 × 3 × 2 = 486 unique states

---

## Appendix B: Action Space

### 12 Possible Actions

**Build Towers (9 actions):**
- BUILD_ARCHER_LEFT, BUILD_ARCHER_CENTER, BUILD_ARCHER_RIGHT
- BUILD_CANNON_LEFT, BUILD_CANNON_CENTER, BUILD_CANNON_RIGHT
- BUILD_SLOW_LEFT, BUILD_SLOW_CENTER, BUILD_SLOW_RIGHT

**Other Actions (3 actions):**
- UPGRADE (improve existing tower)
- SAVE (accumulate gold)
- WAIT (do nothing this turn)

---

## Appendix C: Reward Presets Code

### Configuration Examples

```typescript
// Specification Gaming Example
const GREEDY_KILLER = {
  enemy_defeated: 25,      // High!
  enemy_reached_base: -20, // Low penalty
  tower_built: -1,
  game_won: 50,            // Low!
  game_lost: -50,
  boss_defeated: 100,
};

// Balanced Example
const BALANCED = {
  enemy_defeated: 10,
  enemy_reached_base: -50,
  tower_built: -2,
  game_won: 200,
  game_lost: -200,
  boss_defeated: 50,
};
```
