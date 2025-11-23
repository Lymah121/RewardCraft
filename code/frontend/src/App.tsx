/**
 * RewardCraft - Main Application
 * Educational AI tool for teaching Reinforcement Learning through tower defense
 */

import { useState, useEffect, useCallback } from 'react';
import { GameCanvas } from './components/GameCanvas';
import { QTableHeatmap } from './components/QTableHeatmap';
import { RewardDesigner } from './components/RewardDesigner';
import { useWebSocket } from './hooks/useWebSocket';
import type {
  GameState,
  QTableData,
  RewardConfig,
  TrainingStatus,
  WSMessage,
  WSStep,
  WSEpisodeEnd,
} from './types';
import './App.css';

// Connect directly to backend (bypass Vite proxy for WebSocket)
const WS_URL = 'ws://localhost:8000/ws/training';

function App() {
  // State
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [qTableData, setQTableData] = useState<QTableData | null>(null);
  const [rewardConfig, setRewardConfig] = useState<RewardConfig>({
    enemy_defeated: 10,
    enemy_reached_base: -50,
    tower_built: -2,
    gold_saved: 1,
    wave_completed: 20,
  });
  const [trainingStatus, setTrainingStatus] = useState<TrainingStatus | null>(null);
  const [currentState, setCurrentState] = useState<string | undefined>();
  const [currentAction, setCurrentAction] = useState<string | undefined>();
  const [isInitialized, setIsInitialized] = useState(false);

  // Episode stats
  const [episodeRewards, setEpisodeRewards] = useState<number[]>([]);
  const [currentEpisodeReward, setCurrentEpisodeReward] = useState(0);

  // Handle WebSocket messages
  const handleMessage = useCallback((message: WSMessage) => {
    console.log('WebSocket message:', message.type);

    switch (message.type) {
      case 'training_started':
        console.log('Training started');
        setEpisodeRewards([]);
        setCurrentEpisodeReward(0);
        break;

      case 'episode_start':
        setGameState(message.game_state);
        setCurrentEpisodeReward(0);
        break;

      case 'step': {
        const stepMsg = message as WSStep;
        setGameState(stepMsg.game_state);
        setCurrentState(stepMsg.state);
        setCurrentAction(stepMsg.action);
        setCurrentEpisodeReward((prev) => prev + stepMsg.reward);
        break;
      }

      case 'episode_end': {
        const endMsg = message as WSEpisodeEnd;
        setEpisodeRewards((prev) => [...prev, endMsg.total_reward]);
        setGameState(endMsg.final_state);
        break;
      }

      case 'training_complete':
        console.log('Training complete!', message.summary);
        if (message.summary.q_table) {
          setQTableData(message.summary.q_table);
        }
        break;

      case 'status':
        setTrainingStatus(message.data);
        break;

      case 'error':
        console.error('WebSocket error:', message.message);
        break;
    }
  }, []);

  // WebSocket connection
  const { isConnected, startTraining, stopTraining, getStatus } = useWebSocket({
    url: WS_URL,
    onMessage: handleMessage,
    onConnect: () => console.log('Connected to training server'),
    onDisconnect: () => console.log('Disconnected from training server'),
  });

  // Initialize the backend
  const initialize = async () => {
    try {
      const response = await fetch('/api/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reward_config: rewardConfig }),
      });

      if (response.ok) {
        setIsInitialized(true);
        // Fetch Q-table
        await fetchQTable();
      }
    } catch (error) {
      console.error('Failed to initialize:', error);
    }
  };

  const fetchQTable = async () => {
    try {
      const response = await fetch('/api/ai/q-table');
      if (response.ok) {
        const data = await response.json();
        setQTableData(data);
      }
    } catch (error) {
      console.error('Failed to fetch Q-table:', error);
    }
  };

  // Handle reward config changes
  const handleRewardConfigChange = async (newConfig: RewardConfig) => {
    setRewardConfig(newConfig);

    try {
      await fetch('/api/ai/reward-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConfig),
      });
    } catch (error) {
      console.error('Failed to update reward config:', error);
    }
  };

  // Handle training start
  const handleStartTraining = () => {
    startTraining({
      num_episodes: 100,
      reward_config: rewardConfig,
      speed_multiplier: 2.0, // 2x speed for faster training
    });
  };

  // Initialize on mount
  useEffect(() => {
    initialize();
  }, []);

  // Periodically fetch Q-table during training
  useEffect(() => {
    if (!trainingStatus?.is_training) return;

    const interval = setInterval(() => {
      fetchQTable();
    }, 5000); // Every 5 seconds

    return () => clearInterval(interval);
  }, [trainingStatus?.is_training]);

  const isTraining = trainingStatus?.is_training || false;

  return (
    <div className="app">
      <header className="app-header">
        <h1>🎮 RewardCraft: Tower Defense AI Trainer</h1>
        <div className="connection-status">
          <span className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
            {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
          </span>
        </div>
      </header>

      <div className="app-layout">
        {/* Left panel - Game */}
        <div className="left-panel">
          <GameCanvas gameState={gameState} />

          {trainingStatus && (
            <div className="training-progress">
              <h3>📊 Training Progress</h3>
              <div className="progress-bar-container">
                <div
                  className="progress-bar"
                  style={{ width: `${trainingStatus.progress_percent}%` }}
                ></div>
              </div>
              <div className="progress-stats">
                <span>
                  Episode: {trainingStatus.current_episode} / {trainingStatus.total_episodes}
                </span>
                <span>{trainingStatus.progress_percent.toFixed(0)}%</span>
              </div>
              {trainingStatus.stats && (
                <div className="training-stats">
                  <div className="stat-item">
                    <span className="stat-label">Win Rate:</span>
                    <span className="stat-value">
                      {(trainingStatus.stats.win_rate * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Avg Reward:</span>
                    <span className="stat-value">
                      {trainingStatus.stats.avg_reward.toFixed(1)}
                    </span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">States Explored:</span>
                    <span className="stat-value">{trainingStatus.stats.total_states_explored}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right panel - AI Brain */}
        <div className="right-panel">
          <QTableHeatmap
            qTableData={qTableData}
            currentState={currentState}
            currentAction={currentAction}
          />
        </div>
      </div>

      {/* Bottom panel - Reward Designer */}
      <div className="bottom-panel">
        <RewardDesigner
          initialConfig={rewardConfig}
          onConfigChange={handleRewardConfigChange}
          disabled={isTraining}
        />

        <div className="training-controls">
          <button
            onClick={initialize}
            disabled={isTraining}
            className="button-secondary"
          >
            🔄 Reset AI
          </button>
          <button
            onClick={handleStartTraining}
            disabled={!isInitialized || isTraining || !isConnected}
            className="button-primary button-large"
          >
            {isTraining ? '⏸️ Training...' : '▶️ Start Training (100 episodes)'}
          </button>
          <button
            onClick={stopTraining}
            disabled={!isTraining}
            className="button-danger"
          >
            ⏹️ Stop Training
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
