/**
 * RewardCraft - Main Application (Phase 3)
 * Educational AI tool for teaching Reinforcement Learning through tower defense
 *
 * Phase 3 Features:
 * - Multiple tower types (Archer, Cannon, Slow)
 * - Different enemy types (Normal, Fast, Tanky, Boss)
 * - Tower upgrade system
 * - Enhanced reward function with type-specific bonuses
 * - Visual distinction for all tower/enemy types
 */

import { useState, useEffect, useCallback } from 'react';
import { GameCanvas } from './components/GameCanvas';
import { QTableHeatmap } from './components/QTableHeatmap';
import { RewardDesigner } from './components/RewardDesigner';
import { LearningCurve } from './components/LearningCurve';
import { TrainingControls, TrainingSettings } from './components/TrainingControls';
import { RewardBreakdown } from './components/RewardBreakdown';
import { AgentManager } from './components/AgentManager';
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
  // Core State
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

  // Episode tracking
  const [episodeRewards, setEpisodeRewards] = useState<number[]>([]);
  const [episodeVictories, setEpisodeVictories] = useState<boolean[]>([]);
  const [currentEpisodeReward, setCurrentEpisodeReward] = useState(0);
  const [currentEpisode, setCurrentEpisode] = useState(0);
  const [lastAction, setLastAction] = useState<string | null>(null);
  const [lastReward, setLastReward] = useState<number | null>(null);
  const [isTrainingActive, setIsTrainingActive] = useState(false);

  // Phase 2: Reward breakdown tracking
  const [currentBreakdown, setCurrentBreakdown] = useState<Record<string, number> | null>(null);
  const [recentBreakdowns, setRecentBreakdowns] = useState<Array<{
    step: number;
    action: string;
    breakdown: Record<string, number>;
    total: number;
  }>>([]);
  const [currentStep, setCurrentStep] = useState(0);

  // Phase 2: Training settings
  const [trainingSettings, setTrainingSettings] = useState<TrainingSettings>({
    numEpisodes: 100,
    speedMultiplier: 2.0,
    learningRate: 0.1,
    discountFactor: 0.95,
    epsilon: 1.0,
    epsilonDecay: 0.995,
  });

  // Handle WebSocket messages
  const handleMessage = useCallback((message: WSMessage) => {
    // Don't log game_tick to reduce console spam
    if (message.type !== 'game_tick') {
      console.log('WebSocket message:', message.type);
    }

    switch (message.type) {
      case 'training_started':
        console.log('Training started');
        setEpisodeRewards([]);
        setEpisodeVictories([]);
        setCurrentEpisodeReward(0);
        setRecentBreakdowns([]);
        setIsTrainingActive(true);
        break;

      case 'episode_start':
        setGameState(message.game_state);
        setCurrentEpisodeReward(0);
        setCurrentEpisode(message.episode);
        setLastAction(null);
        setLastReward(null);
        setCurrentStep(0);
        setRecentBreakdowns([]);
        break;

      case 'step': {
        const stepMsg = message as WSStep;
        setGameState(stepMsg.game_state);
        setCurrentState(stepMsg.state);
        setCurrentAction(stepMsg.action);
        setLastAction(stepMsg.action);
        setLastReward(stepMsg.reward);
        setCurrentEpisodeReward((prev) => prev + stepMsg.reward);
        setCurrentStep(stepMsg.step);

        // Track reward breakdown
        if (stepMsg.reward_breakdown) {
          setCurrentBreakdown(stepMsg.reward_breakdown);
          setRecentBreakdowns((prev) => [
            ...prev.slice(-20), // Keep last 20 steps
            {
              step: stepMsg.step,
              action: stepMsg.action,
              breakdown: stepMsg.reward_breakdown,
              total: stepMsg.reward,
            },
          ]);
        }
        break;
      }

      case 'game_tick':
        // Real-time game state update for visualization
        setGameState(message.game_state);
        break;

      case 'episode_end': {
        const endMsg = message as WSEpisodeEnd;
        setEpisodeRewards((prev) => [...prev, endMsg.total_reward]);
        setEpisodeVictories((prev) => [...prev, endMsg.victory]);
        setGameState(endMsg.final_state);
        break;
      }

      case 'training_complete':
        console.log('Training complete!', message.summary);
        setIsTrainingActive(false);
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
  const { isConnected, startTraining, stopTraining } = useWebSocket({
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

  // Handle training settings changes
  const handleSettingsChange = (settings: TrainingSettings) => {
    setTrainingSettings(settings);
  };

  // Handle training start with Phase 2 settings
  const handleStartTraining = () => {
    console.log('Start Training clicked!', { isConnected, isInitialized, trainingSettings });
    startTraining({
      num_episodes: trainingSettings.numEpisodes,
      reward_config: rewardConfig,
      speed_multiplier: trainingSettings.speedMultiplier,
      learning_rate: trainingSettings.learningRate,
      discount_factor: trainingSettings.discountFactor,
      epsilon: trainingSettings.epsilon,
    });
  };

  // Handle loading saved agent
  const handleLoadAgent = async (loadedQTable: QTableData, loadedRewardConfig: RewardConfig) => {
    // Update reward config
    setRewardConfig(loadedRewardConfig);
    setQTableData(loadedQTable);

    // Send to backend
    try {
      await fetch('/api/ai/reward-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loadedRewardConfig),
      });

      // TODO: Add endpoint to load Q-table into backend agent
      console.log('Agent loaded - reward config updated');
    } catch (error) {
      console.error('Failed to update backend with loaded agent:', error);
    }
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

  const isTraining = trainingStatus?.is_training || isTrainingActive;

  // Calculate stats for agent manager
  const avgReward = episodeRewards.length > 0
    ? episodeRewards.reduce((a, b) => a + b, 0) / episodeRewards.length
    : 0;
  const winRate = episodeVictories.length > 0
    ? episodeVictories.filter(v => v).length / episodeVictories.length
    : 0;

  return (
    <div className="app">
      <header className="app-header">
        <h1>🎮 RewardCraft: Tower Defense AI Trainer</h1>
        <div className="header-right">
          <span className="phase-badge">Phase 3</span>
          <span className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
            {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
          </span>
        </div>
      </header>

      <div className="app-layout-phase2">
        {/* Left Column - Game & Visualization */}
        <div className="column-left">
          <GameCanvas gameState={gameState} />

          {/* Live Training Info */}
          {isTrainingActive && (
            <div className="live-training-info">
              <h3>🎯 Live Training</h3>
              <div className="live-stats">
                <div className="live-stat">
                  <span className="live-label">Episode:</span>
                  <span className="live-value">{currentEpisode}/{trainingSettings.numEpisodes}</span>
                </div>
                <div className="live-stat">
                  <span className="live-label">Episode Reward:</span>
                  <span className={`live-value ${currentEpisodeReward >= 0 ? 'positive' : 'negative'}`}>
                    {currentEpisodeReward.toFixed(1)}
                  </span>
                </div>
                {lastAction && (
                  <div className="live-stat">
                    <span className="live-label">Last Action:</span>
                    <span className="live-value action">{lastAction}</span>
                  </div>
                )}
                {lastReward !== null && (
                  <div className="live-stat">
                    <span className="live-label">Last Reward:</span>
                    <span className={`live-value ${lastReward >= 0 ? 'positive' : 'negative'}`}>
                      {lastReward >= 0 ? '+' : ''}{lastReward.toFixed(1)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          <LearningCurve
            episodeRewards={episodeRewards}
            episodeVictories={episodeVictories}
            isTraining={isTrainingActive}
          />
        </div>

        {/* Center Column - Q-Table & Reward Breakdown */}
        <div className="column-center">
          <QTableHeatmap
            qTableData={qTableData}
            currentState={currentState}
            currentAction={currentAction}
          />

          <RewardBreakdown
            currentBreakdown={currentBreakdown}
            recentBreakdowns={recentBreakdowns}
            currentStep={currentStep}
          />
        </div>

        {/* Right Column - Controls & Agents */}
        <div className="column-right">
          <RewardDesigner
            initialConfig={rewardConfig}
            onConfigChange={handleRewardConfigChange}
            disabled={isTraining}
          />

          <TrainingControls
            onSettingsChange={handleSettingsChange}
            disabled={isTraining}
            isTraining={isTraining}
          />

          <div className="training-buttons">
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
              {isTraining ? '⏸️ Training...' : `▶️ Train (${trainingSettings.numEpisodes} eps)`}
            </button>
            <button
              onClick={stopTraining}
              disabled={!isTraining}
              className="button-danger"
            >
              ⏹️ Stop
            </button>
          </div>

          <AgentManager
            currentQTable={qTableData}
            currentRewardConfig={rewardConfig}
            episodesTrained={episodeRewards.length}
            winRate={winRate}
            avgReward={avgReward}
            onLoadAgent={handleLoadAgent}
            disabled={isTraining}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
