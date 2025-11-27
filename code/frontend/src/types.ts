/**
 * Type definitions for RewardCraft frontend
 * Matches backend API specification
 */

export interface RewardConfig {
  enemy_defeated: number;
  enemy_reached_base: number;
  tower_built: number;
  gold_saved: number;
  wave_completed: number;
  game_won?: number;
  game_lost?: number;
}

export interface GameState {
  gold: number;
  lives: number;
  current_wave: number;
  total_waves: number;
  enemies: Enemy[];
  towers: Tower[];
  game_over: boolean;
  victory: boolean;
}

export interface Enemy {
  id: number;
  // Backend sends x, y separately; frontend may expect position array
  x?: number;
  y?: number;
  position?: [number, number];
  hp: number;
  max_hp: number;
}

export interface Tower {
  id: number;
  // Backend sends x, y separately; frontend may expect position array
  x?: number;
  y?: number;
  position?: [number, number];
  range?: number;
  damage?: number;
  kills?: number;
}

export interface QTableData {
  states: string[];
  actions: string[];
  q_values: number[][];
  state_labels: Record<string, string>;
  statistics: {
    total_states: number;
    total_steps: number;
    epsilon: number;
    most_visited_state: string | null;
    most_taken_action: string | null;
  };
  state_space_size: number;
  states_visited: number;
}

export interface TrainingStatus {
  is_training: boolean;
  current_episode: number;
  total_episodes: number;
  progress_percent: number;
  stats: {
    episodes_completed: number;
    avg_reward: number;
    win_rate: number;
    best_reward: number;
    avg_episode_length: number;
    total_states_explored: number;
  };
}

export interface TrainingHistory {
  episode_rewards: number[];
  episode_victories: boolean[];
  episode_lengths: number[];
  stats: {
    episodes_completed: number;
    avg_reward: number;
    win_rate: number;
    best_reward: number;
    avg_episode_length: number;
    total_states_explored: number;
  };
}

// WebSocket message types
export interface WSMessage {
  type: 'training_started' | 'episode_start' | 'step' | 'game_tick' | 'episode_end' | 'episode_complete' | 'training_complete' | 'status' | 'error' | 'pong';
  [key: string]: any;
}

export interface WSTrainingStarted extends WSMessage {
  type: 'training_started';
  num_episodes: number;
  speed_multiplier: number;
  reward_config: RewardConfig;
}

export interface WSEpisodeStart extends WSMessage {
  type: 'episode_start';
  episode: number;
  state: any;
  game_state: GameState;
}

export interface WSStep extends WSMessage {
  type: 'step';
  episode: number;
  step: number;
  state: string;
  action: string;
  reward: number;
  reward_breakdown: Record<string, number>;
  new_state: string;
  q_value_old: number;
  q_value_new: number;
  game_state: GameState;
}

export interface WSEpisodeEnd extends WSMessage {
  type: 'episode_end';
  episode: number;
  total_reward: number;
  victory: boolean;
  steps: number;
  final_state: GameState;
}

export interface WSTrainingComplete extends WSMessage {
  type: 'training_complete';
  summary: {
    total_episodes: number;
    episode_rewards: number[];
    episode_victories: boolean[];
    final_stats: any;
    q_table: any;
  };
}

export interface WSCommand {
  command: 'start_training' | 'stop_training' | 'get_status' | 'ping';
  num_episodes?: number;
  reward_config?: RewardConfig;
  speed_multiplier?: number;
  learning_rate?: number;
  discount_factor?: number;
  epsilon?: number;
}
