# RewardCraft: A Pedagogical Framework for Experiential Reinforcement Learning

## 1.0 Abstract

RewardCraft is an educational tool designed to demystify the core concepts of Reinforcement Learning (RL) for high school students. It moves beyond passive observation, employing a constructionist, hands-on approach where learners actively design and build an AI agent's value system. By manipulating increasingly complex reward functions of an agent in the classic "Snake" game, students directly experience the causal relationship between an agent's encoded priorities and its emergent behavior. This framework documents a four-phase learning cycle—Play, Train, Observe, and Reflect—that grounds abstract AI principles in concrete, memorable experiences, while simultaneously introducing sophisticated concepts in technology ethics and AI alignment.

## 2.0 Core Learning Philosophy: Constructionism in Practice

The pedagogical foundation of RewardCraft is **constructionism**, a learning theory which posits that deep, lasting knowledge is most effectively built when the learner is actively engaged in creating a tangible, meaningful artifact.

In the context of RewardCraft, the student is not merely a "player" of a game; they are explicitly framed as an **"AI Trainer"** or **"System Designer."** Their objective is not to master the game's mechanics themselves, but to successfully construct an autonomous agent that can master it. The artifact they create is the AI's "brain"—its internal set of priorities, embodied in the reward function. This shift in roles is critical. It fosters a sense of ownership, agency, and intellectual investment that is often absent in traditional instruction. The student is not a consumer of information about AI; they are a producer of intelligence itself.

## 3.0 The Learning Process: The Experiential RL Loop

The RewardCraft activity is structured as a four-phase experiential learning cycle. This process allows students to move from concrete experience to abstract conceptualization in a guided, iterative manner.

### 3.1 Phase 1: Concrete Experience (Play)

The learning journey begins with direct, unguided interaction. The student is first prompted to play the game of Snake themselves. This initial step is crucial for two reasons:
1.  **Establishes Baseline Knowledge:** It ensures the student has a firm, intuitive grasp of the environment's rules, goals (eat the food), and constraints (avoid the walls and self-collision).
2.  **Builds Empathy for the Agent:** By experiencing the task firsthand, the student develops an implicit understanding of the challenge the AI agent will face, creating a stronger foundation for the training task ahead.

### 3.2 Phase 2: Guided Construction (The Training Arena)

This phase is the heart of the constructionist learning experience. The student enters the "Training Arena," where they progressively unlock more sophisticated reward function design capabilities:

**Level 1 - Basic Design:**
*   "When the snake gets a point, I want to..." `[reward it / leave it alone / punish it]`
*   "When the snake stays alive, I want to..." `[reward it / leave it alone / punish it]`
*   "When the snake dies, I want to..." `[reward it / leave it alone / punish it]`

**Level 2 - Weighted Objectives:**
*   Students assign numerical weights (-100 to +100) to different behaviors
*   Introduction to multi-objective optimization and trade-offs

**Level 3 - Conditional Logic:**
*   "If snake_length > 10 AND near_wall: penalty = -5"
*   Students can create sophisticated reward shaping strategies

**Level 4 - Full Designer Mode:**
*   Direct access to reward function code
*   Ability to modify hyperparameters (learning rate, epsilon for exploration)
*   Visualization of Q-table updates in real-time

This progressive disclosure respects high school students' ability to handle complexity while maintaining an accessible entry point.

### 3.3 Phase 3: Active Experimentation (Observation)

With the reward function defined, the student initiates the training. They now observe the direct, real-time consequences of their design choices as the AI agent begins to interact with the environment. This phase is critical for demonstrating the core principle of RL: an agent's behavior is a direct result of its drive to maximize cumulative reward.

Crucially, this phase highlights both successful and unsuccessful outcomes as valuable learning opportunities.
*   **Intended Behavior:** If the student correctly rewards eating food and punishes dying, they will observe the snake gradually become more adept at seeking food and avoiding walls.
*   **Unintended Behavior:** If a student creates a flawed reward function (e.g., rewarding the agent for simply "staying alive"), they will witness the emergent, undesirable behavior of the snake moving in circles to maximize that reward, while ignoring the food. This "productive failure" is often more memorable and instructive than a correct outcome.

### 3.4 Phase 4: Abstract Conceptualization (Reflection)

The final phase solidifies the learning by connecting the concrete experience of the game to the abstract concepts of RL. This is facilitated through guided, reflective questions:

*   "Why did the snake decide to go in circles?"
*   "How did the specific reward you designed lead to that behavior?"
*   "This process is called Reinforcement Learning. In your own words, how would you describe it?"

This Socratic approach encourages students to articulate the underlying principles themselves, constructing their own mental model of how an RL agent learns from feedback.

## 4.0 Embedded Ethics: The Reward Function as a Moral Compass

RewardCraft is intentionally designed to be not just a technical tool, but a practical introduction to technology ethics. The central insight we aim to impart is that ethical failures in AI are often not "bugs" in the code, but the logical and successful outcome of an algorithm optimizing for a poorly specified objective function.

The reward function editor is the primary site for this ethical inquiry. When a student designs a reward function that causes the snake to endlessly circle in a corner, they have created a tangible, understandable example of **specification gaming** and **unintended consequences**. The AI is not "broken"; it is perfectly executing its instructions to maximize the reward for "staying alive" at the expense of the game's actual goal. This provides a powerful, experiential anchor for discussing how similar issues can emerge in high-stakes, real-world systems (e.g., a social media algorithm optimizing for "engagement" at the cost of promoting misinformation).

## 5.0 Measurable Learning Outcomes

The effectiveness of the RewardCraft framework can be assessed by observing specific, demonstrable competencies in students. Upon completion of the activity, a high school student should be able to:

1.  **Articulate Core RL Concepts:** Explain agent-environment interaction, state-action-reward cycles, and policy optimization.
2.  **Design Multi-Objective Reward Functions:** Create and balance competing objectives in a reward function.
3.  **Debug Specification Gaming:** Identify when an agent is exploiting loopholes and redesign rewards to align behavior with intent.
4.  **Understand Hyperparameters:** Predict and explain the effects of changing learning rate, discount factor, and exploration parameters.
5.  **Connect to Real-World AI:** Draw parallels between their reward design and real AI systems (recommendation algorithms, game AI, autonomous vehicles).
6.  **Engage with AI Ethics:** Articulate the alignment problem and discuss ethical implications of poorly specified objectives.
7.  **Read and Modify Code:** Understand and make basic modifications to reward function code (for advanced students).
