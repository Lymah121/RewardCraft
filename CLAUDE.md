# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a research and development repository for **RewardCraft**, a game-based educational tool designed to teach Reinforcement Learning (RL) to high school students (ages 14-18). The project combines academic research with tool development, aiming to produce a conference paper and an engaging educational game that integrates AI ethics directly into gameplay mechanics. The shift to high school students enables deeper engagement with students as true AI system designers.

## Role and Standards

You are assisting Halimat, a master's student, under the mentorship of a senior AI researcher. Work must be held to high academic standards. The output is a research paper for a K-12 AI education conference, requiring:
- **Clarity for the target audience** (high school educators and students)
- **Technical precision** where appropriate
- **Rigorous pedagogical grounding** in learning science
- **Progressive complexity** that respects students' growing cognitive abilities

## Repository Structure

```
/reward_craft_paper/
  /manuscript/
    main.md                           # Main paper structure and TOC
    /sections/
      01_introduction.md              # Project context and motivation
      02_related_work.md              # Literature review and pedagogical frameworks
      03_learning_activity_design.md  # Core learning activity and ethics integration
      04_methodology.md               # UI/UX design and technical approach
      05_discussion_and_conclusion.md
  /notes/                             # Working notes and explanations
  /data/                              # Research data
  /figures/                           # Paper figures and diagrams

/reference_materials/
  /txt/                               # Extracted text from research papers
  /md_versions/                       # Markdown conversions of key references
  /source_materials/                  # Original PDFs and documents

RewardCraft_Pedagogical_Framework.md  # Core pedagogical framework document
GEMINI.md                             # Instructions for Gemini (previous AI assistant)
```

## Core Pedagogical Framework

The RewardCraft learning activity is structured around a **four-phase experiential learning cycle**:

1. **Play** - Students play Snake themselves to understand the game mechanics
2. **Train** - Students design the AI agent's reward function using an intuitive interface
3. **Observe** - Students watch the agent learn and observe emergent behaviors
4. **Reflect** - Guided questions help students articulate RL principles and ethical implications

**Critical Insight**: The reward function editor is not just a technical tool—it's an **ethics tool**. When students create flawed reward functions (e.g., rewarding "staying alive" leading to circular movement), they experience specification gaming and unintended consequences firsthand.

## Key Theoretical Foundations

### The Pedagogical Triad
The project integrates three foundational frameworks:
1. **AI4K12's Five Big Ideas** - Defines the conceptual domain (Big Idea 3: Learning)
2. **AI Literacy Competencies** (Long & Magerko, 2020) - Defines measurable learning outcomes
3. **Constructionist Learning Philosophy** - Defines the pedagogical approach (students as creators/designers)

### Design Innovation Gap
Existing tools occupy different positions on the **modality-interaction spectrum**:
- **High interaction, low embodiment**: TrainYourSnakeAI, ArtBot (direct parameter manipulation, 2D screen-based)
- **Low interaction, high embodiment**: ARtonomous, PlayGrid (observational, physically embodied)

**Innovation opportunity**: Combine deep parametric interactivity with compelling, embodied visualization.

## Paper Writing Guidelines

### Audience and Tone
- Primary audience: K-12 educators, educational researchers, conference attendees
- Balance accessibility with academic rigor
- Emphasize clarity when explaining RL concepts
- Use technical precision when discussing pedagogy and learning science

### Key Concepts to Emphasize
- **Constructionism**: Students as AI trainers/designers, not passive players
- **Embedded ethics**: Ethics woven into gameplay, not treated as separate topic
- **Specification gaming**: When AI optimizes poorly-specified objectives
- **The RL loop as game loop**: Natural synergy between RL mechanics and engaging game design

### Critical References
- TrainYourSnakeAI (baseline comparison)
- Williams et al. (2022) - AI + Ethics Curricula for Middle School Youth
- Long & Magerko (2020) - AI Literacy competencies
- Touretzky et al. (2019) - Five Big Ideas in AI (AI4K12 initiative)
- Ali et al. (2019) - Constructionist learning for AI education

## Manuscript Organization

The paper follows a standard academic structure with modular sections in [/reward_craft_paper/manuscript/sections/](reward_craft_paper/manuscript/sections/). Each section file is self-contained and can be edited independently. The [main.md](reward_craft_paper/manuscript/main.md) file serves as the structural spine linking all sections.

## Development Context

### UI/UX Design Principles (Ages 14-18)
- Sophisticated, professional visual style that treats them as young adults
- Progressive disclosure of complexity (start simple, reveal depth)
- Full creative control over reward function design (numerical weights, conditions)
- Transparency in AI decision-making (show Q-values, state representations)
- Safe space for "productive failure" with emphasis on debugging skills
- Social features for sharing and competing with different reward functions

### Technical Implementation Notes
- **Target algorithm**: Q-learning (conceptually simple, visualizable Q-table)
- **Development tools**: OpenAI Gym/Gymnasium, TensorFlow Agents, OpenAI Baselines
- **Core mechanic**: Students design complex reward functions; agent learns through RL
- **Visualization priority**: Make abstract RL components (Q-values, state) transparent and interactive
- **Progressive complexity levels**:
  - Level 1: Basic reward/punish toggles
  - Level 2: Weighted multi-objective rewards
  - Level 3: Conditional logic and reward shaping
  - Level 4: Hyperparameter tuning (learning rate, discount factor)

## Working with This Repository

### When Editing Paper Sections
- Maintain academic voice appropriate for conference proceedings
- Cross-reference the pedagogical framework document when discussing learning design
- Ensure claims about existing tools are grounded in the reference materials
- Connect technical design choices back to pedagogical theory

### When Adding Content
- New references should be summarized in `/reference_materials/md_versions/` if they're foundational
- Maintain the pedagogical triad lens (What, How to Measure, How to Teach)
- Always consider both the technical RL aspect and the ethical dimension

### Before Finalizing Changes
- Verify consistency across all manuscript sections
- Ensure the abstract in main.md reflects the current state of all sections
- Check that learning outcomes are specific and measurable
