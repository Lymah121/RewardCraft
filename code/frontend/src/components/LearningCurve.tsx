/**
 * Learning Curve Component
 * Visualizes episode rewards over training time
 * Helps students understand how the AI improves (or doesn't) based on their reward design
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
        borderColor: 'rgba(96, 165, 250, 0.6)',
        backgroundColor: 'rgba(96, 165, 250, 0.1)',
        pointRadius: episodeRewards.length > 50 ? 0 : 3,
        pointHoverRadius: 5,
        borderWidth: 1,
        tension: 0.1,
      },
      {
        label: 'Moving Average (10 eps)',
        data: movingAverage,
        borderColor: '#f59e0b',
        backgroundColor: 'transparent',
        pointRadius: 0,
        borderWidth: 2,
        tension: 0.3,
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
          color: '#e5e7eb',
          font: { size: 11 },
        },
      },
      title: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.9)',
        titleColor: '#f3f4f6',
        bodyColor: '#e5e7eb',
        borderColor: '#4b5563',
        borderWidth: 1,
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
          color: '#9ca3af',
        },
        ticks: {
          color: '#9ca3af',
          maxTicksLimit: 10,
        },
        grid: {
          color: 'rgba(75, 85, 99, 0.3)',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Reward',
          color: '#9ca3af',
        },
        ticks: {
          color: '#9ca3af',
        },
        grid: {
          color: 'rgba(75, 85, 99, 0.3)',
        },
      },
    },
  };

  return (
    <div className="learning-curve">
      <div className="learning-curve-header">
        <h3>📈 Learning Curve</h3>
        {isTraining && <span className="training-badge">Training...</span>}
      </div>

      {episodeRewards.length === 0 ? (
        <div className="no-data">
          <p>No training data yet</p>
          <p className="hint">Start training to see the AI's learning progress!</p>
        </div>
      ) : (
        <>
          <div className="chart-container">
            <Line data={data} options={options} />
          </div>

          <div className="learning-stats">
            <div className="stat-row">
              <div className="stat-box">
                <span className="stat-label">Episodes</span>
                <span className="stat-value">{stats.totalEpisodes}</span>
              </div>
              <div className="stat-box">
                <span className="stat-label">Win Rate</span>
                <span className={`stat-value ${stats.winRate >= 50 ? 'positive' : 'negative'}`}>
                  {stats.winRate.toFixed(1)}%
                </span>
              </div>
              <div className="stat-box">
                <span className="stat-label">Avg Reward</span>
                <span className={`stat-value ${stats.avgReward >= 0 ? 'positive' : 'negative'}`}>
                  {stats.avgReward.toFixed(1)}
                </span>
              </div>
            </div>
            <div className="stat-row">
              <div className="stat-box">
                <span className="stat-label">Best</span>
                <span className="stat-value positive">{stats.bestReward.toFixed(1)}</span>
              </div>
              <div className="stat-box">
                <span className="stat-label">Worst</span>
                <span className="stat-value negative">{stats.worstReward.toFixed(1)}</span>
              </div>
              <div className="stat-box">
                <span className="stat-label">Recent (10)</span>
                <span className={`stat-value ${stats.recentAvg >= stats.avgReward ? 'positive' : 'negative'}`}>
                  {stats.recentAvg.toFixed(1)}
                </span>
              </div>
            </div>
          </div>

          {episodeRewards.length >= 20 && (
            <div className={`learning-insight ${isImproving ? 'improving' : 'stagnant'}`}>
              {isImproving ? (
                <p>📈 <strong>The AI is improving!</strong> The moving average is trending upward.</p>
              ) : (
                <p>🤔 <strong>Learning seems stuck.</strong> Consider adjusting your reward function to give clearer feedback.</p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};
