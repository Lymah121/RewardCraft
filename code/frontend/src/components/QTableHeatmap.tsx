/**
 * Q-Table Heatmap Visualization
 * THE MOST IMPORTANT COMPONENT - Shows AI's learning in real-time
 *
 * Visual design from UI_MOCKUPS.md:
 * - States as rows, Actions as columns
 * - Color-coded Q-values (red=negative, yellow=neutral, green=positive)
 * - Current state/action highlighted with yellow border
 * - Q-values update with animation
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
      <div className="qtable-placeholder">
        <h3>Q-Table Heatmap</h3>
        <p>Initialize the AI to see the Q-table</p>
      </div>
    );
  }

  const { states, actions, q_values, state_labels, statistics } = qTableData;

  // Filter to only visited states if enabled
  const displayStates = showOnlyVisited && states.length > 0 ? states : states;

  // Get Q-value color based on value
  const getQColor = (qValue: number): string => {
    if (qValue < -5) return '#DC2626'; // Dark red
    if (qValue < 0) return '#F87171'; // Light red
    if (qValue < 5) return '#FCD34D'; // Yellow
    if (qValue < 10) return '#86EFAC'; // Light green
    return '#10B981'; // Green
  };

  // Get text color for contrast
  const getTextColor = (qValue: number): string => {
    return Math.abs(qValue) > 5 ? '#FFFFFF' : '#000000';
  };

  if (displayStates.length === 0) {
    return (
      <div className="qtable-empty">
        <h3>Q-Table Heatmap</h3>
        <p>No states visited yet. Start training to see Q-values!</p>
      </div>
    );
  }

  return (
    <div className="qtable-container">
      <div className="qtable-header">
        <h3>🧠 AI Brain View - Q-Table</h3>
        <div className="qtable-stats">
          <span>States: {statistics.total_states}</span>
          <span>Steps: {statistics.total_steps}</span>
          <span>Exploration: {(statistics.epsilon * 100).toFixed(0)}%</span>
        </div>
      </div>

      <div className="qtable-legend">
        <div className="legend-item">
          <div className="legend-color" style={{ background: '#DC2626' }}></div>
          <span>Very Bad</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ background: '#F87171' }}></div>
          <span>Bad</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ background: '#FCD34D' }}></div>
          <span>Neutral</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ background: '#86EFAC' }}></div>
          <span>Good</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ background: '#10B981' }}></div>
          <span>Very Good</span>
        </div>
      </div>

      <div className="qtable-scroll-container">
        <table className="qtable">
          <thead>
            <tr>
              <th className="qtable-corner">State / Action</th>
              {actions.map((action) => (
                <th key={action} className="qtable-action-header">
                  {action.replace('BUILD_', '').replace('_', ' ')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayStates.map((state, stateIdx) => {
              const stateLabel = state_labels[state] || state;

              return (
                <tr key={state}>
                  <td
                    className={`qtable-state-label ${currentState === state ? 'current-state' : ''}`}
                    title={stateLabel}
                  >
                    {stateLabel}
                  </td>
                  {actions.map((action, actionIdx) => {
                    const qValue = q_values[stateIdx]?.[actionIdx] ?? 0;
                    const cellKey = `${state}-${action}`;
                    const isCurrentCell = currentState === state && currentAction === action;
                    const isAnimating = animatingCells.has(cellKey);
                    const isHovered = hoveredCell?.state === state && hoveredCell?.action === action;

                    return (
                      <td
                        key={`${state}-${action}`}
                        className={`qtable-cell ${isCurrentCell ? 'current-cell' : ''} ${
                          isAnimating ? 'animating' : ''
                        }`}
                        style={{
                          backgroundColor: getQColor(qValue),
                          color: getTextColor(qValue),
                        }}
                        onMouseEnter={() => setHoveredCell({ state, action })}
                        onMouseLeave={() => setHoveredCell(null)}
                        title={`${stateLabel}\n${action}\nQ-value: ${qValue.toFixed(2)}`}
                      >
                        {qValue.toFixed(1)}
                        {isCurrentCell && <div className="current-indicator">⭐</div>}
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
        <div className="qtable-tooltip">
          <strong>State:</strong> {state_labels[hoveredCell.state]}
          <br />
          <strong>Action:</strong> {hoveredCell.action}
          <br />
          <strong>Q-value:</strong>{' '}
          {q_values[states.indexOf(hoveredCell.state)]?.[actions.indexOf(hoveredCell.action)]?.toFixed(
            2
          )}
        </div>
      )}

      {currentState && (
        <div className="current-decision">
          <p>
            📍 <strong>Current State:</strong> {state_labels[currentState] || currentState}
          </p>
          {currentAction && (
            <p>
              🎯 <strong>Action Taken:</strong> {currentAction}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
