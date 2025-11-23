# 2. Related Work

The development of effective educational tools for Artificial Intelligence (AI), particularly in the domain of Reinforcement Learning (RL), necessitates a thorough understanding of existing solutions and the pedagogical theories that underpin successful learning experiences. This section provides a comparative analysis of foundational game-based RL educational tools and outlines the key learning science frameworks that guide our project's design.

## 2.1. Foundational Educational RL Tools: A Comparative Analysis

A critical first step in developing a new educational tool is to conduct a thorough analysis of existing work in the same domain. The `TrainYourSnakeAI` project serves as an excellent baseline, demonstrating a web-based, interactive approach to teaching reward functions through the familiar context of the Snake game. This section analyzes three additional foundational projects that, together with `TrainYourSnakeAI`, represent the state of the art in teaching RL to K-12 students. By comparing and contrasting their diverse pedagogical and technological approaches, a clear space for innovation and a unique value proposition for the proposed tool can be identified.

### 2.1.1. ArtBot

The `ArtBot` project (Voulgari et al., 2021) is an educational game designed to improve AI literacy among primary and secondary students. It is notable for its dual-curriculum approach, teaching both Supervised Learning (SL) and Reinforcement Learning within a single, cohesive experience. `ArtBot` successfully integrates abstract machine learning concepts into a compelling narrative framework, where players train an AI helper to retrieve stolen art objects. The RL portion involves assigning positive rewards to target objects and indicating objects to avoid, while also adjusting key RL parameters such as exploration and exploitation rates. The crucial lesson from `ArtBot` is the pedagogical power of contextualization; framing RL as a necessary tool for solving a concrete problem within a game's story significantly enhances student engagement and provides a clear purpose for the learning activities.

### 2.1.2. ARtonomous

The `ARtonomous` project (Dietz et al., 2022) leverages augmented reality (AR) to teach RL to middle school students. This iPad application allows students to train and customize virtual autonomous robotic vehicles that appear to operate in the student's physical space. `ARtonomous` overcomes barriers of cost and specialized equipment, providing an engaging, embodied learning experience without the logistical overhead of physical hardware. While more focused on the visualization of a learning agent than direct manipulation of its underlying parameters, the high levels of engagement reported reveal that middle school learners are highly motivated by seeing the tangible, physical manifestation of an AI's learned policy. This suggests that a new RL tool would benefit from a rich, dynamic, and compelling visualization of the agent's behavior.

### 2.1.3. PlayGrid

The `PlayGrid` project (Quiloan et al., 2023) is notable for its iterative design process, which explored multiple prototypes before arriving at a final version aimed at teaching RL concepts, specifically Q-learning, to young children without coding knowledge. The final prototype was a physical hardware device that allowed children to observe an RL agent navigating a grid. `PlayGrid`'s evolution highlights a fundamental pedagogical principle: abstraction requires concretization. It makes the abstract mechanics of an RL algorithm, such as the internal state or Q-table, tangible and intuitive by showing the direct result of that internal state through the agent's movement on a physical grid. This emphasizes the importance of making abstract components of the RL algorithm as concrete and visible as possible, for instance, through visualizations of Q-values or state vectors.

### 2.1.4. The Modality-Interaction Spectrum

A deeper analysis of these four foundational tools—`TrainYourSnakeAI`, `ArtBot`, `ARtonomous`, and `PlayGrid`—reveals that they occupy different positions on a spectrum defined by two key dimensions: the modality of the experience (from abstract and screen-based to tangible and embodied) and the nature of the user interaction (from direct parameter manipulation to observational learning). `TrainYourSnakeAI` and `ArtBot` prioritize deep, direct interaction with core RL parameters within a 2D, screen-based environment. In contrast, `ARtonomous` and `PlayGrid` emphasize making the agent's learning process physically present and intuitively understandable through embodied modalities.

This distinction reveals a critical design tension and a significant opportunity for innovation. Currently, no single tool effectively combines the deep, parametric interactivity of the former with the compelling, embodied visualization of the latter. This gap defines a clear design challenge: the ideal educational RL tool would occupy a novel position in the middle of this spectrum, featuring a rich environment where students can both directly manipulate the reward function and observe the rich, intuitive, and embodied consequences of their choices. Bridging this gap between interaction and visualization represents a powerful avenue for a novel contribution to the field.

## 2.2. Pedagogical Frameworks: Anchoring the Tool in Learning Science

A successful educational tool is more than a novel application of technology; it is a carefully designed learning experience grounded in sound pedagogical theory. To create a tool that generates meaningful and lasting learning, its design must be guided by established frameworks from the learning sciences and AI education.

### 2.2.1. The Five Big Ideas in AI

The `Envisioning AI for K-12` paper (Touretzky et al., 2019), a product of the AI4K12 initiative, proposes the "Five Big Ideas in AI" as a comprehensive conceptual framework to guide K-12 AI education standards. These ideas include Perception, Representation & Reasoning, Learning, Natural Interaction, and Societal Impact. Our proposed tool directly addresses **Big Idea 3: Learning**, which explicitly identifies Reinforcement Learning as a key concept. By targeting middle school students, the project aims to bridge the understanding between "computers can learn from data" and how RL algorithms "adjust internal models through environmental interaction and feedback," thereby providing a practical and engaging experience for middle schoolers to explore this fundamental AI concept.

### 2.2.2. AI Literacy Competencies

While the AI4K12 framework provides broad conceptual domains, the paper by Long and Magerko (2020) defines AI literacy as a concrete set of competencies that individuals should possess. They argue that true AI literacy extends beyond mere technical skill, encompassing the ability to critically evaluate AI technologies, communicate and collaborate effectively with AI, and use AI as a tool. This competency-based framework is invaluable for designing specific, measurable learning objectives and assessment instruments for our project. For instance, after using the tool, students should be able to:
*   Recognize that the agent uses AI for decision-making.
*   Understand that the agent's behavior improves by learning from experience.
*   Describe the core RL mechanic of learning from rewards.
*   Critically evaluate how a poorly designed reward function leads to unintended behavior.

This framework ensures that the tool is a targeted educational intervention designed to foster specific, well-defined cognitive skills.

### 2.2.3. Constructionist Learning Philosophy

The paper by Ali et al. (2019) champions constructionism as a specific pedagogical philosophy for AI education. Rooted in the work of Seymour Papert, constructionism posits that deep learning occurs most effectively when learners are actively engaged in "making" tangible, personally meaningful artifacts. The `TrainYourSnakeAI` project perfectly embodies this philosophy, as students actively construct an intelligent agent by designing its reward structure. Our proposed tool will fully embrace this philosophy, framing the user's role not as a traditional "player" but as a designer, trainer, and creator. The core gameplay loop will center on cycles of experimentation, observation, and refinement, with an interface that empowers creation and allows students to explore the consequences of their own design choices, fostering agency, ownership, and deep conceptual understanding.

## 2.3. The Pedagogical Triad

These three foundational papers—AI4K12, AI Literacy Competencies, and Constructionist Learning—form a coherent and mutually reinforcing pedagogical structure. Together, they provide a complete and robust foundation for the educational design of the proposed tool. The AI4K12 framework defines the "What" (high-level conceptual domain), the AI Literacy competencies define the "How to Measure" (specific, observable learning outcomes), and the Constructionist philosophy defines the "How to Teach" (active, creative, and making-centered user experience). By explicitly integrating this pedagogical triad, our research project demonstrates a deep, nuanced, and comprehensive understanding of the educational theory underpinning its technical implementation.
