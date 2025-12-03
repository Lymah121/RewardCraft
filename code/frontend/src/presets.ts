/**
 * Reward Presets - Phase 3 Feature
 * Pre-configured reward settings to demonstrate different AI behaviors
 *
 * Educational Purpose: Students can compare how different reward designs
 * lead to different emergent behaviors (specification gaming, reward shaping)
 *
 * Task Assignments:
 * - [Claude] Created this preset data structure
 * - [Gemini] Build UI preset buttons in RewardDesigner.tsx
 * - [Codex] Optional backend preset endpoint
 */

import type { RewardConfig } from './types';

export interface RewardPreset {
  id: string;
  name: string;
  emoji: string;
  description: string;
  educationalNote: string;
  config: RewardConfig;
}

/**
 * REWARD_PRESETS
 *
 * Each preset demonstrates a different reward design philosophy.
 * Students can load these to observe how reward shaping affects behavior.
 */
export const REWARD_PRESETS: RewardPreset[] = [
  {
    id: 'win_focused',
    name: 'Win Focused',
    emoji: '🏆',
    description: 'Prioritizes winning over everything else',
    educationalNote: 'High game_won/game_lost values make the agent prioritize survival and victory over short-term gains like killing enemies.',
    config: {
      enemy_defeated: 5,
      enemy_reached_base: -100,
      tower_built: -1,
      gold_saved: 0,
      wave_completed: 30,
      game_won: 500,
      game_lost: -500,
      boss_defeated: 100,
      tanky_defeated: 20,
      fast_defeated: 10,
      tower_upgraded: 10,
      slow_tower_built: 5,
      cannon_tower_built: 3,
      archer_tower_built: 0,
    },
  },
  {
    id: 'greedy_killer',
    name: 'Greedy Killer',
    emoji: '💀',
    description: 'Maximizes enemy kills at any cost',
    educationalNote: 'SPECIFICATION GAMING EXAMPLE: High enemy_defeated rewards cause the agent to farm kills but ignore base defense. Often leads to losses despite high scores!',
    config: {
      enemy_defeated: 25,
      enemy_reached_base: -20,
      tower_built: -1,
      gold_saved: 0,
      wave_completed: 5,
      game_won: 50,
      game_lost: -50,
      boss_defeated: 100,
      tanky_defeated: 40,
      fast_defeated: 15,
      tower_upgraded: 2,
      slow_tower_built: 0,
      cannon_tower_built: 5,
      archer_tower_built: 0,
    },
  },
  {
    id: 'gold_hoarder',
    name: 'Gold Hoarder',
    emoji: '💰',
    description: 'Saves gold instead of building towers',
    educationalNote: 'SPECIFICATION GAMING EXAMPLE: High gold_saved rewards cause the agent to hoard resources instead of building defenses. Watch it fail to defend the base!',
    config: {
      enemy_defeated: 5,
      enemy_reached_base: -30,
      tower_built: -10,
      gold_saved: 5,
      wave_completed: 10,
      game_won: 100,
      game_lost: -100,
      boss_defeated: 30,
      tanky_defeated: 10,
      fast_defeated: 5,
      tower_upgraded: -5,
      slow_tower_built: -2,
      cannon_tower_built: -2,
      archer_tower_built: -2,
    },
  },
  {
    id: 'defensive',
    name: 'Defensive',
    emoji: '🛡️',
    description: 'Heavily penalizes any enemy reaching the base',
    educationalNote: 'Strong negative rewards for enemies reaching base encourage building more towers and using slow towers strategically.',
    config: {
      enemy_defeated: 8,
      enemy_reached_base: -150,
      tower_built: 0,
      gold_saved: 0,
      wave_completed: 25,
      game_won: 300,
      game_lost: -400,
      boss_defeated: 75,
      tanky_defeated: 25,
      fast_defeated: 15,
      tower_upgraded: 15,
      slow_tower_built: 10,
      cannon_tower_built: 5,
      archer_tower_built: 3,
    },
  },
  {
    id: 'balanced',
    name: 'Balanced',
    emoji: '⚖️',
    description: 'Well-rounded rewards for all objectives',
    educationalNote: 'A balanced approach that rewards multiple objectives. Good baseline for comparison with specialized strategies.',
    config: {
      enemy_defeated: 10,
      enemy_reached_base: -50,
      tower_built: -2,
      gold_saved: 1,
      wave_completed: 20,
      game_won: 200,
      game_lost: -200,
      boss_defeated: 50,
      tanky_defeated: 15,
      fast_defeated: 8,
      tower_upgraded: 8,
      slow_tower_built: 5,
      cannon_tower_built: 3,
      archer_tower_built: 2,
    },
  },
];

/**
 * Get a preset by its ID
 */
export function getPresetById(id: string): RewardPreset | undefined {
  return REWARD_PRESETS.find(preset => preset.id === id);
}

/**
 * Get the default preset (balanced)
 */
export function getDefaultPreset(): RewardPreset {
  return REWARD_PRESETS.find(preset => preset.id === 'balanced')!;
}
