"""
Quick diagnostic script to investigate why the agent is not winning.

Run:
    python -m scripts.diagnose_training --episodes 20 --speed 2.0
"""

import argparse
import logging
from collections import Counter
from pathlib import Path

from ai import QLearningAgent, RewardCalculator, TrainingCoordinator, DEFAULT_ACTION_NAMES
from game import StateEncoder


def run_diagnosis(num_episodes: int, speed_multiplier: float, max_steps: int):
    agent = QLearningAgent(
        n_actions=len(DEFAULT_ACTION_NAMES),
        action_names=DEFAULT_ACTION_NAMES,
        epsilon=1.0,
        learning_rate=0.2,
        discount_factor=0.95,
    )
    state_encoder = StateEncoder()
    reward_calculator = RewardCalculator({})

    trainer = TrainingCoordinator(
        agent=agent,
        state_encoder=state_encoder,
        reward_calculator=reward_calculator,
        progress_callback=None,
    )

    summary = trainer.train(
        num_episodes=num_episodes,
        max_steps_per_episode=max_steps,
        speed_multiplier=speed_multiplier,
        epsilon_decay=0.99,
        min_epsilon=0.05,
    )

    wins = sum(trainer.episode_victories)
    max_wave = 0
    reasons = Counter()
    action_counts = Counter()

    # Re-run episode logging based on stored results
    # (The trainer logger already wrote per-episode logs to logs/training.log)
    # Here we summarize what we observed.
    for episode_idx, reward in enumerate(trainer.episode_rewards):
        # No direct access to final wave per episode here; rely on log for detail.
        pass

    # Action stats are logged per episode; collect aggregate from last action_trace
    if trainer.action_trace:
        action_counts.update(trainer.action_trace)

    print("=== Diagnosis Summary ===")
    print(f"Episodes: {num_episodes}")
    print(f"Wins: {wins} / {num_episodes}")
    print(f"Average reward: {sum(trainer.episode_rewards)/len(trainer.episode_rewards):.2f}")
    print(f"Best reward: {max(trainer.episode_rewards):.2f}")
    print(f"Worst reward: {min(trainer.episode_rewards):.2f}")
    print(f"States explored: {len(agent.q_table)}")
    print(f"Action counts (last episode trace only): {action_counts}")
    print("Detailed per-episode diagnostics written to logs/training.log")


def main():
    parser = argparse.ArgumentParser(description="Diagnose training win issues.")
    parser.add_argument("--episodes", type=int, default=10, help="Number of episodes to run")
    parser.add_argument("--speed", type=float, default=2.0, help="Speed multiplier for ticks")
    parser.add_argument("--max-steps", type=int, default=1000, help="Max steps per episode")
    args = parser.parse_args()

    # Ensure log directory exists and configure console logging for quick feedback
    logs_dir = Path(__file__).resolve().parent.parent / "logs"
    logs_dir.mkdir(exist_ok=True)
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s - %(message)s",
        handlers=[
            logging.FileHandler(logs_dir / "diagnose.log", mode="a", encoding="utf-8"),
            logging.StreamHandler(),
        ],
    )

    run_diagnosis(args.episodes, args.speed, args.max_steps)


if __name__ == "__main__":
    main()
