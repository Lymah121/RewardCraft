/**
 * Q-Table Heatmap Visualization - Phase 3
 * THE MOST IMPORTANT COMPONENT - Shows AI's learning in real-time
 *
 * Visual design:
 * - Cyberpunk aesthetic with glassmorphism
 * - Neon color coding for Q-values
 * - Smooth transitions and hover effects
 */

import { useEffect, useState } from 'react';
import type { QTableData } from '../types';
import './QTableHeatmap.css';

interface QTableHeatmapProps {
  qTableData: QTableData | null;
  currentState?: string;
  currentAction?: string;
  showOnlyVisited?: boolean;
}

export const QTableHeatmap = ({
  qTableData,
  currentState,
  currentAction,
  showOnlyVisited = true,
}: QTableHeatmapProps) => {
  const [hoveredCell, setHoveredCell] = useState<{ state: string; action: string } | null>(null);
  const [animatingCells, setAnimatingCells] = useState<Set<string>>(new Set());

  // Animate Q-value updates
  useEffect(() => {
    if (currentState && currentAction) {
      const cellKey = `${currentState}-${currentAction}`;
      setAnimatingCells((prev) => new Set(prev).add(cellKey));

      // Remove animation after 500ms
      const timeout = setTimeout(() => {
        setAnimatingCells((prev) => {
          const next = new Set(prev);
          next.delete(cellKey);
          return next;
        });
      }, 500);

      return () => clearTimeout(timeout);
    }
  }, [currentState, currentAction]);

  if (!qTableData) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400">
        <div className="text-4xl mb-4 animate-pulse">🧠</div>
        <h3 className="text-xl font-bold mb-2">AI Brain Offline</h3>
        <p className="text-sm opacity-70">Initialize the AI to visualize the Q-Table</p>
      </div>
    );
  }

  const { states, actions, q_values, state_labels, statistics } = qTableData;

  // Filter to only visited states if enabled
  const displayStates = showOnlyVisited && states.length > 0 ? states : states;

  // Get Q-value color based on value - Neon Palette
  const getQColor = (qValue: number): string => {
    if (qValue < -5) return 'rgba(239, 68, 68, 0.2)'; // Red-500 low opacity
    if (qValue < 0) return 'rgba(248, 113, 113, 0.2)'; // Red-400 low opacity
    if (qValue < 5) return 'rgba(30, 41, 59, 0.5)';   // Slate-800 (Neutral)
    if (qValue < 10) return 'rgba(52, 211, 153, 0.2)'; // Emerald-400 low opacity
    return 'rgba(16, 185, 129, 0.3)'; // Emerald-500 higher opacity
  };

  const getBorderColor = (qValue: number): string => {
    if (qValue < -5) return '#ef4444'; // Red-500
    if (qValue < 0) return '#f87171'; // Red-400
    if (qValue < 5) return 'transparent';
    if (qValue < 10) return '#34d399'; // Emerald-400
    return '#10b981'; // Emerald-500
  };

  if (displayStates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400">
        <div className="text-4xl mb-4">🌑</div>
        <h3 className="text-xl font-bold mb-2">Tabula Rasa</h3>
        <p className="text-sm opacity-70">No experiences yet. Start training!</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-4 px-2">
        <h3 className="text-xl font-bold text-gray-100 flex items-center gap-2">
          <span className="text-2xl">🧠</span> AI Brain View
        </h3>
        <div className="flex gap-4 text-xs font-mono text-gray-400 bg-black/20 px-3 py-1 rounded-full border border-white/5">
          <span>States: <span className="text-neon-blue">{statistics.total_states}</span></span>
          <span>Steps: <span className="text-neon-purple">{statistics.total_steps}</span></span>
          <span>Exploration: <span className="text-neon-yellow">{(statistics.epsilon * 100).toFixed(0)}%</span></span>
        </div>
      </div>

      <div className="flex gap-2 mb-4 px-2 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-red-500/20 border border-red-500"></div>
          <span className="text-gray-400">Bad</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-slate-800 border border-slate-700"></div>
          <span className="text-gray-400">Neutral</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-emerald-500/20 border border-emerald-500"></div>
          <span className="text-gray-400">Good</span>
        </div>
      </div>

      <div className="flex-grow overflow-auto custom-scrollbar rounded-lg border border-white/5 bg-black/20">
        <table className="w-full border-collapse text-xs">
          <thead className="sticky top-0 z-10 bg-cyber-dark shadow-lg">
            <tr>
              <th className="p-3 text-left font-mono text-gray-400 border-b border-white/10 min-w-[150px]">
                State / Action
              </th>
              {actions.map((action) => (
                <th key={action} className="p-3 text-center font-mono text-gray-400 border-b border-white/10 min-w-[80px]">
                  <div className="flex flex-col items-center gap-1">
                    {action.includes('BUILD') && <span className="text-lg">🏗️</span>}
                    {action.includes('UPGRADE') && <span className="text-lg">⬆️</span>}
                    {action.includes('SELL') && <span className="text-lg">💰</span>}
                    {action.includes('SAVE') && <span className="text-lg">🏦</span>}
                    <span className="text-[10px] uppercase tracking-wider">
                      {action.replace('BUILD_', '').replace('UPGRADE_', '').replace('SELL_', '').replace('_', ' ')}
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayStates.map((state, stateIdx) => {
              const stateLabel = state_labels[state] || state;
              const isCurrentState = currentState === state;

              return (
                <tr key={state} className={`transition-colors ${isCurrentState ? 'bg-white/5' : 'hover:bg-white/5'}`}>
                  <td className="p-3 font-mono text-gray-300 border-b border-white/5 border-r border-white/5">
                    <div className="flex items-center gap-2">
                      {isCurrentState && <span className="text-neon-yellow animate-pulse">▶</span>}
                      <span className={isCurrentState ? 'text-neon-blue font-bold' : ''}>
                        {stateLabel}
                      </span>
                    </div>
                  </td>
                  {actions.map((action, actionIdx) => {
                    const qValue = q_values[stateIdx]?.[actionIdx] ?? 0;
                    const cellKey = `${state}-${action}`;
                    const isCurrentCell = currentState === state && currentAction === action;
                    const isAnimating = animatingCells.has(cellKey);

                    return (
                      <td
                        key={`${state}-${action}`}
                        className={`p-1 border-b border-white/5 relative transition-all duration-300 ${isAnimating ? 'scale-95 brightness-150' : ''
                          }`}
                        onMouseEnter={() => setHoveredCell({ state, action })}
                        onMouseLeave={() => setHoveredCell(null)}
                      >
                        <div
                          className={`
                            h-full w-full p-2 rounded flex items-center justify-center font-mono
                            transition-all duration-300 border
                            ${isCurrentCell ? 'ring-2 ring-neon-yellow shadow-[0_0_10px_#f59e0b] z-10' : ''}
                          `}
                          style={{
                            backgroundColor: getQColor(qValue),
                            borderColor: getBorderColor(qValue),
                          }}
                        >
                          <span className={`
                            ${Math.abs(qValue) > 5 ? 'font-bold' : 'opacity-70'}
                            ${qValue > 0 ? 'text-emerald-300' : qValue < 0 ? 'text-red-300' : 'text-gray-500'}
                          `}>
                            {qValue.toFixed(1)}
                          </span>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {hoveredCell && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-cyber-dark/95 border border-neon-blue/30 p-3 rounded-lg shadow-xl z-50 pointer-events-none backdrop-blur-md min-w-[300px]">
          <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">State Details</div>
          <div className="font-mono text-neon-blue mb-2">{state_labels[hoveredCell.state]}</div>
          <div className="flex justify-between items-center border-t border-white/10 pt-2">
            <span className="font-mono text-gray-300">{hoveredCell.action}</span>
            <span className="font-mono font-bold text-xl text-white">
              {q_values[states.indexOf(hoveredCell.state)]?.[actions.indexOf(hoveredCell.action)]?.toFixed(2)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
