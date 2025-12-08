# RewardCraft IEEE Paper Requirements

## Paper Generation Prompt for ChatGPT Pro

Use this document to generate a full IEEE-style LaTeX paper with proper citations.

---

## Paper Metadata

**Title:** RewardCraft: Teaching AI Alignment and Reinforcement Learning Through Interactive Reward Function Design in Tower Defense

**Authors:** [Your Name], [Advisor Name]

**Affiliation:** University of Texas Permian Basin

**Conference Target:** SIGCSE (ACM Technical Symposium on Computer Science Education) or similar K-12 AI education venue

**Paper Length:** 6-8 pages (IEEE two-column format)

---

## Abstract Requirements (150-200 words)

Write an abstract covering:
1. **Problem**: High school students lack hands-on experience with AI/ML concepts; AI ethics taught separately from technical skills
2. **Solution**: RewardCraft - an interactive tower defense game where students design reward functions for a Q-learning agent
3. **Method**: Constructionist learning approach; students experience specification gaming firsthand
4. **Key Innovation**: Embedded ethics through gameplay mechanics, not separate modules
5. **Results**: [Placeholder for future study results]
6. **Significance**: Addresses gap in experiential AI literacy tools for K-12

---

## Section 1: Introduction (1-1.5 pages)

### Content Requirements:
1. **Hook**: The challenge of teaching AI concepts to K-12 students
2. **Problem Statement**:
   - AI education is largely passive (videos, lectures)
   - Students don't experience design decisions
   - Ethics treated as separate topic from technical skills
3. **Motivation**:
   - AI literacy is increasingly important
   - Need for age-appropriate, engaging tools
   - Gap between abstract concepts and hands-on experience
4. **Solution Overview**: RewardCraft and its pedagogical approach
5. **Contributions** (bullet list):
   - Novel educational tool combining RL with AI ethics
   - Constructionist approach to AI alignment education
   - Demonstration of specification gaming in accessible context
   - Open-source implementation for educators
6. **Paper Organization**: Brief outline of remaining sections

### Required Citations (search for these):
- AI4K12 initiative (Touretzky et al., 2019) - Five Big Ideas in AI
- AI literacy competencies (Long & Magerko, 2020)
- K-12 CS education standards (CSTA)
- Statistics on AI education growth/need
- Constructionist learning theory (Papert, 1980)

---

## Section 2: Related Work (1-1.5 pages)

### 2.1 AI Education Tools for K-12

Review existing tools and their limitations:

| Tool | Description | Limitation |
|------|-------------|------------|
| Machine Learning for Kids | Web-based ML training | No RL, limited transparency |
| Teachable Machine | Image/sound classification | No reward design, no ethics |
| AI4ALL | Curriculum programs | Less hands-on coding |
| Cognimates | Scratch-based AI | Limited to classification |
| TrainYourSnakeAI | RL snake game | Limited reward complexity |

### 2.2 Reinforcement Learning Education

- RL visualization tools (existing academic work)
- Q-learning educational implementations
- Game-based RL learning environments

### 2.3 AI Ethics Education

- Current approaches to teaching AI ethics
- Integration challenges (ethics as separate module)
- Experiential ethics education research

### 2.4 Constructionist Learning in CS Education

- Papert's constructionism
- Learning by building/creating
- Game-based learning research
- Productive failure pedagogy

### Required Citations (search for these):
- TrainYourSnakeAI or similar tools
- Machine Learning for Kids documentation/papers
- Teachable Machine (Google)
- AI4ALL curriculum research
- Cognimates (MIT Media Lab)
- Papers on RL visualization for education
- AI ethics curriculum papers (Williams et al., 2022)
- Constructionist learning (Kafai & Resnick)
- Game-based learning meta-analyses

---

## Section 3: System Design (1.5-2 pages)

### 3.1 Pedagogical Framework

**The Four-Phase Learning Cycle:**
```
1. PLAY → 2. DESIGN → 3. OBSERVE → 4. REFLECT
```

Explain each phase:
1. **Play**: Students understand game mechanics
2. **Design**: Students create reward function (the core activity)
3. **Observe**: Watch AI learn from their design
4. **Reflect**: Connect observations to RL concepts and ethics

**Theoretical Grounding:**
- Constructionism (students as designers)
- Experiential learning (Kolb)
- AI4K12 Big Idea 3: Learning

### 3.2 Game Mechanics

**Tower Defense Elements:**
- 10×10 grid environment
- 5 waves of enemies (Normal, Fast, Tanky, Boss)
- 3 tower types (Archer, Cannon, Slow)
- Resource management (gold, lives)
- Win/lose conditions

**Why Tower Defense:**
- Familiar genre to students
- Natural fit for RL (sequential decisions, delayed rewards)
- Rich enough for interesting strategies
- Simple enough to understand quickly

### 3.3 Reinforcement Learning Implementation

**Algorithm: Tabular Q-Learning**

Equation (include in LaTeX):
```latex
Q(s,a) \leftarrow Q(s,a) + \alpha[r + \gamma \max_{a'} Q(s',a') - Q(s,a)]
```

**State Space (486 states):**
- Tower counts: left/center/right (3×3×3)
- Enemy threat level (3 levels)
- Gold level (3 levels)
- Wave progress (2 levels)
- Total: 3×3×3×3×3×2 = 486

**Action Space (12 actions):**
- Build tower (3 types × 3 positions = 9)
- Upgrade, Save, Wait (3)

**Why Tabular Q-Learning:**
- Fully transparent (visualizable Q-table)
- Fast learning (minutes, not hours)
- No black-box neural networks
- Appropriate complexity for education

### 3.4 Reward Function Designer

**Student-Controllable Parameters:**
| Parameter | Range | Educational Purpose |
|-----------|-------|---------------------|
| enemy_defeated | -50 to +100 | Value of offensive actions |
| enemy_reached_base | -200 to 0 | Cost of failure |
| tower_built | -50 to +50 | Resource trade-offs |
| wave_completed | 0 to +100 | Progress rewards |
| game_won | 0 to +500 | Terminal goal value |
| game_lost | -500 to 0 | Terminal failure cost |

**Progressive Complexity Levels:**
1. Basic: Positive/negative toggles
2. Intermediate: Numerical sliders
3. Advanced: Type-specific rewards
4. Expert: Hyperparameter tuning

### 3.5 Visualization Components

- **Q-Table Heatmap**: Real-time visualization of learned values
- **Learning Curve**: Episode rewards over time
- **Reward Breakdown**: Per-step reward components
- **Game Canvas**: Tower defense gameplay

---

## Section 4: Technical Implementation (1 page)

### 4.1 Architecture

```
┌─────────────────────────────────────┐
│     Frontend (React + TypeScript)   │
│  - Game visualization (Canvas API)  │
│  - Q-table heatmap (dynamic)        │
│  - Reward designer (sliders)        │
│  - Learning curve (Chart.js)        │
└─────────────────────────────────────┘
              │ WebSocket
              ▼
┌─────────────────────────────────────┐
│     Backend (Python + FastAPI)      │
│  - Q-learning agent                 │
│  - Tower defense game engine        │
│  - Reward calculator                │
│  - Training loop                    │
└─────────────────────────────────────┘
```

### 4.2 Key Technical Decisions

- **WebSocket for real-time updates**: Students see learning happen live
- **Configurable speed**: 0.5x to 10x training speed
- **State abstraction**: Simplified state space for tractable learning
- **Preset configurations**: Scaffold learning with example reward designs

### 4.3 Open Source Availability

- GitHub repository: [URL]
- MIT License
- Documentation for educators
- Student worksheets included

---

## Section 5: Educational Design (1 page)

### 5.1 Learning Objectives

**Technical Objectives:**
1. Understand that AI learns from reward signals
2. Recognize the role of state representation
3. Observe exploration vs. exploitation trade-off
4. Connect training episodes to learning improvement

**AI Literacy Objectives (mapped to Long & Magerko):**
1. Recognize AI strengths and weaknesses
2. Understand how AI is trained
3. Critically evaluate AI systems

**Ethics Objectives:**
1. Experience specification gaming firsthand
2. Understand reward design as value encoding
3. Connect technical choices to ethical implications
4. Develop critical AI literacy

### 5.2 Specification Gaming as Pedagogy

**Definition**: When AI optimizes for specified rewards in unintended ways

**Example in RewardCraft:**
- Student sets: enemy_killed = +25, game_lost = -50
- Expected: AI kills enemies and wins
- Actual: AI farms kills but loses (higher total reward from kills)
- Learning moment: "It did what I said, not what I meant"

**Real-world connections:**
- Social media engagement optimization
- Recommendation algorithm issues
- AI safety research challenges

### 5.3 Preset Configurations

| Preset | Behavior | Teaching Goal |
|--------|----------|---------------|
| Balanced | Reasonable play | Baseline |
| Greedy Killer | Farms kills, loses | Specification gaming |
| Gold Hoarder | Hoards resources | Misaligned incentives |
| Win Focused | Prioritizes winning | Proper alignment |
| Defensive | Heavy defense | Strategy comparison |

### 5.4 Classroom Integration

**45-Minute Lesson Plan:**
1. Introduction (5 min)
2. Interface demo (5 min)
3. Initial design + training (15 min)
4. Preset comparison (10 min)
5. Reflection discussion (10 min)

**Assessment Strategies:**
- Pre/post concept inventory
- Reward function design rubric
- Reflection journal prompts

---

## Section 6: Preliminary Evaluation (0.5-1 page)

### 6.1 Formative Evaluation

[If you have any user testing data, include here]

- Expert review feedback
- Pilot testing observations
- Usability findings

### 6.2 Planned Evaluation Study

**Research Questions:**
1. Does RewardCraft improve understanding of RL concepts?
2. Do students transfer specification gaming awareness to real-world contexts?
3. How do different age groups engage with progressive complexity?

**Planned Methodology:**
- Pre/post test design
- Think-aloud protocols
- Semi-structured interviews
- Classroom observations

**Target Population:**
- High school students (ages 14-18)
- N = [target sample size]
- Multiple school sites

---

## Section 7: Discussion (0.5 page)

### 7.1 Design Insights

- Value of transparency in AI education
- Importance of immediate feedback
- Role of productive failure
- Benefits of familiar game genres

### 7.2 Limitations

- Single RL algorithm (Q-learning only)
- Simplified state/action spaces
- No multiplayer comparison (yet)
- Requires computer access

### 7.3 Future Work

- Multiplayer mode for collaborative learning
- Additional RL algorithms (SARSA, Policy Gradient)
- Formal evaluation study
- Teacher dashboard for classroom management
- Mobile version

---

## Section 8: Conclusion (0.5 page)

Summarize:
1. RewardCraft addresses gap in experiential AI education
2. Constructionist approach enables deep engagement
3. Embedded ethics through specification gaming
4. Open-source tool available for educators
5. Future studies will evaluate learning outcomes

---

## References Requirements

### Must-Include Citations (find DOIs):

**AI Education:**
1. Touretzky, D., Gardner-McCune, C., Martin, F., & Seehorn, D. (2019). Envisioning AI for K-12: What should every child know about AI? AAAI.
2. Long, D., & Magerko, B. (2020). What is AI literacy? Competencies and design considerations. CHI.
3. Williams, R., et al. (2022). AI + Ethics Curricula for Middle School Youth.

**Reinforcement Learning:**
4. Sutton, R. S., & Barto, A. G. (2018). Reinforcement Learning: An Introduction (2nd ed.). MIT Press.
5. Watkins, C. J., & Dayan, P. (1992). Q-learning. Machine Learning.

**Constructionist Learning:**
6. Papert, S. (1980). Mindstorms: Children, Computers, and Powerful Ideas. Basic Books.
7. Kafai, Y. B., & Burke, Q. (2014). Connected Code: Why Children Need to Learn Programming. MIT Press.

**AI Safety/Alignment:**
8. Amodei, D., et al. (2016). Concrete Problems in AI Safety. arXiv.
9. Krakovna, V., et al. (2020). Specification gaming: the flip side of AI ingenuity. DeepMind Blog.

**Game-Based Learning:**
10. Gee, J. P. (2003). What Video Games Have to Teach Us About Learning and Literacy. Palgrave.
11. Squire, K. (2011). Video Games and Learning: Teaching and Participatory Culture in the Digital Age.

**K-12 CS Education:**
12. CSTA K-12 Computer Science Standards (2017).
13. Code.org AI curriculum resources.

**Related Tools:**
14. Carney, M., et al. (2020). Teachable Machine: Approachable Web-Based Tool for Exploring Machine Learning Classification. CHI Extended Abstracts.
15. Zimmermann-Niefield, A., et al. (2019). Youth Learning Machine Learning through Building Models of Athletic Moves. IDC.

---

## LaTeX Template

Use IEEE conference format:
```latex
\documentclass[conference]{IEEEtran}
\usepackage{cite}
\usepackage{amsmath,amssymb,amsfonts}
\usepackage{algorithmic}
\usepackage{graphicx}
\usepackage{textcomp}
\usepackage{xcolor}
\usepackage{booktabs}
\usepackage{hyperref}

\begin{document}

\title{RewardCraft: Teaching AI Alignment and Reinforcement Learning Through Interactive Reward Function Design}

\author{
\IEEEauthorblockN{[Your Name]}
\IEEEauthorblockA{University of Texas Permian Basin\\
[City, State]\\
[email]}
\and
\IEEEauthorblockN{[Advisor Name]}
\IEEEauthorblockA{University of Texas Permian Basin\\
[City, State]\\
[email]}
}

\maketitle

\begin{abstract}
[Abstract here]
\end{abstract}

\begin{IEEEkeywords}
AI education, reinforcement learning, AI ethics, K-12 education, constructionist learning, specification gaming, game-based learning
\end{IEEEkeywords}

% Sections follow...

\end{document}
```

---

## Figures to Include

1. **System Architecture Diagram** - Frontend/backend/WebSocket
2. **Learning Cycle Diagram** - Play → Design → Observe → Reflect
3. **Interface Screenshot** - Full RewardCraft UI
4. **Q-Table Heatmap Example** - Before/after training
5. **Specification Gaming Example** - Greedy Killer behavior graph
6. **Learning Curve Comparison** - Different presets

---

## Prompt for ChatGPT Pro

```
Generate a complete IEEE-style academic paper in LaTeX format based on the requirements document provided. The paper should be about RewardCraft, an educational tool for teaching reinforcement learning and AI alignment to high school students.

Requirements:
1. Follow IEEE two-column conference format
2. 6-8 pages total
3. Include all sections outlined in the requirements
4. Find and cite real academic papers for all references (provide DOIs where possible)
5. Use proper LaTeX formatting including:
   - Equations for Q-learning
   - Tables for comparisons
   - Figure placeholders with captions
   - Proper citation format using \cite{}
6. Write in academic tone appropriate for SIGCSE or similar venue
7. Emphasize the novel contribution: embedded AI ethics through specification gaming

The paper describes RewardCraft, a tower defense game where students design reward functions for a Q-learning agent. The key educational innovation is that students experience specification gaming firsthand when their reward design causes unexpected AI behavior, teaching AI alignment concepts through direct experience rather than lectures.

Technical details:
- Tabular Q-learning with 486 states and 12 actions
- React frontend with real-time Q-table visualization
- Python/FastAPI backend
- WebSocket for live training updates
- 5 preset configurations demonstrating different behaviors

Please generate the complete LaTeX source code for this paper.
```

---

## Checklist Before Submission

- [ ] All citations have DOIs or URLs
- [ ] Figures are high quality (300+ DPI)
- [ ] Tables are properly formatted
- [ ] Equations are numbered
- [ ] Abstract is under 200 words
- [ ] Keywords are relevant
- [ ] Author information is complete
- [ ] Acknowledgments section (funding, participants)
- [ ] References follow IEEE format
- [ ] Page limit is met (6-8 pages)
- [ ] PDF compiles without errors
