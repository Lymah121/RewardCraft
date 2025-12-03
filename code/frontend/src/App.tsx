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
  const [lastEpisodeOutcome, setLastEpisodeOutcome] = useState<{
    victory: boolean;
    wave: number;
    reward: number;
  } | null>(null);

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
        setLastEpisodeOutcome(null);
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
        // Track last episode outcome for display
        setLastEpisodeOutcome({
          victory: endMsg.victory,
          wave: endMsg.final_state?.current_wave ?? 0,
          reward: endMsg.total_reward,
        });
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
    <div className="min-h-screen bg-cyber-black text-gray-100 p-6 font-sans">
      <header className="flex justify-between items-center mb-8 glass-panel p-4 neon-border">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent">
            🎮 RewardCraft: Tower Defense AI Trainer
          </h1>
          <span className="px-3 py-1 bg-neon-purple/20 text-neon-purple border border-neon-purple/50 rounded-full text-xs font-mono uppercase tracking-wider">
            Phase 3
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${isConnected ? 'bg-neon-green/20 text-neon-green border border-neon-green/50' : 'bg-neon-red/20 text-neon-red border border-neon-red/50'
            }`}>
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-neon-green animate-pulse' : 'bg-neon-red'}`}></span>
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </header>

      <div className="grid grid-cols-12 gap-6 h-[calc(100vh-140px)]">
        {/* Left Column - Game & Visualization */}
        <div className="col-span-3 flex flex-col gap-6 overflow-y-auto pr-2">
          <div className="glass-panel p-4">
            <GameCanvas gameState={gameState} />
          </div>

          {/* Live Training Info */}
          {isTrainingActive && (
            <div className="glass-panel p-4 border-l-4 border-neon-blue">
              <h3 className="text-neon-blue font-bold mb-3 flex items-center gap-2">
                <span className="animate-spin">⚙️</span> Live Training
              </h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex flex-col">
                  <span className="text-gray-400 text-xs uppercase">Episode</span>
                  <span className="font-mono text-lg">{currentEpisode}/{trainingSettings.numEpisodes}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-400 text-xs uppercase">Reward</span>
                  <span className={`font-mono text-lg ${currentEpisodeReward >= 0 ? 'text-neon-green' : 'text-neon-red'}`}>
                    {currentEpisodeReward.toFixed(1)}
                  </span>
                </div>
                {lastAction && (
                  <div className="col-span-2 flex flex-col mt-2 pt-2 border-t border-white/10">
                    <span className="text-gray-400 text-xs uppercase">Last Action</span>
                    <span className="font-mono text-neon-yellow">{lastAction}</span>
                  </div>
                )}
                {lastEpisodeOutcome && (
                  <div className="col-span-2 flex flex-col mt-2 pt-2 border-t border-white/10">
                    <span className="text-gray-400 text-xs uppercase">Last Episode</span>
                    <span className={`font-mono text-lg ${lastEpisodeOutcome.victory ? 'text-neon-green' : 'text-neon-red'}`}>
                      {lastEpisodeOutcome.victory ? '🎉 WIN' : `💔 DEFEAT @ Wave ${lastEpisodeOutcome.wave}/5`}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="glass-panel p-4 flex-grow">
            <LearningCurve
              episodeRewards={episodeRewards}
              episodeVictories={episodeVictories}
              isTraining={isTrainingActive}
            />
          </div>
        </div>

        {/* Center Column - Q-Table & Reward Breakdown */}
        <div className="col-span-6 flex flex-col gap-6 overflow-y-auto px-2">
          <div className="glass-panel p-1 flex-grow min-h-[400px]">
            <QTableHeatmap
              qTableData={qTableData}
              currentState={currentState}
              currentAction={currentAction}
            />
          </div>

          <div className="glass-panel p-4 h-64">
            <RewardBreakdown
              currentBreakdown={currentBreakdown}
              recentBreakdowns={recentBreakdowns}
              currentStep={currentStep}
            />
          </div>
        </div>

        {/* Right Column - Controls & Agents */}
        <div className="col-span-3 flex flex-col gap-6 overflow-y-auto pl-2">
          <div className="glass-panel p-4">
            <RewardDesigner
              initialConfig={rewardConfig}
              onConfigChange={handleRewardConfigChange}
              disabled={isTraining}
            />
          </div>

          <div className="glass-panel p-4">
            <TrainingControls
              onSettingsChange={handleSettingsChange}
              disabled={isTraining}
              isTraining={isTraining}
            />
          </div>

          <div className="glass-panel p-4 flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={initialize}
                disabled={isTraining}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
              >
                🔄 Reset AI
              </button>
              <button
                onClick={stopTraining}
                disabled={!isTraining}
                className="px-4 py-2 bg-neon-red/20 hover:bg-neon-red/30 text-neon-red border border-neon-red/50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
              >
                ⏹️ Stop
              </button>
            </div>
            <button
              onClick={handleStartTraining}
              disabled={!isInitialized || isTraining || !isConnected}
              className="w-full py-3 bg-neon-blue hover:bg-cyan-400 text-black font-bold rounded-lg shadow-lg shadow-cyan-500/20 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isTraining ? '⏸️ Training in Progress...' : `▶️ Start Training (${trainingSettings.numEpisodes} eps)`}
            </button>
          </div>

          <div className="glass-panel p-4 flex-grow">
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
    </div>
  );
}

export default App;
