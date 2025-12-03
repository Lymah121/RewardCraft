/**
 * Game Canvas Component - Phase 3
 * Visualizes the tower defense game in real-time
 * Enhanced for multiple tower types, enemy types, and upgrades
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

// Tower colors by type
const TOWER_COLORS: Record<string, { fill: string; range: string }> = {
  archer: { fill: '#60A5FA', range: 'rgba(96, 165, 250, 0.2)' },   // Blue
  cannon: { fill: '#F97316', range: 'rgba(249, 115, 22, 0.2)' },   // Orange
  slow: { fill: '#A855F7', range: 'rgba(168, 85, 247, 0.2)' },     // Purple
};

// Enemy colors by type
const ENEMY_COLORS: Record<string, string> = {
  normal: '#F87171',   // Red
  fast: '#FBBF24',     // Yellow
  tanky: '#6B7280',    // Gray
  boss: '#DC2626',     // Dark red
};

// Enemy sizes by type
const ENEMY_SIZES: Record<string, number> = {
  normal: 0.3,
  fast: 0.25,
  tanky: 0.4,
  boss: 0.5,
};

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
    ctx.lineWidth = 1;
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

    // Draw towers with type-specific visuals
    if (gameState.towers) {
      gameState.towers.forEach((tower) => {
        const x = tower.x ?? (tower.position ? tower.position[0] : 0);
        const y = tower.y ?? (tower.position ? tower.position[1] : 0);
        const centerX = (x + 0.5) * cellSize;
        const centerY = (y + 0.5) * cellSize;

        const towerType = tower.type || 'archer';
        const colors = TOWER_COLORS[towerType] || TOWER_COLORS.archer;
        const range = tower.range ?? 2;
        const level = tower.level ?? 1;

        // Tower range circle
        ctx.strokeStyle = colors.range;
        ctx.fillStyle = colors.range;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(centerX, centerY, range * cellSize, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Draw tower based on type
        ctx.fillStyle = colors.fill;

        if (towerType === 'archer') {
          // Triangle for archer
          ctx.beginPath();
          ctx.moveTo(centerX, centerY - cellSize * 0.3);
          ctx.lineTo(centerX - cellSize * 0.25, centerY + cellSize * 0.2);
          ctx.lineTo(centerX + cellSize * 0.25, centerY + cellSize * 0.2);
          ctx.closePath();
          ctx.fill();
        } else if (towerType === 'cannon') {
          // Square for cannon
          const size = cellSize * 0.35;
          ctx.fillRect(centerX - size/2, centerY - size/2, size, size);
        } else if (towerType === 'slow') {
          // Diamond for slow tower
          ctx.beginPath();
          ctx.moveTo(centerX, centerY - cellSize * 0.3);
          ctx.lineTo(centerX + cellSize * 0.25, centerY);
          ctx.lineTo(centerX, centerY + cellSize * 0.3);
          ctx.lineTo(centerX - cellSize * 0.25, centerY);
          ctx.closePath();
          ctx.fill();
        }

        // Draw upgrade level indicators (stars)
        if (level > 1) {
          ctx.fillStyle = '#FCD34D';
          ctx.font = `${cellSize * 0.2}px Arial`;
          const stars = '★'.repeat(level - 1);
          ctx.fillText(stars, centerX, centerY + cellSize * 0.35);
        }
      });
    }

    // Draw enemies with type-specific visuals
    if (gameState.enemies) {
      gameState.enemies.forEach((enemy) => {
        const x = enemy.x ?? (enemy.position ? enemy.position[0] : 0);
        const y = enemy.y ?? (enemy.position ? enemy.position[1] : 0);
        const centerX = (x + 0.5) * cellSize;
        const centerY = (y + 0.5) * cellSize;

        const enemyType = enemy.type || 'normal';
        const color = ENEMY_COLORS[enemyType] || ENEMY_COLORS.normal;
        const size = ENEMY_SIZES[enemyType] || 0.3;
        const isSlowed = enemy.is_slowed;

        // Slow effect indicator (blue ring)
        if (isSlowed) {
          ctx.strokeStyle = '#A855F7';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(centerX, centerY, cellSize * (size + 0.08), 0, Math.PI * 2);
          ctx.stroke();
        }

        // Enemy shape based on type
        ctx.fillStyle = color;

        if (enemyType === 'boss') {
          // Hexagon for boss
          ctx.beginPath();
          for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i - Math.PI / 6;
            const px = centerX + Math.cos(angle) * cellSize * size;
            const py = centerY + Math.sin(angle) * cellSize * size;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.closePath();
          ctx.fill();

          // Boss crown
          ctx.fillStyle = '#FCD34D';
          ctx.font = `${cellSize * 0.25}px Arial`;
          ctx.fillText('👑', centerX, centerY - cellSize * 0.45);
        } else if (enemyType === 'tanky') {
          // Square for tanky
          const squareSize = cellSize * size * 1.5;
          ctx.fillRect(centerX - squareSize/2, centerY - squareSize/2, squareSize, squareSize);
        } else if (enemyType === 'fast') {
          // Triangle pointing right for fast
          ctx.beginPath();
          ctx.moveTo(centerX + cellSize * size, centerY);
          ctx.lineTo(centerX - cellSize * size * 0.5, centerY - cellSize * size * 0.8);
          ctx.lineTo(centerX - cellSize * size * 0.5, centerY + cellSize * size * 0.8);
          ctx.closePath();
          ctx.fill();
        } else {
          // Circle for normal
          ctx.beginPath();
          ctx.arc(centerX, centerY, cellSize * size, 0, Math.PI * 2);
          ctx.fill();
        }

        // HP bar
        const hpPercent = enemy.hp / enemy.max_hp;
        const barWidth = cellSize * 0.6;
        const barHeight = 4;
        const barX = centerX - barWidth / 2;
        const barY = centerY - cellSize * 0.5;

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
        <span className="phase-tag">Phase 3</span>
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

      {/* Legend */}
      <div className="game-legend">
        <div className="legend-section">
          <span className="legend-title">Towers:</span>
          <span className="legend-item"><span className="legend-color" style={{background: '#60A5FA'}}></span>Archer</span>
          <span className="legend-item"><span className="legend-color" style={{background: '#F97316'}}></span>Cannon</span>
          <span className="legend-item"><span className="legend-color" style={{background: '#A855F7'}}></span>Slow</span>
        </div>
        <div className="legend-section">
          <span className="legend-title">Enemies:</span>
          <span className="legend-item"><span className="legend-color" style={{background: '#F87171'}}></span>Normal</span>
          <span className="legend-item"><span className="legend-color" style={{background: '#FBBF24'}}></span>Fast</span>
          <span className="legend-item"><span className="legend-color" style={{background: '#6B7280'}}></span>Tanky</span>
          <span className="legend-item"><span className="legend-color" style={{background: '#DC2626'}}></span>Boss</span>
        </div>
      </div>

      {gameState?.game_over && (
        <div className={`game-over-overlay ${gameState.victory ? 'victory' : 'defeat'}`}>
          <h2>{gameState.victory ? '🎉 Victory!' : '💔 Defeat'}</h2>
          <p>{gameState.victory ? 'All 5 waves completed!' : 'Out of lives'}</p>
        </div>
      )}
    </div>
  );
};
