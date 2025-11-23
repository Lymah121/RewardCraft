/**
 * Reward Designer Component
 * Allows students to design reward functions that shape AI behavior
 *
 * This is the core educational interface - students learn that
 * AI behavior is entirely controlled by the rewards they design
 */

import { useState, useEffect } from 'react';
import type { RewardConfig } from '../types';
import './RewardDesigner.css';

interface RewardDesignerProps {
  initialConfig?: RewardConfig;
  onConfigChange: (config: RewardConfig) => void;
  disabled?: boolean;
}

const DEFAULT_REWARDS: RewardConfig = {
  enemy_defeated: 10,
  enemy_reached_base: -50,
  tower_built: -2,
  gold_saved: 1,
  wave_completed: 20,
};

const REWARD_INFO = {
  enemy_defeated: {
    label: '🎯 When enemy defeated',
    description: 'Reward given each time a tower kills an enemy',
    emoji: '🎯',
  },
  enemy_reached_base: {
    label: '💔 When enemy reaches base',
    description: 'Penalty when an enemy reaches your base',
    emoji: '💔',
  },
  tower_built: {
    label: '🏗️ When tower built',
    description: 'Cost of building a tower (usually negative)',
    emoji: '🏗️',
  },
  gold_saved: {
    label: '💰 When gold saved',
    description: 'Reward per 10 gold saved at end of wave',
    emoji: '💰',
  },
  wave_completed: {
    label: '✅ When wave completed',
    description: 'Bonus for completing a wave successfully',
    emoji: '✅',
  },
};

export const RewardDesigner = ({
  initialConfig = DEFAULT_REWARDS,
  onConfigChange,
  disabled = false,
}: RewardDesignerProps) => {
  const [rewards, setRewards] = useState<RewardConfig>(initialConfig);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setRewards(initialConfig);
  }, [initialConfig]);

  const handleRewardChange = (key: keyof RewardConfig, value: number) => {
    const newRewards = { ...rewards, [key]: value };
    setRewards(newRewards);
    setHasChanges(true);
  };

  const handleApply = () => {
    onConfigChange(rewards);
    setHasChanges(false);
  };

  const handleReset = () => {
    setRewards(DEFAULT_REWARDS);
    setHasChanges(true);
  };

  const getSliderColor = (value: number): string => {
    if (value < 0) return 'var(--negative-red)';
    if (value > 0) return 'var(--positive-green)';
    return 'var(--text-secondary)';
  };

  return (
    <div className="reward-designer">
      <div className="reward-designer-header">
        <h3>🎨 Design Your AI's Rewards</h3>
        <p className="reward-designer-subtitle">
          Adjust these values to teach your AI what's important
        </p>
      </div>

      <div className="reward-sliders">
        {(Object.keys(REWARD_INFO) as Array<keyof typeof REWARD_INFO>).map((key) => {
          const info = REWARD_INFO[key];
          const value = rewards[key];

          return (
            <div key={key} className="reward-slider-group">
              <div className="reward-slider-header">
                <label htmlFor={key} className="reward-label">
                  {info.label}
                </label>
                <span
                  className="reward-value"
                  style={{ color: getSliderColor(value) }}
                >
                  {value > 0 ? '+' : ''}
                  {value}
                </span>
              </div>

              <div className="reward-slider-container">
                <input
                  type="range"
                  id={key}
                  min="-100"
                  max="100"
                  step="1"
                  value={value}
                  onChange={(e) => handleRewardChange(key, parseInt(e.target.value))}
                  disabled={disabled}
                  className="reward-slider"
                  style={{
                    background: `linear-gradient(to right,
                      var(--negative-red) 0%,
                      var(--text-secondary) 50%,
                      var(--positive-green) 100%)`,
                  }}
                />
              </div>

              <p className="reward-description">{info.description}</p>
            </div>
          );
        })}
      </div>

      <div className="reward-designer-actions">
        <button
          onClick={handleReset}
          disabled={disabled}
          className="button-secondary"
        >
          🔄 Reset to Default
        </button>
        <button
          onClick={handleApply}
          disabled={disabled || !hasChanges}
          className="button-primary"
        >
          {hasChanges ? '✨ Apply Changes' : '✓ Applied'}
        </button>
      </div>

      <div className="reward-designer-tips">
        <h4>💡 Tips for Designing Rewards</h4>
        <ul>
          <li>
            <strong>Positive rewards</strong> encourage the AI to do more of that action
          </li>
          <li>
            <strong>Negative rewards (penalties)</strong> discourage actions
          </li>
          <li>
            Try making <code>tower_built</code> very negative (-50) and see what happens!
          </li>
          <li>
            Balance short-term rewards (defeating enemies) with long-term strategy (saving gold)
          </li>
        </ul>
      </div>
    </div>
  );
};
