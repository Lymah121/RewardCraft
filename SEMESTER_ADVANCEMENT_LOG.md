# RewardCraft Semester Advancements

This log documents the improvements made to push the RewardCraft prototype to a research-ready capability for the empirical classroom study.

## Phase 1: Code Consistency & Bug Fixes
- **App.tsx / TypeScript Fixes:** Removed the unused `lastReward` state variable which caused compilation errors.
- **WebSocket Binding:** Integrated `epsilon_decay` parameter pass-through from `App.tsx` to `useWebSocket.ts` so student configurations are correctly sent to the backend.
- **Pydantic Migration in `routes.py`:**
  - Migrated legacy `.dict()` outputs to `.model_dump()` to prevent deprecation warnings.
  - Added new Phase 3 specific rewards (`boss_defeated`, `tower_upgraded`, `special_tower_built`) directly to the `RewardConfig` class definition to fix silent data drops.
  - Corrected the `/api/info` endpoint to correctly report 5 total waves instead of old logic.

## Phase 2: Documentation Alignment
- **LaTeX Correction:** Table I in `reward_craft_paper.tex` rewritten to verbatim track the features defined inside `state_encoder.py` (factors such as Gold Level, Enemies on Field, Towers Built, Wave Progress, Threat Level, and Slow Tower presence).
- **Pedagogical Alignment:** `RewardCraft_Pedagogical_Framework.md` completely overhauled to contextualize the learning off of a "Tower Defense" analogy instead of the older "Snake" references, mapping the modern UI elements.
- **Statistical Cleanup:** All READMEs report 486 discrete states, 5 waves, and 12 potential actions.

## Phase 3: Research Infrastructure (Data Collection)
- Added a full local SQLite logger via a new module `database.py`.
- Training sessions are assigned UUIDs; every single episode run creates a row tracking `episode_num`, `total_reward`, `victory`, `steps`, and `final_wave`.
- Integrated `database.py` seamlessly onto the top layers of `trainer.py`.
- Exposed `/api/research/sessions/csv` and `/api/research/episodes/csv` to instantly pull test data.

## Phase 4: Scaffolded Pedagogy Tools
- **Simple Mode UI:** Embedded a boolean toggle over the `RewardDesigner.tsx` element, exposing explicit [Punish] or [Reward] standard buttons locking integer weights, reducing cognitive burden.
- **Live Reflection:** Engineered `ReflectionModal.tsx` which triggers automatically upon `training_complete` events across the WebSocket, prompting students to evaluate potential reward manipulation and specification gaming directly alongside their final Win Rate.
