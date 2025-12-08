/**
 * Learning Curve Component - Phase 3
 * Visualizes episode rewards over training time
 * Helps students understand how the AI improves (or doesn't) based on their reward design
 *
 * Visual design:
 * - Cyberpunk aesthetic with Chart.js
 * - Neon colors for data lines
 * - Glassmorphism stats panels
 */

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import './LearningCurve.css';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface LearningCurveProps {
  episodeRewards: number[];
  episodeVictories?: boolean[];
  isTraining?: boolean;
}

export const LearningCurve = ({
  episodeRewards,
  episodeVictories = [],
  isTraining = false
}: LearningCurveProps) => {
  // Calculate moving average for smoother visualization
  const calculateMovingAverage = (data: number[], windowSize: number = 10): number[] => {
    const result: number[] = [];
    for (let i = 0; i < data.length; i++) {
      const start = Math.max(0, i - windowSize + 1);
      const window = data.slice(start, i + 1);
      const avg = window.reduce((sum, val) => sum + val, 0) / window.length;
      result.push(avg);
    }
    return result;
  };

  const movingAverage = calculateMovingAverage(episodeRewards);

  // Calculate statistics
  const stats = {
    totalEpisodes: episodeRewards.length,
    avgReward: episodeRewards.length > 0
      ? episodeRewards.reduce((a, b) => a + b, 0) / episodeRewards.length
      : 0,
    bestReward: episodeRewards.length > 0 ? Math.max(...episodeRewards) : 0,
    worstReward: episodeRewards.length > 0 ? Math.min(...episodeRewards) : 0,
    winRate: episodeVictories.length > 0
      ? (episodeVictories.filter(v => v).length / episodeVictories.length) * 100
      : 0,
    recentAvg: episodeRewards.length >= 10
      ? episodeRewards.slice(-10).reduce((a, b) => a + b, 0) / 10
      : (episodeRewards.length > 0 ? episodeRewards.reduce((a, b) => a + b, 0) / episodeRewards.length : 0),
  };

  // Determine if the agent is improving
  const isImproving = episodeRewards.length >= 20 &&
    movingAverage[movingAverage.length - 1] > movingAverage[Math.floor(movingAverage.length / 2)];

  const data = {
    labels: episodeRewards.map((_, i) => `${i + 1}`),
    datasets: [
      {
        label: 'Episode Reward',
        data: episodeRewards,
        borderColor: 'rgba(6, 182, 212, 0.4)', // Neon Blue low opacity
        backgroundColor: 'rgba(6, 182, 212, 0.05)',
        pointRadius: episodeRewards.length > 50 ? 0 : 2,
        pointHoverRadius: 4,
        borderWidth: 1,
        tension: 0.1,
        fill: true,
      },
      {
        label: 'Moving Average (10 eps)',
        data: movingAverage,
        borderColor: '#f59e0b', // Neon Yellow
        backgroundColor: 'transparent',
        pointRadius: 0,
        borderWidth: 2,
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#9ca3af',
          font: { family: 'JetBrains Mono', size: 10 },
          usePointStyle: true,
          boxWidth: 6,
        },
      },
      title: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleColor: '#f3f4f6',
        bodyColor: '#e5e7eb',
        borderColor: 'rgba(6, 182, 212, 0.3)',
        borderWidth: 1,
        padding: 10,
        titleFont: { family: 'JetBrains Mono' },
        bodyFont: { family: 'JetBrains Mono' },
        callbacks: {
          afterBody: (context: any) => {
            const idx = context[0]?.dataIndex;
            if (idx !== undefined && episodeVictories[idx] !== undefined) {
              return episodeVictories[idx] ? '✅ Victory' : '❌ Defeat';
            }
            return '';
          },
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Episode',
          color: '#64748b',
          font: { size: 10 },
        },
        ticks: {
          color: '#64748b',
          maxTicksLimit: 8,
          font: { family: 'JetBrains Mono', size: 9 },
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Reward',
          color: '#64748b',
          font: { size: 10 },
        },
        ticks: {
          color: '#64748b',
          font: { family: 'JetBrains Mono', size: 9 },
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
        },
      },
    },
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-100 flex items-center gap-2">
          <span className="text-2xl">📈</span> Learning Curve
        </h3>
        {isTraining && (
          <span className="px-2 py-0.5 bg-neon-blue/20 text-neon-blue border border-neon-blue/50 rounded text-xs animate-pulse">
            Training...
          </span>
        )}
      </div>

      {episodeRewards.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-grow text-gray-400 border border-dashed border-gray-700 rounded-lg bg-black/20">
          <div className="text-4xl mb-2 opacity-50">📊</div>
          <p className="font-medium">No training data yet</p>
          <p className="text-xs opacity-60 mt-1">Start training to see progress!</p>
        </div>
      ) : (
        <>
          <div className="flex-grow min-h-[200px] mb-4 bg-black/20 rounded-lg p-2 border border-white/5">
            <Line data={data} options={options} />
          </div>

          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="bg-white/5 rounded p-2 border border-white/5">
              <span className="text-xs text-gray-400 block uppercase tracking-wider">Episodes</span>
              <span className="text-lg font-mono font-bold text-white">{stats.totalEpisodes}</span>
            </div>
            <div className="bg-white/5 rounded p-2 border border-white/5">
              <span className="text-xs text-gray-400 block uppercase tracking-wider">Win Rate</span>
              <span className={`text-lg font-mono font-bold ${stats.winRate >= 50 ? 'text-neon-green' : 'text-neon-red'}`}>
                {stats.winRate.toFixed(1)}%
              </span>
            </div>
            <div className="bg-white/5 rounded p-2 border border-white/5">
              <span className="text-xs text-gray-400 block uppercase tracking-wider">Avg Reward</span>
              <span className={`text-lg font-mono font-bold ${stats.avgReward >= 0 ? 'text-neon-green' : 'text-neon-red'}`}>
                {stats.avgReward.toFixed(1)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="bg-white/5 rounded p-2 border border-white/5">
              <span className="text-xs text-gray-400 block uppercase tracking-wider">Best</span>
              <span className="text-sm font-mono font-bold text-neon-green">{stats.bestReward.toFixed(1)}</span>
            </div>
            <div className="bg-white/5 rounded p-2 border border-white/5">
              <span className="text-xs text-gray-400 block uppercase tracking-wider">Worst</span>
              <span className="text-sm font-mono font-bold text-neon-red">{stats.worstReward.toFixed(1)}</span>
            </div>
            <div className="bg-white/5 rounded p-2 border border-white/5">
              <span className="text-xs text-gray-400 block uppercase tracking-wider">Recent (10)</span>
              <span className={`text-sm font-mono font-bold ${stats.recentAvg >= stats.avgReward ? 'text-neon-green' : 'text-neon-red'}`}>
                {stats.recentAvg.toFixed(1)}
              </span>
            </div>
          </div>

          {episodeRewards.length >= 20 && (
            <div className={`mt-4 p-3 rounded border text-sm flex items-start gap-2 ${isImproving
                ? 'bg-neon-green/10 border-neon-green/30 text-neon-green'
                : 'bg-neon-yellow/10 border-neon-yellow/30 text-neon-yellow'
              }`}>
              <span className="text-lg">{isImproving ? '📈' : '🤔'}</span>
              <div>
                <strong className="block mb-0.5">{isImproving ? 'Improving!' : 'Stuck?'}</strong>
                <span className="opacity-80 text-xs">
                  {isImproving
                    ? 'The moving average is trending upward. Good job!'
                    : 'Learning seems stuck. Try adjusting rewards to give clearer feedback.'}
                </span>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
