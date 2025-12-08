/**
 * Reward Breakdown Component - Phase 3
 * Shows detailed breakdown of how rewards are calculated each step
 * Helps students understand the cause-effect relationship in RL
 *
 * Visual design:
 * - Cyberpunk aesthetic with neon accents
 * - Animated reward feeds
 * - Clear positive/negative distinction
 */

import { useMemo } from 'react';
import './RewardBreakdown.css';

interface RewardBreakdownProps {
  currentBreakdown: Record<string, number> | null;
  recentBreakdowns: Array<{
    step: number;
    action: string;
    breakdown: Record<string, number>;
    total: number;
  }>;
  currentStep: number;
}

// Friendly labels for reward types
const REWARD_LABELS: Record<string, { label: string; icon: string; description: string }> = {
  enemy_defeated: {
    label: 'Enemy Defeated',
    icon: '⚔️',
    description: 'Reward for destroying an enemy',
  },
  enemy_reached_base: {
    label: 'Enemy Reached Base',
    icon: '💔',
    description: 'Penalty when enemy reaches your base',
  },
  tower_built: {
    label: 'Tower Built',
    icon: '🏗️',
    description: 'Cost/reward for building a tower',
  },
  gold_saved: {
    label: 'Gold Saved',
    icon: '💰',
    description: 'Bonus for having gold reserves',
  },
  wave_completed: {
    label: 'Wave Completed',
    icon: '🌊',
    description: 'Bonus for surviving a wave',
  },
  game_won: {
    label: 'Game Won',
    icon: '🏆',
    description: 'Big bonus for winning the game',
  },
  game_lost: {
    label: 'Game Lost',
    icon: '💀',
    description: 'Penalty for losing the game',
  },
};

export const RewardBreakdown = ({
  currentBreakdown,
  recentBreakdowns,
  currentStep,
}: RewardBreakdownProps) => {
  // Calculate totals for current breakdown
  const currentTotal = useMemo(() => {
    if (!currentBreakdown) return 0;
    return Object.values(currentBreakdown).reduce((sum, val) => sum + val, 0);
  }, [currentBreakdown]);

  // Find non-zero rewards to highlight
  const activeRewards = useMemo(() => {
    if (!currentBreakdown) return [];
    return Object.entries(currentBreakdown)
      .filter(([_, value]) => value !== 0)
      .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]));
  }, [currentBreakdown]);

  // Calculate cumulative stats from recent breakdowns
  const cumulativeStats = useMemo(() => {
    const stats: Record<string, number> = {};
    recentBreakdowns.forEach(({ breakdown }) => {
      Object.entries(breakdown).forEach(([key, value]) => {
        stats[key] = (stats[key] || 0) + value;
      });
    });
    return stats;
  }, [recentBreakdowns]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-xl font-bold text-gray-100 flex items-center gap-2">
          <span className="text-2xl">🎯</span> Reward Breakdown
        </h3>
        <span className="font-mono text-xs text-gray-400 bg-black/20 px-2 py-1 rounded border border-white/5">
          Step {currentStep}
        </span>
      </div>

      {!currentBreakdown ? (
        <div className="flex flex-col items-center justify-center flex-grow text-gray-400 border border-dashed border-gray-700 rounded-lg bg-black/20">
          <div className="text-4xl mb-2 opacity-50 animate-pulse">⏳</div>
          <p className="font-medium">Waiting for training...</p>
          <p className="text-xs opacity-60 mt-1">Watch how your rewards affect decisions!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 h-full overflow-hidden">
          {/* Left: Current Step Breakdown */}
          <div className="flex flex-col bg-black/20 rounded-lg p-3 border border-white/5">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 border-b border-white/5 pb-1">
              This Step
            </h4>

            <div className="flex-grow overflow-y-auto custom-scrollbar space-y-2">
              {activeRewards.length === 0 ? (
                <div className="text-center py-4 text-gray-500 text-sm italic">
                  No rewards triggered
                </div>
              ) : (
                activeRewards.map(([key, value]) => {
                  const info = REWARD_LABELS[key] || { label: key, icon: '📦', description: '' };
                  return (
                    <div
                      key={key}
                      className={`flex items-center justify-between p-2 rounded border ${value >= 0
                          ? 'bg-neon-green/5 border-neon-green/20'
                          : 'bg-neon-red/5 border-neon-red/20'
                        }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{info.icon}</span>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-gray-200">{info.label}</span>
                          <span className="text-[10px] text-gray-500">{info.description}</span>
                        </div>
                      </div>
                      <span className={`font-mono font-bold ${value >= 0 ? 'text-neon-green' : 'text-neon-red'}`}>
                        {value >= 0 ? '+' : ''}{value.toFixed(1)}
                      </span>
                    </div>
                  );
                })
              )}
            </div>

            <div className={`mt-2 pt-2 border-t border-white/10 flex justify-between items-center ${currentTotal >= 0 ? 'text-neon-green' : 'text-neon-red'
              }`}>
              <span className="font-bold text-sm">Total Reward:</span>
              <span className="font-mono font-bold text-lg">
                {currentTotal >= 0 ? '+' : ''}{currentTotal.toFixed(1)}
              </span>
            </div>
          </div>

          {/* Right: Recent Actions & Cumulative */}
          <div className="flex flex-col gap-3 overflow-hidden">
            {/* Recent Actions Feed */}
            <div className="flex-grow flex flex-col bg-black/20 rounded-lg p-3 border border-white/5 overflow-hidden">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 border-b border-white/5 pb-1">
                Recent Actions
              </h4>
              <div className="flex-grow overflow-y-auto custom-scrollbar space-y-1">
                {recentBreakdowns.slice().reverse().map(({ step, action, total }, idx) => (
                  <div
                    key={step}
                    className={`flex justify-between items-center p-1.5 rounded text-xs ${idx === 0 ? 'bg-white/10 border border-white/10' : 'hover:bg-white/5'
                      }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-gray-500">#{step}</span>
                      <span className="font-mono text-neon-blue">{action}</span>
                    </div>
                    <span className={`font-mono font-bold ${total >= 0 ? 'text-neon-green' : 'text-neon-red'}`}>
                      {total >= 0 ? '+' : ''}{total.toFixed(1)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Cumulative Summary */}
            <div className="h-1/3 bg-black/20 rounded-lg p-3 border border-white/5 overflow-y-auto custom-scrollbar">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 border-b border-white/5 pb-1">
                Episode Summary
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(cumulativeStats)
                  .filter(([_, value]) => value !== 0)
                  .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
                  .map(([key, value]) => {
                    const info = REWARD_LABELS[key] || { label: key, icon: '📦', description: '' };
                    return (
                      <div key={key} className="flex justify-between items-center text-xs">
                        <span className="text-gray-400 flex items-center gap-1">
                          <span>{info.icon}</span> {info.label}
                        </span>
                        <span className={`font-mono ${value >= 0 ? 'text-neon-green' : 'text-neon-red'}`}>
                          {value >= 0 ? '+' : ''}{value.toFixed(0)}
                        </span>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
