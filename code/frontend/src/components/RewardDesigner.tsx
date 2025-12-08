/**
 * Reward Designer Component - Phase 3
 * Allows students to design reward functions that shape AI behavior
 *
 * Visual design:
 * - Cyberpunk aesthetic with neon sliders
 * - Interactive feedback
 * - Educational tips
 */

import { useState, useEffect } from 'react';
import type { RewardConfig } from '../types';
import { REWARD_PRESETS, type RewardPreset } from '../presets';
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
    label: '🎯 Enemy Defeated',
    description: 'Reward given each time a tower kills an enemy',
    emoji: '🎯',
  },
  enemy_reached_base: {
    label: '💔 Enemy Reached Base',
    description: 'Penalty when an enemy reaches your base',
    emoji: '💔',
  },
  tower_built: {
    label: '🏗️ Tower Built',
    description: 'Cost of building a tower (usually negative)',
    emoji: '🏗️',
  },
  gold_saved: {
    label: '💰 Gold Saved',
    description: 'Reward per 10 gold saved at end of wave',
    emoji: '💰',
  },
  wave_completed: {
    label: '✅ Wave Completed',
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
  const [activePresetTooltip, setActivePresetTooltip] = useState<string | null>(null);
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);

  useEffect(() => {
    setRewards(initialConfig);
  }, [initialConfig]);

  const handleRewardChange = (key: keyof RewardConfig, value: number) => {
    const newRewards = { ...rewards, [key]: value };
    setRewards(newRewards);
    setHasChanges(true);
  };

  const handlePresetSelect = (preset: RewardPreset) => {
    // Merge preset config with current rewards to ensure all keys exist
    // (though presets should have all keys, this is safer)
    const newRewards = { ...rewards, ...preset.config };
    setRewards(newRewards);
    setSelectedPresetId(preset.id);
    setHasChanges(true);
    onConfigChange(newRewards); // Auto-apply presets for immediate feedback
    setHasChanges(false); // Mark as saved since we just auto-applied
  };

  const handleApply = () => {
    onConfigChange(rewards);
    setHasChanges(false);
  };

  const handleReset = () => {
    setRewards(DEFAULT_REWARDS);
    setSelectedPresetId(null);
    setHasChanges(true);
  };

  const getSliderColor = (value: number): string => {
    if (value < 0) return 'text-neon-red';
    if (value > 0) return 'text-neon-green';
    return 'text-gray-400';
  };

  const getSliderBackground = (value: number): string => {
    if (value < 0) return 'bg-neon-red';
    if (value > 0) return 'bg-neon-green';
    return 'bg-gray-600';
  };

  return (
    <div className="flex flex-col h-full">
      <div className="mb-4">
        <h3 className="text-xl font-bold text-gray-100 flex items-center gap-2">
          <span className="text-2xl">🎨</span> Reward Designer
        </h3>
        <p className="text-sm text-gray-400 mt-1">
          Shape your AI's behavior by adjusting rewards
        </p>
      </div>

      {/* Presets Section */}
      <div className="mb-6">
        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
          Quick Presets
        </h4>
        <div className="grid grid-cols-2 gap-2">
          {REWARD_PRESETS.map((preset) => (
            <div
              key={preset.id}
              className="relative group"
              onMouseEnter={() => setActivePresetTooltip(preset.id)}
              onMouseLeave={() => setActivePresetTooltip(null)}
            >
              <button
                onClick={() => handlePresetSelect(preset)}
                disabled={disabled}
                className="w-full px-3 py-2 bg-black/40 border border-white/10 hover:border-neon-purple/50 hover:bg-neon-purple/10 text-left rounded-lg transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="text-lg">{preset.emoji}</span>
                <span className="text-sm font-medium text-gray-200 group-hover:text-neon-purple">
                  {preset.name}
                </span>
              </button>

              {/* Tooltip */}
              {activePresetTooltip === preset.id && (
                <div className="absolute z-50 bottom-full left-0 mb-2 p-3 bg-gray-900 border border-neon-purple/30 rounded shadow-[0_0_15px_rgba(0,0,0,0.5)] text-xs text-gray-200 w-64 pointer-events-none backdrop-blur-md">
                  <div className="font-bold text-neon-purple mb-1">{preset.name}</div>
                  <div className="mb-2">{preset.description}</div>
                  <div className="text-gray-400 italic border-t border-white/10 pt-1 mt-1">
                    <span className="mr-1">🎓</span>
                    {preset.educationalNote}
                  </div>
                  <div className="absolute bottom-0 left-6 transform translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900 border-r border-b border-neon-purple/30"></div>
                </div>
              )}
            </div>
          ))}
        </div>
        {selectedPresetId && (
          <div className="mt-3 p-3 rounded-lg border border-neon-purple/30 bg-black/30">
            <div className="text-sm text-gray-200 flex items-center gap-2 mb-1">
              <span className="text-neon-purple">⭐ Active Preset:</span>
              <span className="font-semibold">
                {REWARD_PRESETS.find((p) => p.id === selectedPresetId)?.name}
              </span>
            </div>
            <p className="text-xs text-gray-400 italic flex gap-1">
              <span>🎓</span>
              <span>{REWARD_PRESETS.find((p) => p.id === selectedPresetId)?.educationalNote}</span>
            </p>
          </div>
        )}
      </div>

      <div className="flex-grow overflow-y-auto custom-scrollbar pr-2 space-y-6">
        {(Object.keys(REWARD_INFO) as Array<keyof typeof REWARD_INFO>).map((key) => {
          const info = REWARD_INFO[key];
          const value = rewards[key];

          return (
            <div key={key} className="group">
              <div className="flex justify-between items-center mb-2">
                <label htmlFor={key} className="text-sm font-medium text-gray-300 group-hover:text-neon-blue transition-colors">
                  {info.label}
                </label>
                <span className={`font-mono font-bold ${getSliderColor(value)}`}>
                  {value > 0 ? '+' : ''}{value}
                </span>
              </div>

              <div className="relative h-6 flex items-center">
                {/* Track Background */}
                <div className="absolute w-full h-1.5 bg-cyber-dark rounded-full overflow-hidden border border-white/10">
                  {/* Center Marker */}
                  <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-white/20"></div>
                </div>

                <input
                  type="range"
                  id={key}
                  min="-100"
                  max="100"
                  step="1"
                  value={value}
                  onChange={(e) => handleRewardChange(key, parseInt(e.target.value))}
                  disabled={disabled}
                  className="w-full h-6 opacity-0 cursor-pointer z-10 absolute"
                />

                {/* Custom Thumb (Visual Only) */}
                <div
                  className={`absolute h-4 w-4 rounded-full shadow-lg transform -translate-x-1/2 pointer-events-none transition-all duration-75
                    ${getSliderBackground(value)} ${disabled ? 'opacity-50' : 'group-hover:scale-125 group-hover:shadow-[0_0_10px_currentColor]'}
                  `}
                  style={{ left: `${((value + 100) / 200) * 100}%` }}
                ></div>

                {/* Fill Bar */}
                <div
                  className={`absolute h-1.5 rounded-full pointer-events-none opacity-50 ${getSliderBackground(value)}`}
                  style={{
                    left: value >= 0 ? '50%' : `${((value + 100) / 200) * 100}%`,
                    width: `${Math.abs(value) / 2}%`
                  }}
                ></div>
              </div>

              <p className="text-xs text-gray-500 mt-1 italic">{info.description}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-4 border-t border-white/10 flex flex-col gap-3">
        <div className="flex gap-3">
          <button
            onClick={handleReset}
            disabled={disabled}
            className="flex-1 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            🔄 Reset
          </button>
          <button
            onClick={handleApply}
            disabled={disabled || !hasChanges}
            className={`flex-1 px-3 py-2 rounded-lg text-sm font-bold transition-all transform
              ${hasChanges
                ? 'bg-neon-blue hover:bg-cyan-400 text-black shadow-[0_0_10px_rgba(6,182,212,0.3)] hover:scale-[1.02]'
                : 'bg-green-900/30 text-green-400 border border-green-900 cursor-default'
              }
              disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
            `}
          >
            {hasChanges ? '✨ Apply Changes' : '✓ Applied'}
          </button>
        </div>

        <div className="bg-neon-yellow/10 border border-neon-yellow/20 rounded p-3 text-xs text-neon-yellow/80">
          <strong className="block mb-1">💡 Pro Tip:</strong>
          Try making <code>Tower Built</code> very negative (-50) to see if the AI learns to be efficient!
        </div>
      </div>
    </div>
  );
};
