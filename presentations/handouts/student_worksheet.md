# RewardCraft: Design Your AI's Brain

## Student Worksheet

**Name:** _________________________ **Date:** _____________

---

## Part 1: Understanding the Game

The AI is learning to play a **Tower Defense** game:
- **Goal**: Defend your base from waves of enemies
- **Actions**: Build towers (left, center, right), save gold, or wait
- **Resources**: Gold (for building), Lives (lose when enemies reach base)

**Question 1**: If you were playing this game, what would be your strategy?

_____________________________________________________________

_____________________________________________________________

---

## Part 2: Designing Rewards

The AI learns by receiving **rewards** (positive) and **penalties** (negative) for different events.

**Your Reward Configuration:**

| Event | Your Value | Why? |
|-------|-----------|------|
| Enemy Defeated | | |
| Enemy Reached Base | | |
| Tower Built | | |
| Gold Saved | | |
| Wave Completed | | |

**Question 2**: Why did you choose these values? What behavior do you expect?

_____________________________________________________________

_____________________________________________________________

---

## Part 3: Observation

Run training with your reward configuration. Watch the AI learn!

**After 50 episodes:**
- Win Rate: _______%
- Average Reward: _______
- Is the AI improving? Yes / No

**Question 3**: Describe what the AI is doing. Is it what you expected?

_____________________________________________________________

_____________________________________________________________

---

## Part 4: The Alignment Problem

Sometimes AI does unexpected things because of how we defined the rewards.

**Experiment**: Try setting "Tower Built" to -50 (high penalty).

**Question 4**: What happened? Why did the AI behave this way?

_____________________________________________________________

_____________________________________________________________

**Question 5**: This is called "specification gaming" - the AI found a way to maximize reward that wasn't what you intended. Can you think of a real-world example where this could be dangerous?

_____________________________________________________________

_____________________________________________________________

---

## Part 5: Reflection

**The Q-Learning Formula:**
```
Q(s,a) ← Q(s,a) + α[r + γ·max(Q(s',a')) - Q(s,a)]
```

- **α (learning rate)**: How quickly the AI updates its knowledge
- **γ (discount factor)**: How much the AI values future vs immediate rewards
- **ε (epsilon)**: How often the AI explores vs exploits

**Question 6**: In your own words, explain how the AI "learns" from your reward function.

_____________________________________________________________

_____________________________________________________________

_____________________________________________________________

---

## Part 6: Key Takeaways

Check the boxes for concepts you now understand:

- [ ] Reinforcement Learning uses rewards to teach AI
- [ ] The reward function encodes human values
- [ ] Poorly designed rewards lead to unintended behavior
- [ ] AI "alignment" means making AI do what we actually want
- [ ] Testing and iteration are essential in AI development

**Question 7**: One thing I learned today that surprised me:

_____________________________________________________________

_____________________________________________________________
