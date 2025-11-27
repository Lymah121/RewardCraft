/**
 * Game Canvas Component
 * Visualizes the tower defense game in real-time
 */

import { useEffect, useRef } from 'react';
import type { GameState } from '../types';
import './GameCanvas.css';

interface GameCanvasProps {
  gameState: GameState | null;
  width?: number;
  height?: number;
}

const GRID_SIZE = 10;
const PATH_ROW = 5;

export const GameCanvas = ({ gameState, width = 600, height = 600 }: GameCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    const cellSize = width / GRID_SIZE;

    // Draw grid
    ctx.strokeStyle = '#4B5563';
    for (let x = 0; x <= GRID_SIZE; x++) {
      ctx.beginPath();
      ctx.moveTo(x * cellSize, 0);
      ctx.lineTo(x * cellSize, height);
      ctx.stroke();
    }
    for (let y = 0; y <= GRID_SIZE; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * cellSize);
      ctx.lineTo(width, y * cellSize);
      ctx.stroke();
    }

    // Draw path
    ctx.fillStyle = '#FDE68A';
    ctx.globalAlpha = 0.3;
    ctx.fillRect(0, PATH_ROW * cellSize, width, cellSize);
    ctx.globalAlpha = 1.0;

    // Draw spawn and base
    ctx.fillStyle = '#10B981';
    ctx.font = `${cellSize * 0.6}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('S', cellSize / 2, (PATH_ROW + 0.5) * cellSize);

    ctx.fillStyle = '#3B82F6';
    ctx.fillText('B', (GRID_SIZE - 0.5) * cellSize, (PATH_ROW + 0.5) * cellSize);

    if (!gameState) return;

    // Draw towers
    // Backend sends {x, y} not {position: [x, y]}
    if (gameState.towers) {
      gameState.towers.forEach((tower) => {
        const x = tower.x ?? (tower.position ? tower.position[0] : 0);
        const y = tower.y ?? (tower.position ? tower.position[1] : 0);
        const centerX = (x + 0.5) * cellSize;
        const centerY = (y + 0.5) * cellSize;

        // Tower range circle (default range is 2)
        const range = tower.range ?? 2;
        ctx.strokeStyle = 'rgba(96, 165, 250, 0.3)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(centerX, centerY, range * cellSize, 0, Math.PI * 2);
        ctx.stroke();

        // Tower triangle
        ctx.fillStyle = '#60A5FA';
        ctx.beginPath();
        ctx.moveTo(centerX, centerY - cellSize * 0.3);
        ctx.lineTo(centerX - cellSize * 0.25, centerY + cellSize * 0.2);
        ctx.lineTo(centerX + cellSize * 0.25, centerY + cellSize * 0.2);
        ctx.closePath();
        ctx.fill();
      });
    }

    // Draw enemies
    // Backend sends {x, y} not {position: [x, y]}
    if (gameState.enemies) {
      gameState.enemies.forEach((enemy) => {
        const x = enemy.x ?? (enemy.position ? enemy.position[0] : 0);
        const y = enemy.y ?? (enemy.position ? enemy.position[1] : 0);
        const centerX = (x + 0.5) * cellSize;
        const centerY = (y + 0.5) * cellSize;

        // Enemy circle
        ctx.fillStyle = '#F87171';
        ctx.beginPath();
        ctx.arc(centerX, centerY, cellSize * 0.3, 0, Math.PI * 2);
        ctx.fill();

        // HP bar
        const hpPercent = enemy.hp / enemy.max_hp;
        const barWidth = cellSize * 0.6;
        const barHeight = 4;
        const barX = centerX - barWidth / 2;
        const barY = centerY - cellSize * 0.4;

        ctx.fillStyle = '#4B5563';
        ctx.fillRect(barX, barY, barWidth, barHeight);

        ctx.fillStyle = hpPercent > 0.5 ? '#10B981' : hpPercent > 0.25 ? '#F59E0B' : '#EF4444';
        ctx.fillRect(barX, barY, barWidth * hpPercent, barHeight);
      });
    }
  }, [gameState, width, height]);

  return (
    <div className="game-canvas-container">
      <div className="game-canvas-header">
        <h3>🎮 Tower Defense Game</h3>
        {gameState && (
          <div className="game-stats">
            <span className="game-stat">
              <span className="stat-label">Lives:</span>
              <span className="stat-value">❤️ {gameState.lives}</span>
            </span>
            <span className="game-stat">
              <span className="stat-label">Gold:</span>
              <span className="stat-value">💰 {gameState.gold}</span>
            </span>
            <span className="game-stat">
              <span className="stat-label">Wave:</span>
              <span className="stat-value">
                {gameState.current_wave}/{gameState.total_waves}
              </span>
            </span>
          </div>
        )}
      </div>

      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="game-canvas"
      />

      {gameState?.game_over && (
        <div className={`game-over-overlay ${gameState.victory ? 'victory' : 'defeat'}`}>
          <h2>{gameState.victory ? '🎉 Victory!' : '💔 Defeat'}</h2>
          <p>{gameState.victory ? 'All waves completed!' : 'Out of lives'}</p>
        </div>
      )}
    </div>
  );
};
