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

// Tower colors by type - Neon Palette
const TOWER_COLORS: Record<string, { fill: string; range: string; glow: string }> = {
  archer: { fill: '#06b6d4', range: 'rgba(6, 182, 212, 0.1)', glow: '#06b6d4' },   // Cyan (Neon Blue)
  cannon: { fill: '#f43f5e', range: 'rgba(244, 63, 94, 0.1)', glow: '#f43f5e' },    // Rose (Neon Red)
  slow: { fill: '#8b5cf6', range: 'rgba(139, 92, 246, 0.1)', glow: '#8b5cf6' },     // Violet (Neon Purple)
};

// Enemy colors by type
const ENEMY_COLORS: Record<string, string> = {
  normal: '#f43f5e',   // Neon Red
  fast: '#f59e0b',     // Neon Yellow
  tanky: '#94a3b8',    // Slate Gray
  boss: '#ef4444',     // Bright Red
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

    // Draw grid with cyber look
    ctx.strokeStyle = '#334155'; // cyber-gray
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

    // Draw path with glow
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#f59e0b';
    ctx.fillStyle = 'rgba(245, 158, 11, 0.15)'; // Neon Yellow transparent
    ctx.fillRect(0, PATH_ROW * cellSize, width, cellSize);
    ctx.shadowBlur = 0;

    // Draw spawn and base
    ctx.font = `bold ${cellSize * 0.5}px "JetBrains Mono"`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Spawn
    ctx.fillStyle = '#10b981'; // Neon Green
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#10b981';
    ctx.fillText('START', cellSize / 2, (PATH_ROW + 0.5) * cellSize);

    // Base
    ctx.fillStyle = '#06b6d4'; // Neon Blue
    ctx.shadowColor = '#06b6d4';
    ctx.fillText('BASE', (GRID_SIZE - 0.5) * cellSize, (PATH_ROW + 0.5) * cellSize);
    ctx.shadowBlur = 0;

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
        ctx.strokeStyle = colors.range.replace('0.1', '0.3');
        ctx.fillStyle = colors.range;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(centerX, centerY, range * cellSize, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Draw tower based on type
        ctx.fillStyle = colors.fill;
        ctx.shadowBlur = 15;
        ctx.shadowColor = colors.glow;

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
          ctx.fillRect(centerX - size / 2, centerY - size / 2, size, size);
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
        ctx.shadowBlur = 0;

        // Draw upgrade level indicators (stars)
        if (level > 1) {
          ctx.fillStyle = '#f59e0b'; // Neon Yellow
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

        // Slow effect indicator (purple ring)
        if (isSlowed) {
          ctx.strokeStyle = '#8b5cf6';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(centerX, centerY, cellSize * (size + 0.08), 0, Math.PI * 2);
          ctx.stroke();
        }

        // Enemy shape based on type
        ctx.fillStyle = color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = color;

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
          ctx.fillStyle = '#f59e0b';
          ctx.font = `${cellSize * 0.25}px Arial`;
          ctx.fillText('👑', centerX, centerY - cellSize * 0.45);
        } else if (enemyType === 'tanky') {
          // Square for tanky
          const squareSize = cellSize * size * 1.5;
          ctx.fillRect(centerX - squareSize / 2, centerY - squareSize / 2, squareSize, squareSize);
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
        ctx.shadowBlur = 0;

        // HP bar
        const hpPercent = enemy.hp / enemy.max_hp;
        const barWidth = cellSize * 0.6;
        const barHeight = 4;
        const barX = centerX - barWidth / 2;
        const barY = centerY - cellSize * 0.5;

        ctx.fillStyle = '#334155';
        ctx.fillRect(barX, barY, barWidth, barHeight);

        ctx.fillStyle = hpPercent > 0.5 ? '#10b981' : hpPercent > 0.25 ? '#f59e0b' : '#ef4444';
        ctx.fillRect(barX, barY, barWidth * hpPercent, barHeight);
      });
    }
  }, [gameState, width, height]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-100 flex items-center gap-2">
          <span className="text-2xl">📺</span> Game View
        </h3>
        {gameState && (
          <div className="flex gap-4 text-sm font-mono">
            <span className="flex items-center gap-1 text-neon-red">
              ❤️ {gameState.lives}
            </span>
            <span className="flex items-center gap-1 text-neon-yellow">
              💰 {gameState.gold}
            </span>
            <span className="flex items-center gap-1 text-neon-blue">
              🌊 {gameState.current_wave}/{gameState.total_waves}
            </span>
          </div>
        )}
      </div>

      <div className="relative flex-grow flex items-center justify-center bg-cyber-dark/50 rounded-lg border border-white/5 overflow-hidden">
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          className="max-w-full max-h-full object-contain"
        />

        {gameState?.game_over && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-10">
            <div className={`text-center p-8 rounded-2xl border-2 ${gameState.victory ? 'border-neon-green bg-neon-green/10' : 'border-neon-red bg-neon-red/10'
              }`}>
              <h2 className={`text-4xl font-bold mb-2 ${gameState.victory ? 'text-neon-green' : 'text-neon-red'
                }`}>
                {gameState.victory ? '🎉 VICTORY!' : '💔 DEFEAT'}
              </h2>
              <p className="text-gray-300 font-mono">
                {gameState.victory
                  ? 'All waves cleared!'
                  : `Base destroyed on wave ${gameState.current_wave}/${gameState.total_waves}`}
              </p>
              <p className="text-gray-500 text-sm mt-2 font-mono">
                {gameState.victory
                  ? `💰 ${gameState.gold} gold remaining`
                  : `❤️ ${gameState.lives} lives | 💰 ${gameState.gold} gold`}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-4 grid grid-cols-2 gap-4 text-xs text-gray-400">
        <div className="flex flex-wrap gap-3 items-center">
          <span className="font-bold text-gray-300">TOWERS:</span>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-neon-blue shadow-[0_0_5px_#06b6d4]"></span> Archer
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-sm bg-neon-red shadow-[0_0_5px_#f43f5e]"></span> Cannon
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rotate-45 bg-neon-purple shadow-[0_0_5px_#8b5cf6]"></span> Slow
          </div>
        </div>
        <div className="flex flex-wrap gap-3 items-center justify-end">
          <span className="font-bold text-gray-300">ENEMIES:</span>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-neon-red"></span> Normal
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-neon-yellow"></span> Fast
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-sm bg-slate-400"></span> Tank
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-red-600 border border-white"></span> Boss
          </div>
        </div>
      </div>
    </div>
  );
};
