# RewardCraft Tower Defense: Complete Game Specification

**Document Version**: 1.0
**Date**: November 18, 2024
**Author**: Claude (for Halimat and Gemini review)

## Executive Summary

RewardCraft Tower Defense is an educational game designed to teach Reinforcement Learning concepts to high school students (ages 14-18). Students act as AI trainers, designing reward functions that teach an AI agent to play tower defense effectively. The game combines the engaging mechanics of tower defense with transparent visualization of AI decision-making processes.

## 1. Game Overview

### 1.1 Core Concept
Students design reward functions to train an AI agent that plays a tower defense game. The agent must learn to place towers, manage resources, and defend against waves of enemies based on the reward signals designed by the student.

### 1.2 Educational Goals
- Understand reinforcement learning fundamentals (state, action, reward)
- Experience specification gaming and unintended consequences
- Learn multi-objective optimization
- Explore AI ethics through game mechanics
- Progress from simple reward design to complex Python functions

### 1.3 Target Audience
- **Primary**: High school students (ages 14-18)
- **Secondary**: Computer science educators
- **Context**: Classroom settings, computer labs, self-directed learning

## 2. Game Mechanics

### 2.1 Core Game Loop
1. **Wave Start**: Enemies spawn and follow predetermined paths
2. **Agent Decision**: AI decides whether to place/upgrade/sell towers
3. **Combat Resolution**: Towers attack enemies automatically
4. **Resource Update**: Gold earned from defeated enemies
5. **Wave End**: Check if base survived, prepare next wave
6. **Training Feedback**: Agent learns from rewards designed by student

### 2.2 Game Elements

#### 2.2.1 Map Layout
- **Grid Size**: 15x10 tiles (adjustable for complexity)
- **Path Types**:
  - Single lane (Level 1)
  - Branching paths (Level 2+)
  - Multiple entry/exit points (Level 3+)
- **Tile Types**:
  - Path tiles (enemies travel here)
  - Buildable tiles (can place towers)
  - Obstacle tiles (unbuildable)
  - Base tile (must protect)

#### 2.2.2 Tower Types

| Tower Type | Cost | Damage | Range | Speed | Special | Unlock Level |
|------------|------|--------|-------|-------|---------|--------------|
| Basic Tower | 50g | 10 | 2 | Fast | None | Level 1 |
| Cannon Tower | 100g | 25 | 3 | Slow | Splash damage | Level 2 |
| Freeze Tower | 75g | 5 | 2 | Medium | Slows enemies | Level 2 |
| Sniper Tower | 150g | 50 | 5 | Very Slow | High crit chance | Level 3 |
| Economy Tower | 200g | 0 | 0 | N/A | Generates 10g/wave | Level 2 |
| Laser Tower | 300g | 15 | 3 | Constant | Chain damage | Level 4 |

#### 2.2.3 Enemy Types

| Enemy Type | HP | Speed | Gold Reward | Special | First Appears |
|------------|-----|-------|-------------|---------|---------------|
| Scout | 20 | Fast | 10g | None | Wave 1 |
| Soldier | 50 | Medium | 20g | None | Wave 2 |
| Tank | 150 | Slow | 50g | High armor | Wave 5 |
| Flyer | 30 | Fast | 30g | Avoids some towers | Wave 7 |
| Splitter | 40 | Medium | 15g | Splits into 2 scouts | Wave 10 |
| Boss | 500 | Slow | 200g | Regenerates HP | Wave 15 |

### 2.3 Resource System
- **Gold**: Primary currency for building/upgrading
- **Lives**: Base health (starts at 20)
- **Wave Bonus**: Extra gold for perfect defense
- **Interest**: 5% bonus on saved gold between waves (Level 3+)

### 2.4 Agent Actions
```python
actions = [
    "place_tower(x, y, tower_type)",
    "upgrade_tower(x, y)",
    "sell_tower(x, y)",  # Returns 70% of cost
    "activate_ability(ability_type)",  # Level 4+
    "wait",  # Do nothing this decision cycle
]
```

## 3. Progressive Complexity System

### 3.1 Level 1: Introduction to RL
**Learning Objectives**: Basic reward/punishment, cause and effect

**Game Configuration**:
- Single straight path
- Only Basic Towers available
- 5 waves of simple enemies
- Fixed wave composition

**Reward Design Interface**:
```
When the agent defeats an enemy: [+10 points]
When the agent lets an enemy through: [-50 points]
When the agent survives a wave: [+100 points]
When the agent places a tower: [-5 points]
```

**Expected Behaviors**:
- Agent learns to place towers to defeat enemies
- May learn to be conservative with tower placement
- Simple strategies emerge

### 3.2 Level 2: Multi-Objective Optimization
**Learning Objectives**: Balancing competing goals, weight tuning

**Game Configuration**:
- Branching path (strategic placement matters)
- Basic, Cannon, Freeze, and Economy towers
- 10 waves with varying enemy types
- Gold management becomes crucial

**Reward Design Interface**:
```python
reward_weights = {
    "enemy_defeated": 10,      # Per enemy
    "wave_survived": 50,        # Per wave
    "gold_earned": 2,          # Per gold earned
    "gold_spent": -1,          # Per gold spent
    "perfect_wave": 100,       # No lives lost
    "efficiency_bonus": 0,     # Damage/gold ratio
}
```

**New Concepts**:
- Trade-off between economy and defense
- Strategic tower placement for maximum coverage
- Resource efficiency metrics

### 3.3 Level 3: Conditional Logic & Strategy
**Learning Objectives**: Conditional reasoning, adaptive strategies

**Game Configuration**:
- Complex map with multiple paths
- All tower types except Laser
- 15 waves including flying enemies and tanks
- Interest system activated

**Reward Design Interface**:
```python
def calculate_reward(state, action, next_state):
    reward = 0

    # Basic rewards
    reward += enemy_defeats * 10

    # Conditional rewards
    if state["wave_number"] < 5 and action == "place_economy_tower":
        reward += 50  # Encourage early economy

    if state["lives"] < 5 and action == "place_defensive_tower":
        reward += 100  # Panic mode

    if state["gold"] > 500 and not action.startswith("place"):
        reward -= 20  # Punish hoarding

    # Efficiency metrics
    if info["damage_per_gold"] > 2.0:
        reward += 30

    return reward
```

**New Challenges**:
- Adapting strategy based on game state
- Long-term planning (save for expensive towers?)
- Dealing with enemy variety

### 3.4 Level 4: Full Designer Mode
**Learning Objectives**: Complete RL system design, hyperparameter tuning

**Game Configuration**:
- Procedurally generated maps
- All tower types and enemies
- 20+ waves with boss enemies
- Special abilities available

**Reward Design Interface**:
```python
class StudentRewardFunction:
    def __init__(self):
        self.learning_rate = 0.1  # Student can modify
        self.discount_factor = 0.95  # Student can modify
        self.exploration_rate = 0.1  # Student can modify

    def calculate_reward(self, state, action, next_state, info):
        """
        Student writes complete reward function.
        Has access to:
        - Full game state
        - Action taken
        - Resulting state
        - Game events (info dict)
        """
        reward = 0

        # Student's custom logic here
        # Example: Implement tower synergy bonuses
        for tower in state["towers"]:
            nearby_towers = self.count_adjacent_towers(tower)
            if nearby_towers > 2:
                reward += 5  # Synergy bonus

        # Example: Adaptive strategy based on wave
        if info["wave_type"] == "flying" and action == "place_sniper":
            reward += 100  # Snipers good against flyers

        return reward

    def get_hyperparameters(self):
        return {
            "learning_rate": self.learning_rate,
            "discount_factor": self.discount_factor,
            "exploration_rate": self.exploration_rate
        }
```

## 4. State Representation

### 4.1 State Vector for Q-Learning
```python
state = {
    # Spatial information (compressed)
    "tower_positions": [(x, y, type, level), ...],
    "enemy_positions": [(x, y, type, hp_percent), ...],
    "buildable_tiles": [(x, y), ...],

    # Resource information
    "gold": 150,
    "lives": 20,

    # Wave information
    "wave_number": 5,
    "enemies_remaining": 12,
    "time_in_wave": 15.2,
    "next_enemy_type": "tank",

    # Performance metrics
    "total_damage_dealt": 1250,
    "gold_spent": 450,
    "towers_built": 6,

    # Derived features (for neural network in advanced mode)
    "threat_level": 0.7,  # Calculated threat assessment
    "economy_score": 0.4,  # Economic position strength
    "defense_coverage": 0.6,  # Path coverage percentage
}
```

### 4.2 State Encoding for Q-Table
For tabular Q-learning, states are discretized:
```python
def encode_state(state):
    # Discretize continuous values
    gold_bucket = state["gold"] // 50  # 0-50, 50-100, etc.
    lives_bucket = state["lives"] // 5  # 0-5, 5-10, etc.
    wave_phase = "early" if state["wave_number"] < 6 else "mid" if state["wave_number"] < 11 else "late"
    threat_level = "low" if state["enemies_remaining"] < 5 else "medium" if state["enemies_remaining"] < 10 else "high"

    # Create state key
    return f"{gold_bucket}_{lives_bucket}_{wave_phase}_{threat_level}"
```

## 5. Visualization Systems

### 5.1 Game View
- **Main Canvas**: Real-time game rendering with smooth animations
- **Tower Ranges**: Transparent circles showing attack ranges
- **Enemy Health Bars**: Visual feedback on damage
- **Resource Display**: Gold, lives, wave counter
- **Path Highlighting**: Shows enemy routes

### 5.2 AI Decision View
- **Q-Value Heatmap**: Visualize Q-values for different positions
- **Action Probability**: Show probability of each action
- **Decision Timeline**: History of recent decisions
- **Reward Stream**: Real-time reward values with explanations

### 5.3 Learning Analytics
- **Episode Reward Graph**: Reward over training episodes
- **Strategy Evolution**: How tower placement patterns change
- **Efficiency Metrics**: Damage/gold, towers/wave, etc.
- **Failure Analysis**: Common failure modes and causes

### 5.4 Debug Mode (Level 4)
- **State Inspector**: Raw state values
- **Q-Table Browser**: Explore Q-values for different states
- **Replay System**: Replay specific waves with different rewards
- **A/B Testing**: Compare two reward functions side-by-side

## 6. Technical Implementation

### 6.1 Architecture Overview
```python
architecture = {
    "backend": {
        "framework": "FastAPI (Python)",
        "ml_library": "PyTorch",
        "rl_framework": "Stable-Baselines3 or custom",
        "game_engine": "Custom Python with Pygame for logic"
    },
    "frontend": {
        "framework": "React + TypeScript",
        "rendering": "Canvas API for game, D3.js for visualizations",
        "state_management": "Zustand",
        "ui_library": "Tailwind CSS + Radix UI"
    },
    "communication": {
        "protocol": "WebSocket for real-time updates",
        "data_format": "JSON with MessagePack for large data"
    },
    "storage": {
        "database": "SQLite for local storage",
        "format": "JSON for reward functions, pickle for models"
    }
}
```

### 6.2 RL Algorithm Implementation

#### Phase 1: Tabular Q-Learning (Levels 1-2)
```python
class TowerDefenseQLearning:
    def __init__(self, state_size, action_size):
        self.q_table = defaultdict(lambda: defaultdict(float))
        self.learning_rate = 0.1
        self.discount_factor = 0.95
        self.epsilon = 0.1

    def get_action(self, state):
        state_key = encode_state(state)
        if random.random() < self.epsilon:
            return random.choice(self.get_valid_actions(state))
        return max(self.q_table[state_key], key=self.q_table[state_key].get)

    def update(self, state, action, reward, next_state):
        state_key = encode_state(state)
        next_state_key = encode_state(next_state)

        current_q = self.q_table[state_key][action]
        max_next_q = max(self.q_table[next_state_key].values(), default=0)

        new_q = current_q + self.learning_rate * (
            reward + self.discount_factor * max_next_q - current_q
        )
        self.q_table[state_key][action] = new_q
```

#### Phase 2: Deep Q-Network (Levels 3-4)
```python
class TowerDefenseDQN(nn.Module):
    def __init__(self, state_dim, action_dim):
        super().__init__()
        self.fc1 = nn.Linear(state_dim, 256)
        self.fc2 = nn.Linear(256, 128)
        self.fc3 = nn.Linear(128, action_dim)

    def forward(self, state):
        x = F.relu(self.fc1(state))
        x = F.relu(self.fc2(x))
        return self.fc3(x)
```

## 7. Ethical Scenarios & Learning Moments

### 7.1 Specification Gaming Examples
1. **Tower Spam**: AI places towers everywhere if placement cost too low
2. **Hoarding**: AI never builds if saving gold is over-rewarded
3. **Sacrifice Strategy**: AI lets early enemies through to save for late game
4. **Maze Building**: AI discovers path-blocking strategies

### 7.2 Ethical Discussion Points
1. **Efficiency vs. Safety**: Fast completion vs. guaranteed success
2. **Resource Allocation**: Spend now vs. save for emergencies
3. **Preventive vs. Reactive**: Build defenses early vs. respond to threats
4. **Local vs. Global**: Optimize for current wave vs. entire game

### 7.3 Real-World Connections
- **Military Defense**: Resource allocation in defense systems
- **Cybersecurity**: Balancing prevention and response
- **Healthcare**: Preventive care vs. emergency response
- **Urban Planning**: Infrastructure investment decisions

## 8. Assessment & Metrics

### 8.1 Student Performance Metrics
- **Success Rate**: Percentage of successful defenses
- **Learning Efficiency**: Episodes to reach performance threshold
- **Strategy Diversity**: Number of different strategies discovered
- **Debugging Skill**: Time to fix specification gaming

### 8.2 Learning Objectives Assessment
| Objective | Assessment Method |
|-----------|------------------|
| Understand state-action-reward | Quiz on RL components |
| Design effective rewards | Successfully complete Level 2 |
| Debug specification gaming | Fix at least 3 failure modes |
| Multi-objective optimization | Balance efficiency and safety |
| Code comprehension | Modify provided functions |

## 9. User Interface Design

### 9.1 Layout Structure
```
┌────────────────────────────────────────────────┐
│                    Header                       │
│  [Play] [Train] [Analyze] [Settings] [Help]    │
├────────────────┬────────────────────────────────┤
│                │                                 │
│  Reward        │        Game Canvas              │
│  Designer      │                                 │
│                │     (Tower Defense Game)        │
│  - Sliders     │                                 │
│  - Conditions  │                                 │
│  - Code Editor │                                 │
│                ├─────────────────────────────────┤
│                │    Visualization Panels         │
│                │  [Q-Values] [Metrics] [Graph]   │
└────────────────┴─────────────────────────────────┘
```

### 9.2 Visual Style
- **Color Scheme**: Dark mode with cyan/purple accents (scientific/tech feel)
- **Typography**: Monospace for code, clean sans-serif for UI
- **Icons**: Consistent icon set for towers, enemies, actions
- **Animations**: Smooth transitions, particle effects for defeats
- **Feedback**: Visual + audio cues for important events

## 10. Implementation Timeline

### Phase 1: Core Game (Week 1-2)
- Tower defense game logic
- Basic enemy/tower types
- Simple map system
- Manual play mode

### Phase 2: RL Integration (Week 3-4)
- Q-learning implementation
- State/action encoding
- Reward function interface
- Training loop

### Phase 3: Visualization (Week 5-6)
- Q-value heatmaps
- Learning graphs
- Decision explanations
- Real-time updates

### Phase 4: Progressive Levels (Week 7-8)
- Level progression system
- Advanced features unlock
- Code editor integration
- Assessment tools

### Phase 5: Polish & Testing (Week 9-10)
- User testing with students
- Performance optimization
- Bug fixes
- Documentation

## 11. Future Enhancements

### 11.1 Multiplayer Features
- Competitive: Whose AI defends better?
- Cooperative: Multiple AIs defending together
- Adversarial: One student trains attacker, other trains defender

### 11.2 Advanced AI Techniques
- Transfer learning between maps
- Curriculum learning with increasing difficulty
- Meta-learning for rapid adaptation
- Explainable AI visualizations

### 11.3 Extended Content
- Map editor for custom challenges
- Additional tower/enemy types
- Special events and modifiers
- Seasonal challenges

## 12. Conclusion

RewardCraft Tower Defense provides an engaging, pedagogically sound approach to teaching reinforcement learning. By combining familiar game mechanics with transparent AI visualization, students gain hands-on experience with RL concepts while exploring important ethical considerations in AI design.

The progressive complexity system ensures accessibility while allowing advanced students to explore sophisticated concepts. The tower defense genre provides natural opportunities for multi-objective optimization, specification gaming, and strategy emergence—all key concepts in understanding modern AI systems.

---

## Appendix A: Reward Function Templates

### A.1 Beginner Template
```python
def beginner_reward(state, action, next_state, info):
    reward = 0
    reward += info["enemies_defeated"] * 10
    reward -= info["lives_lost"] * 50
    reward += info["wave_completed"] * 100
    return reward
```

### A.2 Intermediate Template
```python
def intermediate_reward(state, action, next_state, info):
    reward = 0

    # Combat rewards
    reward += info["enemies_defeated"] * 10
    reward -= info["lives_lost"] * 100

    # Efficiency rewards
    efficiency = info["damage_dealt"] / max(info["gold_spent"], 1)
    reward += efficiency * 5

    # Strategic placement
    if action.startswith("place"):
        coverage = calculate_path_coverage(state, action)
        reward += coverage * 20

    return reward
```

### A.3 Advanced Template
```python
def advanced_reward(state, action, next_state, info):
    # Students fill this in completely
    pass
```

## Appendix B: State Space Analysis

The state space for tower defense is large but manageable:
- **Positions**: 15×10 grid = 150 positions
- **Tower combinations**: ~6^n where n is number of towers
- **Enemy states**: Variable based on wave
- **Resources**: Discretized into buckets

For Q-learning, we use state abstraction to reduce dimensionality.
For DQN, we use the full state representation.

## Appendix C: Ethical Scenarios Reference

1. **The Hoarder**: Saves all gold, never builds
2. **The Spammer**: Places towers randomly
3. **The Sacrificer**: Intentionally loses early
4. **The Exploiter**: Finds unintended strategies
5. **The Perfectionist**: Restarts if any life lost

Each scenario teaches different lessons about reward design and specification gaming.

---

**End of Document**

This specification is ready for Gemini's review and provides a comprehensive foundation for implementing RewardCraft Tower Defense.