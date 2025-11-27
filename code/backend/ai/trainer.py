"""
Training coordinator for RewardCraft
Manages training sessions, episodes, and progress tracking
"""

from typing import Dict, List, Callable, Optional
import sys
from pathlib import Path
import time

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from ai.q_learning import QLearningAgent
from ai.reward_function import RewardCalculator
from game.engine import TowerDefenseGame
from game.state_encoder import StateEncoder


class TrainingCoordinator:
    """
    Manages the complete training loop for the Q-learning agent.

    Responsibilities:
    - Run training episodes
    - Track progress metrics
    - Provide callbacks for real-time updates
    - Manage game state and AI integration
    """

    def __init__(
        self,
        agent: QLearningAgent,
        state_encoder: StateEncoder,
        reward_calculator: RewardCalculator,
        progress_callback: Optional[Callable] = None
    ):
        """
        Args:
            agent: The Q-learning agent to train
            state_encoder: Encoder for game state -> discrete state
            reward_calculator: Calculator for rewards
            progress_callback: Function to call with updates (for WebSocket)
        """
        self.agent = agent
        self.state_encoder = state_encoder
        self.reward_calculator = reward_calculator
        self.progress_callback = progress_callback

        # Training statistics
        self.episode_rewards: List[float] = []
        self.episode_victories: List[bool] = []
        self.episode_lengths: List[int] = []

        # Current training state
        self.is_training = False
        self.current_episode = 0
        self.total_episodes = 0

    def train(
        self,
        num_episodes: int = 100,
        max_steps_per_episode: int = 1000,
        speed_multiplier: float = 1.0
    ) -> Dict:
        """
        Run a training session for multiple episodes.

        Args:
            num_episodes: Number of episodes to train
            max_steps_per_episode: Maximum steps before episode timeout
            speed_multiplier: Speed up factor (1.0 = normal, 2.0 = 2x faster)

        Returns:
            Training statistics summary
        """
        self.is_training = True
        self.total_episodes = num_episodes

        for episode in range(num_episodes):
            if not self.is_training:  # Allow stopping mid-training
                break

            self.current_episode = episode + 1

            # Run single episode
            episode_result = self._run_episode(
                episode_num=self.current_episode,
                max_steps=max_steps_per_episode,
                speed_multiplier=speed_multiplier
            )

            # Track statistics
            self.episode_rewards.append(episode_result['total_reward'])
            self.episode_victories.append(episode_result['victory'])
            self.episode_lengths.append(episode_result['steps'])

            # Send progress update
            if self.progress_callback:
                self.progress_callback({
                    'type': 'episode_complete',
                    'episode': self.current_episode,
                    'total_episodes': self.total_episodes,
                    'reward': episode_result['total_reward'],
                    'victory': episode_result['victory'],
                    'statistics': self._get_current_stats()
                })

        self.is_training = False
        return self._get_training_summary()

    def _run_episode(
        self,
        episode_num: int,
        max_steps: int,
        speed_multiplier: float
    ) -> Dict:
        """
        Run a single training episode.

        Returns:
            Episode results including reward, victory status, steps
        """
        # Create new game instance
        game = TowerDefenseGame()

        # Episode tracking
        total_reward = 0.0
        steps = 0
        done = False

        # Get initial state
        game_state = game.get_state()
        state = self.state_encoder.encode(game_state)

        # Send episode start update
        if self.progress_callback:
            state_key = self.state_encoder.get_state_key(state)
            self.progress_callback({
                'type': 'episode_start',
                'episode': episode_num,
                'state': state_key,
                'game_state': game_state
            })

        while not done and steps < max_steps:
            # Agent chooses action (get_action returns (action_idx, was_exploration))
            action, was_exploration = self.agent.get_action(state)
            action_name = self.agent.action_names[action]

            # Execute action in game
            old_game_state = game.get_state()
            action_result = game.execute_action(action_name)

            # Get new state
            new_game_state = game.get_state()
            new_state = self.state_encoder.encode(new_game_state)

            # Calculate reward
            reward, reward_breakdown = self.reward_calculator.calculate(
                old_state=old_game_state,
                action=action_name,
                new_state=new_game_state,
                events=game.events
            )

            # Update agent
            old_q, new_q = self.agent.update(
                state=state,
                action=action,
                reward=reward,
                next_state=new_state,
                done=(game.victory or game.defeat)
            )

            # Send step update
            if self.progress_callback:
                # Convert state dicts to string keys for frontend
                state_key = self.state_encoder.get_state_key(state)
                new_state_key = self.state_encoder.get_state_key(new_state)
                self.progress_callback({
                    'type': 'step',
                    'episode': episode_num,
                    'step': steps,
                    'state': state_key,
                    'action': action_name,
                    'reward': reward,
                    'reward_breakdown': reward_breakdown,
                    'new_state': new_state_key,
                    'q_value_old': old_q,
                    'q_value_new': new_q,
                    'game_state': new_game_state
                })

            # Progress game simulation
            # Run multiple ticks and send periodic game state updates for visualization
            ticks_per_step = int(60 * speed_multiplier)  # 60 FPS base
            ticks_per_update = max(1, ticks_per_step // 10)  # Send ~10 updates per step

            for tick in range(ticks_per_step):
                game.tick()

                # Send game state update periodically for real-time visualization
                if self.progress_callback and tick % ticks_per_update == 0:
                    self.progress_callback({
                        'type': 'game_tick',
                        'episode': episode_num,
                        'step': steps,
                        'tick': tick,
                        'game_state': game.get_state()
                    })

                if game.victory or game.defeat:
                    break

            # Track progress
            total_reward += reward
            steps += 1
            state = new_state
            done = (game.victory or game.defeat)

            # Small delay for visualization based on speed
            # Lower speed = more delay = easier to watch
            if speed_multiplier <= 1.0:
                time.sleep(0.05)  # 50ms delay at 1x speed
            elif speed_multiplier <= 2.0:
                time.sleep(0.02)  # 20ms delay at 2x speed
            elif speed_multiplier <= 5.0:
                time.sleep(0.005)  # 5ms delay at 5x speed
            # No delay at higher speeds

        # Episode complete
        victory = game.victory

        # Send episode end update
        if self.progress_callback:
            self.progress_callback({
                'type': 'episode_end',
                'episode': episode_num,
                'total_reward': total_reward,
                'victory': victory,
                'steps': steps,
                'final_state': game.get_state()
            })

        return {
            'total_reward': total_reward,
            'victory': victory,
            'steps': steps,
            'final_lives': game.lives,
            'final_gold': game.gold
        }

    def stop_training(self):
        """Stop training gracefully after current episode"""
        self.is_training = False

    def _get_current_stats(self) -> Dict:
        """Get current training statistics"""
        if not self.episode_rewards:
            return {
                'episodes_completed': 0,
                'avg_reward': 0,
                'win_rate': 0,
                'avg_episode_length': 0
            }

        recent_window = 10  # Last 10 episodes
        recent_rewards = self.episode_rewards[-recent_window:]
        recent_victories = self.episode_victories[-recent_window:]

        return {
            'episodes_completed': len(self.episode_rewards),
            'avg_reward': sum(recent_rewards) / len(recent_rewards),
            'win_rate': sum(recent_victories) / len(recent_victories),
            'best_reward': max(self.episode_rewards),
            'avg_episode_length': sum(self.episode_lengths) / len(self.episode_lengths),
            'total_states_explored': len(self.agent.q_table)
        }

    def _get_training_summary(self) -> Dict:
        """Get complete training summary"""
        if not self.episode_rewards:
            return {'error': 'No episodes completed'}

        return {
            'total_episodes': len(self.episode_rewards),
            'episode_rewards': self.episode_rewards,
            'episode_victories': self.episode_victories,
            'episode_lengths': self.episode_lengths,
            'final_stats': {
                'avg_reward': sum(self.episode_rewards) / len(self.episode_rewards),
                'win_rate': sum(self.episode_victories) / len(self.episode_victories),
                'best_reward': max(self.episode_rewards),
                'worst_reward': min(self.episode_rewards),
                'total_states_explored': len(self.agent.q_table),
                'q_table_size': len(self.agent.q_table)
            },
            'q_table': self.agent.get_q_table_for_visualization()
        }

    def reset_training(self):
        """Reset all training statistics"""
        self.episode_rewards = []
        self.episode_victories = []
        self.episode_lengths = []
        self.current_episode = 0
        self.total_episodes = 0
        self.agent.reset()

    def get_current_progress(self) -> Dict:
        """Get current training progress for status checks"""
        return {
            'is_training': self.is_training,
            'current_episode': self.current_episode,
            'total_episodes': self.total_episodes,
            'progress_percent': (self.current_episode / self.total_episodes * 100) if self.total_episodes > 0 else 0,
            'stats': self._get_current_stats()
        }
