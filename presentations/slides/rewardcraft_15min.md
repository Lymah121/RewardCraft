# RewardCraft: 15-Minute Presentation with Talking Points

**Total Time: 15 minutes**
**Audience: K-12 educators, AI education researchers, conference attendees**

---

## Slide 1: Hook (30 seconds)

# What if students could train AI... by breaking it?

**RewardCraft** - A tower defense game where students design AI reward functions

### TALKING POINTS:

- "Good morning everyone. I want to start with a question: What if the best way to teach students about AI... is to let them break it?"
- "I'm [Name] from UT Permian Basin, and today I'm going to show you RewardCraft - an educational tool where high school students become AI trainers."
- "The twist? Students learn the most when their AI does something completely unexpected - when it 'breaks' in fascinating ways."
- "Let me show you what I mean."

**[TRANSITION: Click to next slide]**

---

## Slide 2: The Problem (1 minute)

### AI education is too abstract

**Current State:**
- Lectures explain algorithms
- Videos show pre-trained results
- Students remain passive observers

**The Gap:**
- Students hear *about* AI but don't *experience* it
- Ethics taught as separate topic, disconnected from technical skills
- No hands-on design decisions

**What we need:** Active, experiential AI learning

### TALKING POINTS:

- "Here's the problem we're trying to solve. Right now, AI education for K-12 is largely passive."
- "We show students videos of self-driving cars. We explain that neural networks have layers. We talk about how ChatGPT works."
- "But students never get to BE the person making design decisions. They're always observers, never designers."
- "And here's the bigger issue: when we teach AI ethics, it's usually a separate module. 'Here's how AI works, and oh by the way, here are some ethical concerns.'"
- "But in the real world, technical decisions ARE ethical decisions. The way you design a reward function IS a value judgment."
- "We wanted to create something where students experience that connection firsthand."

**[TRANSITION: "So what's our approach?"]**

---

## Slide 3: Our Solution - The Learning Cycle (1 minute)

### Students = AI Trainers

```
    ┌────────────────────────────────────────────┐
    │                                            │
    │   1. PLAY           2. DESIGN              │
    │   Understand        Create reward          │
    │   the game          function               │
    │         ↘               ↓                  │
    │          ────────────────                  │
    │         ↙               ↑                  │
    │   4. REFLECT        3. OBSERVE             │
    │   Connect to        Watch AI learn         │
    │   real-world        and (often) fail       │
    │                                            │
    └────────────────────────────────────────────┘
```

### TALKING POINTS:

- "RewardCraft puts students in the designer's seat. They're not watching AI - they're training it."
- "The learning cycle has four phases:"
- "First, PLAY - students play the tower defense game themselves to understand the mechanics. Build towers, defend your base, survive five waves."
- "Second, DESIGN - here's where it gets interesting. Students design the reward function. They decide: how many points for killing an enemy? What's the penalty when an enemy reaches the base? Should building towers cost points or earn points?"
- "Third, OBSERVE - they watch the AI learn from THEIR reward design. And this is where the magic happens - because often, the AI does something completely unexpected."
- "Fourth, REFLECT - we guide students to connect what they saw to real-world AI systems. Why did the AI do that? What would happen if a real company made this mistake?"
- "This cycle is based on constructionist learning theory - the idea that students learn best by building things and seeing the consequences of their design choices."

**[TRANSITION: "Let me show you what this looks like in practice."]**

---

## Slide 4: The Interface Overview (1 minute)

### Three Panels Working Together

**[Show screenshot of full interface]**

| LEFT | CENTER | RIGHT |
|------|--------|-------|
| **Game Canvas** | **Q-Table Heatmap** | **Reward Designer** |
| Watch the AI play | See what AI "knows" | Set your values |
| Towers, enemies, path | State-action values | Sliders for each event |
| Real-time visualization | Learning made visible | Your AI's "brain" |

### TALKING POINTS:

- "Here's the RewardCraft interface. It's designed to make AI learning transparent and tangible."
- "On the left, you have the game canvas - a tower defense game. Enemies spawn on the left, walk across the path, and try to reach your base on the right. The AI builds towers to stop them."
- "In the center - and this is crucial for learning - we have the Q-table heatmap. This shows what the AI 'knows' at any moment. Brighter colors mean the AI thinks that action is valuable. Students can literally watch learning happen."
- "On the right is the reward designer - this is where students make their design choices. Each slider controls how much reward or penalty the AI gets for different events."
- "The key insight is that everything is visible. There's no black box. Students see the AI's decision-making process in real-time."

**[TRANSITION: "Now let me show you what makes this pedagogically powerful."]**

---

## Slide 5: The Core Learning Moment - Specification Gaming (2 minutes)

### The "Aha!" Moment

**Scenario: A student creates these rewards:**
- Enemy killed = **+25 points** (high reward!)
- Game lost = **-50 points** (mild penalty)
- Game won = **+50 points** (mild reward)

**What the student expects:**
- "My AI will be great at killing enemies!"

**What actually happens:**
- AI farms kills obsessively
- Completely ignores base defense
- Gets 2,700+ reward points
- **0% win rate**

### TALKING POINTS:

- "This is the heart of RewardCraft's educational value. Let me walk you through what we call the 'aha moment.'"
- "Imagine a student sits down and thinks: 'I want my AI to be really good at killing enemies.' So they set enemy_killed to +25 - a high reward."
- "They set game_lost to just -50, thinking 'that's a penalty, that should be enough.'"
- "They click 'Start Training' and watch their AI learn."
- "After 100 episodes, they check the stats. The AI has accumulated over 2,700 reward points. Impressive, right?"
- "But then they notice: win rate is 0%. Zero. The AI has never won a single game."
- "What happened? The AI learned that farming kills is MORE valuable than winning. Kill 100 enemies at +25 each? That's 2,500 points. Losing only costs 50 points. Mathematically, the AI is doing exactly what it was told."
- "This is called specification gaming - the AI optimizes for the reward you specified, not the outcome you intended."
- "And here's the beautiful thing: no lecture could teach this as effectively as experiencing it firsthand. The student FEELS the gap between what they said and what they meant."

**[TRANSITION: "Now, why does this matter beyond the game?"]**

---

## Slide 6: Connecting to Real-World AI (1.5 minutes)

### This isn't just a game problem

**Discussion prompt for students:**

> "Your AI optimized for kills instead of winning. Where have you seen similar problems in real AI systems?"

| RewardCraft Behavior | Real-World Parallel |
|---------------------|---------------------|
| Farming kills, losing games | Social media maximizing engagement over user wellbeing |
| Hoarding gold instead of building | Companies optimizing quarterly profits over long-term health |
| Building only cheap towers | Cost-cutting AI that sacrifices quality or safety |

### TALKING POINTS:

- "Here's where RewardCraft becomes more than a game. We ask students: where have you seen this same problem in the real world?"
- "Think about social media algorithms. They're optimized for engagement - time on platform, clicks, shares. But engagement isn't the same as user wellbeing. Sometimes the most engaging content is the most divisive or harmful."
- "The AI is doing exactly what it was told - maximize engagement. But that's not what we actually wanted."
- "Or think about a company AI optimizing for quarterly profits. It might cut corners on safety, on quality, on long-term sustainability - because those things weren't in the reward function."
- "Students who experience specification gaming in RewardCraft can recognize it in the real world. They become critical consumers of AI systems."
- "And importantly, they learn that AI alignment - making AI do what we actually want - is genuinely hard. It's not just about building smarter AI. It's about carefully designing what we reward."

**[TRANSITION: "Let me show you the technical depth we provide."]**

---

## Slide 7: Progressive Complexity (1 minute)

### Four Levels of Engagement

| Level | What Students Control | Learning Goal |
|-------|----------------------|---------------|
| **1. Basic** | Positive/negative toggles | "Rewards shape behavior" |
| **2. Weighted** | Numerical sliders (-150 to +100) | Trade-offs between objectives |
| **3. Type-Specific** | Boss vs normal, tower types | Nuanced reward design |
| **4. Hyperparameters** | Learning rate, discount, epsilon | How learning itself works |

### TALKING POINTS:

- "RewardCraft is designed for progressive complexity. Not every student needs to engage at the deepest level, and that's okay."
- "At Level 1, students just toggle rewards positive or negative. Should killing enemies be good? Should building towers cost something? This teaches the basic concept that rewards shape behavior."
- "At Level 2, they get numerical sliders. Now they're making trade-offs: how MUCH should killing matter versus defending? This is where specification gaming emerges."
- "Level 3 adds nuance: different rewards for boss enemies versus normal enemies, bonuses for specific tower types. Students learn that real reward functions are complex."
- "Level 4 is for the truly curious - they can adjust the learning rate, the discount factor, how much the AI explores versus exploits. This connects to how learning itself works."
- "A middle schooler might engage at Level 1-2. An AP CS student might dive into Level 4. The same tool serves multiple audiences."

**[TRANSITION: "Here's what the current version looks like."]**

---

## Slide 8: Current Features - Phase 3 (45 seconds)

### What We've Built

**Game Elements:**
- 3 tower types: Archer (fast), Cannon (powerful), Slow (utility)
- 4 enemy types: Normal, Fast, Tanky, Boss
- 5 waves of increasing difficulty
- Tower upgrade system

**Learning Tools:**
- Real-time Q-table visualization
- Reward breakdown showing why AI made each choice
- Learning curve tracking improvement over time
- 5 preset configurations demonstrating different behaviors

**Technical:**
- Full-stack React + Python
- WebSocket for real-time updates
- Save/load trained agents

### TALKING POINTS:

- "Let me quickly show you what we've built so far. We're in Phase 3 of development."
- "The game has three tower types - archers are fast but weak, cannons are slow but powerful, slow towers reduce enemy speed. Four enemy types create variety - the boss enemy has 200 HP and appears in wave 5."
- "For learning tools, we have real-time Q-table visualization - students see the AI's 'brain' update as it learns. A reward breakdown panel shows exactly why the AI got each reward. And a learning curve tracks whether the AI is improving."
- "We also have five presets that demonstrate different behaviors - including 'Greedy Killer' which reliably produces specification gaming."

**[TRANSITION: "Let me show you this live."]**

---

## Slide 9: Live Demo (3-4 minutes)

### Live Demonstration

**Demo Script:**

1. **Show the interface** (30 sec)
   - Point out game canvas, Q-table, reward designer

2. **Load "Balanced" preset** (30 sec)
   - Show reasonable reward values
   - Start training at 2x speed

3. **While training, explain what we see** (1 min)
   - Q-table updating
   - Learning curve trending upward
   - AI building towers, defeating enemies

4. **Stop and load "Greedy Killer" preset** (30 sec)
   - Show the changed values
   - "Notice enemy_defeated is now +25 but game_won is only +50"

5. **Start training and observe** (1-2 min)
   - Watch AI behavior change
   - Point out high rewards but no wins
   - "This is specification gaming in action"

### TALKING POINTS:

- "Let me show you this in action. [Open RewardCraft]"
- "Here's our interface. On the left, the game. Center, the Q-table. Right, the reward designer."
- "I'm going to load our 'Balanced' preset - these are reasonable reward values. [Click preset]"
- "Now I'll start training. Watch the Q-table - see how it starts mostly dark and gradually lights up? That's the AI learning which actions are valuable."
- "The learning curve down here is trending upward - the AI is improving."
- "[After a minute] Okay, let's try something different. I'm going to load our 'Greedy Killer' preset."
- "Notice the change: enemy_defeated is now +25 - really high. But game_won is only +50."
- "Let's see what happens. [Start training]"
- "Watch the behavior. See how the AI is racking up points? But look at the win rate... still 0%."
- "This is specification gaming. The AI is doing exactly what we told it - maximize reward. But that's not the same as winning."
- "[If time allows] Ask yourself: what would you change to fix this?"

**[TRANSITION: "Let me tell you about classroom implementation."]**

---

## Slide 10: Classroom Implementation (1 minute)

### 45-Minute Lesson Plan

| Time | Activity | Materials |
|------|----------|-----------|
| 0-5 min | Hook: "What is AI?" discussion | - |
| 5-10 min | Demo: Show interface, explain rewards | Projector |
| 10-15 min | Students design first reward function | Worksheet Part 1 |
| 15-30 min | Hands-on training and observation | Computers |
| 30-40 min | Load presets, compare behaviors | Worksheet Part 2 |
| 40-45 min | Reflection: Specification gaming discussion | Worksheet Part 3 |

### TALKING POINTS:

- "We've designed this for a 45-minute class period, but it scales up to a full unit."
- "The lesson starts with a hook: ask students what they think AI is. Get their preconceptions on the table."
- "Then a brief demo - show the interface, explain that they're going to design the AI's reward function."
- "Students spend about 5 minutes thinking through their initial design on a worksheet. What values should they use? What behavior do they expect?"
- "Then 15 minutes of hands-on training. They run their reward function and watch what happens."
- "The key pedagogical move is comparison. After their first attempt, have them load different presets and observe how behavior changes. This drives home that reward design matters."
- "The lesson ends with reflection. What did your AI do? Was it what you expected? Where have you seen similar problems in real AI systems?"
- "We have worksheets that guide this reflection."

**[TRANSITION: "What do students take away?"]**

---

## Slide 11: Learning Outcomes (1 minute)

### What Students Learn

**Technical Understanding:**
- AI learns through reward signals, not explicit programming
- Training takes time and exploration
- The Q-table is like a "value map" for decisions

**Critical AI Literacy:**
- Reward design encodes human values
- Poorly specified rewards cause unintended behavior
- "AI alignment" means making AI do what we actually want

**Transferable Skills:**
- Question AI design decisions
- Recognize specification gaming in real systems
- Connect technical choices to ethical implications

### TALKING POINTS:

- "Let me be specific about learning outcomes."
- "On the technical side, students understand that AI learns through reward signals - it's not like programming with rules. They see that learning takes time and requires exploration. And the Q-table makes the abstract concept of 'learned values' concrete."
- "More importantly, students develop critical AI literacy. They understand that reward design is VALUE design. They experience specification gaming firsthand, so they can recognize it elsewhere."
- "And they develop transferable skills. When they hear about a new AI system, they start asking: what is it optimizing for? What might go wrong?"
- "We're not just teaching about one algorithm. We're building a framework for thinking critically about AI systems in general."

**[TRANSITION: "Here's where we're headed."]**

---

## Slide 12: Future Directions (30 seconds)

### Coming Next

**Phase 4 Plans:**
- Multiplayer: Compare reward functions with classmates
- Assessment: Pre/post AI literacy inventory
- Curriculum: Full 5-lesson unit

**Research Questions:**
- How does hands-on reward design affect AI literacy?
- Do students transfer alignment insights to other contexts?

### TALKING POINTS:

- "We're actively developing Phase 4. The big addition is multiplayer - students can compare their reward designs with classmates, creating discussion and healthy competition."
- "We're also building formal assessment tools - a pre/post AI literacy inventory to measure learning gains."
- "Our research questions focus on transfer: do students who experience specification gaming here recognize it in news about real AI systems?"

**[TRANSITION: "Let me wrap up."]**

---

## Slide 13: Key Takeaway (30 seconds)

### One Idea to Remember

# Students learn AI alignment best by *causing* alignment failures themselves.

**RewardCraft makes this safe, visible, and meaningful.**

### TALKING POINTS:

- "If you remember one thing from this talk, let it be this:"
- "Students learn AI alignment best by CAUSING alignment failures themselves."
- "Not by being told about them. Not by watching videos. By experiencing them."
- "RewardCraft provides a safe space to break AI, see why it broke, and connect that to real-world implications."
- "That's constructionist learning applied to AI ethics."

**[TRANSITION: "Questions?"]**

---

## Slide 14: Resources & Contact (30 seconds)

### Try It Yourself

**Resources:**
- GitHub: [repository link]
- Live Demo: [hosted URL]
- Student Worksheets: [link]

**Contact:**
- Email: [your email]
- Twitter/LinkedIn: [handles]

**Acknowledgments:**
- University of Texas Permian Basin
- [Advisor name]
- [Funding sources if any]

### TALKING POINTS:

- "All our resources are available online."
- "The code is open source on GitHub. We have a live demo you can try right now. And the student worksheets are downloadable."
- "I'd love to hear from you if you try this in your classroom. My contact information is here."
- "Thank you to UT Permian Basin and my advisor for supporting this work."

---

## Slide 15: Questions?

### Discussion

**Anticipated Questions:**

1. "What age group is this for?"
   - Designed for high school (14-18), adaptable down to middle school at Level 1-2

2. "How much CS background do students need?"
   - None required. Game interface is intuitive. Deeper levels available for advanced students.

3. "How does this align with standards?"
   - Maps to AI4K12 Big Idea 3 (Learning), CSTA standards on AI/ML

4. "Can students create their own reward presets?"
   - Yes! They can save their configurations and compare with classmates.

5. "Is this just about games, or does it transfer?"
   - The reflection phase explicitly connects to real-world AI systems.

### TALKING POINTS:

- "I'm happy to take questions."
- [Have these answers ready for common questions]
- [If no questions, prompt: "I'm often asked about what age group this works for..." and answer]

---

## APPENDIX: Backup Slides (if time allows or for Q&A)

### A1: The Q-Learning Algorithm

```
Q(s,a) ← Q(s,a) + α[r + γ·max(Q(s',a')) - Q(s,a)]
```

**In plain language:**
- Q(s,a) = "How good is action a in state s?"
- α = How fast do we update our beliefs?
- r = The reward we just got
- γ = How much do we value future rewards?
- max Q(s',a') = Best possible future value

### TALKING POINTS (if asked about the algorithm):

- "The AI uses Q-learning, which is one of the simplest RL algorithms."
- "The Q-table stores a value for every state-action pair. 'In this situation, how good is this action?'"
- "When the AI takes an action and gets a reward, it updates its estimate. Over time, it learns which actions lead to good outcomes."
- "Students don't need to understand the math, but the Q-table visualization makes the CONCEPT tangible."

---

### A2: State Space Design

**486 States from 6 factors:**

| Factor | Values | Meaning |
|--------|--------|---------|
| Left towers | 0, 1, 2+ | Defense coverage |
| Center towers | 0, 1, 2+ | Defense coverage |
| Right towers | 0, 1, 2+ | Defense coverage |
| Enemy count | Low, Med, High | Current threat |
| Gold level | Low, Med, High | Resources available |
| Wave progress | Early, Late | Game stage |

3 × 3 × 3 × 3 × 3 × 2 = **486 unique states**

### TALKING POINTS (if asked about complexity):

- "We designed the state space to be small enough that students can see learning happen in minutes, but rich enough for interesting behavior."
- "486 states times 12 actions means about 5,800 Q-values to learn."
- "With good exploration, the agent can learn reasonable behavior in 100-200 episodes."

---

### A3: Preset Configurations Detail

| Preset | Key Insight | What Students See |
|--------|-------------|-------------------|
| **Balanced** | Baseline | Reasonable play, gradual improvement |
| **Win Focused** | Long-term thinking | Conservative, prioritizes survival |
| **Greedy Killer** | Specification gaming | High kills, no wins |
| **Gold Hoarder** | Specification gaming | Hoards resources, loses |
| **Defensive** | Risk aversion | Heavy defense, slow progress |

### TALKING POINTS (if asked about presets):

- "Each preset is designed to teach something specific."
- "Greedy Killer and Gold Hoarder reliably produce specification gaming - students can see it every time."
- "Having students compare Balanced versus Greedy Killer is very effective - same game, very different outcomes, just from reward changes."
