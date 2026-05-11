# RewardCraft: Pedagogical Framework for Experiential Reinforcement Learning

> **Version 2.0** — Updated April 2026 to reflect Phase 3 implementation  
> Prior versions described a Snake game prototype. This document now accurately reflects the **Tower Defense** implementation that is fully deployed.

---

## 1. Overview

RewardCraft is a browser-based educational tool that teaches high school students Reinforcement Learning (RL) and AI alignment through the design of reward functions in a tower defense game. Students act as **AI trainers**: they specify what the agent should value (the reward function), then watch a tabular Q-learning agent train in real time and observe whether it achieves their intended goals.

The central pedagogical mechanism is **specification gaming** — the phenomenon where an agent optimizes the measurable reward signal while failing the human designer's actual intent. Experiencing this firsthand connects RL concepts directly to AI alignment and ethics without requiring any prior programming experience.

---

## 2. Core Learning Philosophy: Constructionism in Practice

RewardCraft is grounded in **constructionism** (Papert, 1980): deep knowledge is built when learners create tangible, meaningful artifacts. Here, the artifact is the AI agent's reward function — a set of numerical weights encoding what the agent should care about.

Students are framed not as players but as **System Designers**. Their goal is not to win the game themselves, but to craft a reward function that causes an autonomous agent to win it **for the reasons they intend**. This framing fosters ownership, agency, and genuine insight into how AI behavior emerges from specification choices.

---

## 3. The Game Environment: Tower Defense

RewardCraft uses a simplified **tower defense game** (10×10 grid) as the learning environment.

| Element | Description |
|---|---|
| **Objective** | Prevent enemies from crossing Row 5 (left → right) and reaching the base |
| **Waves** | 5 waves of increasing difficulty: Normal → Fast → Tanky mixtures → Boss → Final |
| **Enemy types** | Normal, Fast, Tanky, Boss — each with different HP, speed, and threat levels |
| **Tower types** | Archer (fast/low dmg), Cannon (slow/high dmg), Slow (utility) |
| **Resources** | Start with 100 gold; earn gold per enemy defeated |
| **Actions** | 12 discrete: build Archer/Cannon/Slow (×3 regions) + Upgrade (×3 regions) + Save + Sell |
| **State space** | 486 discrete states (3×3×3×3×3×2) — interpretable to students |

The game is intentionally **simple enough to understand in 5 minutes** but **rich enough for an RL agent to develop non-trivial strategy**.

### Why Tower Defense?

- **Deterministic and repeatable**: same state + same action = same outcome, making learning causal relationships clear
- **Visually intuitive**: students can see the agent's decisions playing out spatially
- **Economically interesting**: gold management creates genuine multi-objective tension
- **Naturally produces specification gaming**: misaligned rewards reliably generate unexpected-but-rational agent behavior

---

## 4. The Learning Cycle: Phase Structure

RewardCraft implements a four-phase experiential learning cycle aligned with Kolb's (1984) model of experiential learning.

### Phase 1 — Play (Concrete Experience)
Students observe a short game demo or watch the tutorial to understand the mechanics: what towers do, how enemies move, what "winning" means. The **8-slide onboarding tutorial** embedded in the tool walks students through:
1. Welcome — what is RewardCraft?
2. What is Reinforcement Learning? (observe → act → reward → learn)
3. The Tower Defense game mechanics (annotated diagram)
4. Reward functions — you are the teacher
5. Specification gaming — when the AI does what you said, not what you meant
6. The Q-table — how the agent stores what it has learned
7. Enter your name (for the research dataset)
8. Your mission — the 4-step training loop

### Phase 2 — Design (Guided Construction)
Students enter the **Training Arena** and configure a reward function. The interface exposes progressive levels of complexity:

| Level | Mode | What Students Configure |
|---|---|---|
| **1 — Simple Mode** | Binary sentiments | High/Med/Low intensity for each event (enemy_defeated, enemy_reached_base, tower_built, wave_completed) |
| **2 — Advanced Mode** | Numeric sliders | Precise float values for all 10 reward events including Phase 3 fields (boss_defeated, tower_upgraded, special_tower_built) |
| **3 — Hyperparameters** | Training settings | Learning rate (α), discount factor (γ), epsilon (ε), epsilon decay, episode count, speed |

Students can also start from one of **5 preset configurations** designed to guarantee pedagogically useful preset behaviors:

| Preset | Core Incentive | Emergent Behavior Observed |
|---|---|---|
| Balanced | Terminal outcomes + defense | Gradual win rate improvement; most "correct" strategy |
| Win Focused | Strong win/loss terminal signal | Conservative survival; risk-averse play |
| Greedy Killer | Very high kill reward, low loss penalty | High kill count, ignores survival — spec gaming |
| Gold Hoarder | Penalizes all spending heavily | Refuses to build towers; loses quickly but accumulates reward |
| Defensive | Heavy leak penalty | Overbuilds in early waves; gold-starved late game |

### Phase 3 — Observe (Active Experimentation)
Students start training and watch the agent learn in real time. Key visualizations:
- **Game Canvas** — live game state (towers, enemies, wave)
- **Q-Table Heatmap** — cells colored green (high Q-value/preferred) to red (avoided), with the agent's best action marked per state
- **Learning Curve** — episode reward over time with moving average; win rate trend
- **Reward Breakdown** — per-step itemization of what earned/cost reward that step

The **correct failure moment**: when a student uses Gold Hoarder or Greedy Killer, they observe *high reward + zero wins*. This is the core "aha" moment: the agent is not broken — it is optimizing exactly what was specified.

### Phase 4 — Reflect (Abstract Conceptualization)
After training completes, a structured **Reflection Modal** appears with two questions:

1. *"Did your agent do anything you didn't expect? Describe any unintended behaviors."*
2. *"Can you think of a real-world AI system where a similar reward mismatch might cause problems?"*

Responses are logged to the research database (`reflection_responses` table) allowing qualitative analysis of student reasoning. Student names are captured at onboarding so reflections are linked to training session data.

---

## 5. State Space Design

The Q-learning agent perceives the world through a **486-state discrete abstraction** of the game, encoding six features:

| Feature | Values | Labels | What it captures |
|---|---|---|---|
| Gold level | 0, 1, 2 | Poor (<50), OK (50–100), Rich (>100) | Resource pressure |
| Enemies on field | 0, 1, 2 | None, Few (1–3), Many (4+) | Immediate threat |
| Towers built | 0, 1, 2 | 0, 1–2, 3+ | Defensive coverage |
| Wave progress | 0, 1, 2 | Early (1–2), Mid (3–4), Late (5) | Episode stage |
| Threat level | 0, 1, 2 | Low, Medium, High | Enemy type danger |
| Has slow tower | 0, 1 | No, Yes | Utility coverage |

**Total**: 3 × 3 × 3 × 3 × 3 × 2 = **486 states**

This size is deliberately chosen: small enough to learn in 100–300 episodes, small enough for every cell to be displayable in the Q-table heatmap, and large enough to produce meaningful strategy differences across presets.

---

## 6. Reward Function Parameterization

Students can configure the following reward events:

| Event | Default (Balanced) | Pedagogical Purpose |
|---|---|---|
| `enemy_defeated` | +10 | Primary positive signal |
| `enemy_reached_base` | −50 | Primary negative signal |
| `tower_built` | −2 | Encourages strategic placement, not spam |
| `gold_saved` | +1 | Small per-10-gold bonus for frugality |
| `wave_completed` | +20 | Intermediate progress signal |
| `boss_defeated` | +50 | High-value event for Phase 3 enemies |
| `tower_upgraded` | −5 | Costs resources; aligned with investment vs. hoarding |
| `special_tower_built` | −10 | Utility tower opportunity cost |
| `game_won` | +100 | Terminal alignment signal |
| `game_lost` | −100 | Terminal penalty |

The tension between `gold_saved` and `tower_built` is intentional: it creates a natural sandbox for specification gaming where a student who overweights `gold_saved` will observe an agent that refuses all construction.

---

## 7. Embedded Ethics: Specification Gaming as Core Pedagogy

RewardCraft operationalizes a core insight from AI safety research (Krakovna et al., 2020; Amodei et al., 2016): **reward misspecification is the root cause of most AI alignment failures**, not broken code.

The framework is structured so students will inevitably encounter specification gaming:
- **Gold Hoarder preset**: agent accumulates 10× more reward than Balanced while losing every game — proof that reward ≠ goal
- **Greedy Killer preset**: agent prioritizes kills; leaking enemies is acceptable because the loss penalty is low
- Student-designed misalignment: any student who neglects `game_lost` will observe a kill-farming agent

After experiencing these failures, the **Reflection prompt** asks students to connect this to real systems:
> *"Think of a social media algorithm, a hiring AI, or a self-driving car. What 'reward' might it be maximizing? What is the actual goal? Where could they diverge?"*

This makes the alignment problem visceral and personally constructed, not abstract and lecture-delivered.

---

## 8. Research Infrastructure

RewardCraft is instrumented for empirical data collection:

| Data type | Storage | Export |
|---|---|---|
| Session metadata (student ID, preset, hyperparams, timestamp) | SQLite `training_sessions` | `GET /api/research/sessions/csv` |
| Episode outcomes (reward, victory, length per episode) | SQLite `episode_log` | `GET /api/research/episodes/csv` |
| Reflection responses (student name, preset, win rate, free text) | SQLite `reflection_responses` | `GET /api/research/reflections/csv` |

Session UUIDs link quantitative training metrics to qualitative reflection data, supporting mixed-methods analysis.

---

## 9. Measurable Learning Outcomes

Upon completing a RewardCraft session, a student should be able to:

1. **Explain the RL loop** — describe how an agent observes state, selects an action, receives a reward, and updates its policy
2. **Design a multi-objective reward function** — balance competing objectives (kill efficiency vs. survival vs. gold management)
3. **Identify specification gaming** — recognize when high reward coexists with goal failure and articulate why this happens
4. **Interpret a Q-table** — explain what green/red cells mean and predict agent behavior from Q-values
5. **Explain hyperparameter effects** — predict how changing ε (exploration) or α (learning rate) changes training dynamics
6. **Draw real-world parallels** — connect reward misalignment in the game to documented AI failures in social media, hiring, or autonomous systems
7. **Articulate the alignment problem** — explain in their own words why "doing what we reward" ≠ "doing what we want"

---

## 10. Standards Alignment

| Learning Target | Standard / Framework |
|---|---|
| Agent-environment interaction, reward signals | AI4K12 Big Idea 4: Learning |
| State/action representation, abstraction | AI4K12 Big Idea 3: Representation & Reasoning |
| Debugging incentives and unintended consequences | AI Literacy competency: Evaluation & Ethics (Long & Magerko, 2020) |
| Iterative design of AI artifacts | CSTA K-12 Standard 3A-AP-13: iterative design |
| Sociotechnical implications of objective specification | Williams et al., 2022: AI+Ethics curricula |

---

## 11. Classroom Integration

**Minimum viable session**: 45 minutes
- 0–5 min: Onboarding tutorial (self-guided, 8 slides)
- 5–10 min: Watch Balanced preset train (instructor-led demo)
- 10–25 min: Student-designed reward function (free exploration)
- 25–35 min: Guided experiment — compare one preset to their own design
- 35–45 min: Reflection modal + class discussion

**Extended unit** (2–3 class periods):
- Day 1: Onboarding + Balanced vs. Greedy Killer comparison
- Day 2: Student-designed presets; export Q-table; discussion of spec gaming examples
- Day 3: Deep dive — hyperparameter effects; connect to case studies (YouTube algorithm, COMPAS, GPT-4 RLHF)

---

## References

- Amodei, D. et al. (2016). Concrete problems in AI safety. *arXiv:1606.06565*
- Kafai, Y. B., & Burke, Q. (2014). *Connected Code*. MIT Press.
- Krakovna, V. et al. (2020). Specification gaming: the flip side of AI ingenuity. DeepMind Blog.
- Long, D., & Magerko, B. (2020). What is AI literacy? *Proc. CHI 2020*.
- Papert, S. (1980). *Mindstorms*. Basic Books.
- Sutton, R. S., & Barto, A. G. (2018). *Reinforcement Learning: An Introduction* (2nd ed.). MIT Press.
- Touretzky, D. et al. (2019). Envisioning AI for K–12. *Proc. AAAI 2019*.
- Williams, R. et al. (2022). AI + Ethics curricula for middle school youth. *Int. J. AI in Education*.
