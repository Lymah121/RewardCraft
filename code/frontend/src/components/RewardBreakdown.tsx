/**
 * Reward Breakdown Component
 * Shows detailed breakdown of how rewards are calculated each step
 * Helps students understand the cause-effect relationship in RL
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
    <div className="reward-breakdown">
      <div className="breakdown-header">
        <h3>🎯 Reward Breakdown</h3>
        <span className="step-indicator">Step {currentStep}</span>
      </div>

      {!currentBreakdown ? (
        <div className="no-breakdown">
          <p>Waiting for training to start...</p>
          <p className="hint">Watch how your reward function affects the AI's decisions!</p>
        </div>
      ) : (
        <>
          {/* Current Step Breakdown */}
          <div className="current-breakdown">
            <h4>This Step</h4>
            {activeRewards.length === 0 ? (
              <div className="no-rewards">
                <span className="muted">No rewards this step</span>
              </div>
            ) : (
              <div className="reward-list">
                {activeRewards.map(([key, value]) => {
                  const info = REWARD_LABELS[key] || { label: key, icon: '📦', description: '' };
                  return (
                    <div
                      key={key}
                      className={`reward-item ${value >= 0 ? 'positive' : 'negative'}`}
                    >
                      <div className="reward-icon">{info.icon}</div>
                      <div className="reward-info">
                        <span className="reward-label">{info.label}</span>
                        <span className="reward-desc">{info.description}</span>
                      </div>
                      <div className={`reward-value ${value >= 0 ? 'positive' : 'negative'}`}>
                        {value >= 0 ? '+' : ''}{value.toFixed(1)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className={`total-reward ${currentTotal >= 0 ? 'positive' : 'negative'}`}>
              <span>Total Reward:</span>
              <span className="total-value">
                {currentTotal >= 0 ? '+' : ''}{currentTotal.toFixed(1)}
              </span>
            </div>
          </div>

          {/* Cumulative Breakdown */}
          {recentBreakdowns.length > 0 && (
            <div className="cumulative-breakdown">
              <h4>Episode Summary (Last {recentBreakdowns.length} steps)</h4>
              <div className="cumulative-stats">
                {Object.entries(cumulativeStats)
                  .filter(([_, value]) => value !== 0)
                  .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
                  .map(([key, value]) => {
                    const info = REWARD_LABELS[key] || { label: key, icon: '📦', description: '' };
                    return (
                      <div key={key} className="cumulative-item">
                        <span className="cumulative-icon">{info.icon}</span>
                        <span className="cumulative-label">{info.label}</span>
                        <span className={`cumulative-value ${value >= 0 ? 'positive' : 'negative'}`}>
                          {value >= 0 ? '+' : ''}{value.toFixed(1)}
                        </span>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Recent Actions Feed */}
          {recentBreakdowns.length > 0 && (
            <div className="action-feed">
              <h4>Recent Actions</h4>
              <div className="feed-list">
                {recentBreakdowns.slice(-5).reverse().map(({ step, action, total }, idx) => (
                  <div key={step} className={`feed-item ${idx === 0 ? 'latest' : ''}`}>
                    <span className="feed-step">#{step}</span>
                    <span className="feed-action">{action}</span>
                    <span className={`feed-reward ${total >= 0 ? 'positive' : 'negative'}`}>
                      {total >= 0 ? '+' : ''}{total.toFixed(1)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
