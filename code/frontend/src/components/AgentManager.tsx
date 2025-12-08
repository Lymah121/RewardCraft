/**
 * Agent Manager Component - Phase 3
 * Save, load, and manage trained AI agents
 * Allows students to experiment and compare different reward configurations
 *
 * Visual design:
 * - Cyberpunk aesthetic with card layout
 * - Interactive buttons and dialogs
 * - Status notifications
 */

import { useState, useEffect } from 'react';
import type { QTableData, RewardConfig } from '../types';
import './AgentManager.css';

interface SavedAgent {
  id: string;
  name: string;
  savedAt: string;
  rewardConfig: RewardConfig;
  episodesTrained: number;
  winRate: number;
  avgReward: number;
  qTableSize: number;
}

interface AgentManagerProps {
  currentQTable: QTableData | null;
  currentRewardConfig: RewardConfig;
  episodesTrained: number;
  winRate: number;
  avgReward: number;
  onLoadAgent: (qTable: QTableData, rewardConfig: RewardConfig) => void;
  disabled?: boolean;
}

const STORAGE_KEY = 'rewardcraft_saved_agents';

export const AgentManager = ({
  currentQTable,
  currentRewardConfig,
  episodesTrained,
  winRate,
  avgReward,
  onLoadAgent,
  disabled = false,
}: AgentManagerProps) => {
  const [savedAgents, setSavedAgents] = useState<SavedAgent[]>([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [agentName, setAgentName] = useState('');
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Load saved agents from localStorage on mount
  useEffect(() => {
    loadSavedAgentsList();
  }, []);

  const loadSavedAgentsList = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const agents = JSON.parse(saved) as SavedAgent[];
        setSavedAgents(agents);
      }
    } catch (error) {
      console.error('Failed to load saved agents:', error);
    }
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSave = () => {
    if (!currentQTable || !agentName.trim()) {
      showNotification('error', 'Please enter a name and ensure training has started');
      return;
    }

    const newAgent: SavedAgent = {
      id: `agent_${Date.now()}`,
      name: agentName.trim(),
      savedAt: new Date().toISOString(),
      rewardConfig: currentRewardConfig,
      episodesTrained,
      winRate,
      avgReward,
      qTableSize: currentQTable.states_visited || 0,
    };

    // Save agent metadata to list
    const updatedAgents = [...savedAgents, newAgent];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedAgents));

    // Save Q-table data separately (it can be large)
    localStorage.setItem(`rewardcraft_qtable_${newAgent.id}`, JSON.stringify(currentQTable));

    setSavedAgents(updatedAgents);
    setShowSaveDialog(false);
    setAgentName('');
    showNotification('success', `Agent "${newAgent.name}" saved successfully!`);
  };

  const handleLoad = (agent: SavedAgent) => {
    try {
      const qTableData = localStorage.getItem(`rewardcraft_qtable_${agent.id}`);
      if (!qTableData) {
        showNotification('error', 'Q-Table data not found');
        return;
      }

      const qTable = JSON.parse(qTableData) as QTableData;
      onLoadAgent(qTable, agent.rewardConfig);
      setSelectedAgent(agent.id);
      showNotification('success', `Agent "${agent.name}" loaded!`);
    } catch (error) {
      console.error('Failed to load agent:', error);
      showNotification('error', 'Failed to load agent');
    }
  };

  const handleDelete = (agent: SavedAgent) => {
    if (!confirm(`Delete agent "${agent.name}"? This cannot be undone.`)) {
      return;
    }

    // Remove from list
    const updatedAgents = savedAgents.filter(a => a.id !== agent.id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedAgents));

    // Remove Q-table data
    localStorage.removeItem(`rewardcraft_qtable_${agent.id}`);

    setSavedAgents(updatedAgents);
    if (selectedAgent === agent.id) {
      setSelectedAgent(null);
    }
    showNotification('success', `Agent "${agent.name}" deleted`);
  };

  const handleExport = (agent: SavedAgent) => {
    try {
      const qTableData = localStorage.getItem(`rewardcraft_qtable_${agent.id}`);
      if (!qTableData) {
        showNotification('error', 'Q-Table data not found');
        return;
      }

      const exportData = {
        agent,
        qTable: JSON.parse(qTableData),
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${agent.name.replace(/\s+/g, '_')}_agent.json`;
      a.click();
      URL.revokeObjectURL(url);

      showNotification('success', 'Agent exported!');
    } catch (error) {
      console.error('Failed to export agent:', error);
      showNotification('error', 'Failed to export agent');
    }
  };

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="flex flex-col h-full relative">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-100 flex items-center gap-2">
          <span className="text-2xl">💾</span> Saved Agents
        </h3>
        <button
          className="px-3 py-1 bg-neon-blue/20 hover:bg-neon-blue/30 text-neon-blue border border-neon-blue/50 rounded text-sm font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => setShowSaveDialog(true)}
          disabled={disabled || !currentQTable || episodesTrained === 0}
        >
          Save Current
        </button>
      </div>

      {notification && (
        <div className={`absolute top-0 left-0 right-0 p-2 text-center text-sm font-bold rounded z-50 animate-fadeIn ${notification.type === 'success' ? 'bg-neon-green text-black' : 'bg-neon-red text-white'
          }`}>
          {notification.message}
        </div>
      )}

      {showSaveDialog && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-40 flex items-center justify-center p-4 rounded-lg">
          <div className="bg-cyber-dark border border-neon-blue p-4 rounded-lg w-full max-w-sm shadow-[0_0_20px_rgba(6,182,212,0.3)]">
            <h4 className="text-lg font-bold text-white mb-3">Save Agent</h4>
            <input
              type="text"
              placeholder="Enter agent name..."
              value={agentName}
              onChange={(e) => setAgentName(e.target.value)}
              autoFocus
              className="w-full bg-black/50 border border-gray-600 rounded p-2 text-white mb-3 focus:border-neon-blue focus:outline-none"
            />
            <div className="grid grid-cols-3 gap-2 text-xs text-gray-400 mb-4">
              <div className="bg-white/5 p-2 rounded text-center">
                <span className="block">Episodes</span>
                <span className="text-white font-mono">{episodesTrained}</span>
              </div>
              <div className="bg-white/5 p-2 rounded text-center">
                <span className="block">Win Rate</span>
                <span className="text-white font-mono">{(winRate * 100).toFixed(1)}%</span>
              </div>
              <div className="bg-white/5 p-2 rounded text-center">
                <span className="block">Avg Reward</span>
                <span className="text-white font-mono">{avgReward.toFixed(1)}</span>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowSaveDialog(false)}
                className="px-3 py-1.5 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                className="px-3 py-1.5 bg-neon-blue hover:bg-cyan-400 text-black font-bold rounded transition-colors"
                onClick={handleSave}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {savedAgents.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-grow text-gray-400 border border-dashed border-gray-700 rounded-lg bg-black/20">
          <div className="text-4xl mb-2 opacity-50">💾</div>
          <p className="font-medium">No saved agents</p>
          <p className="text-xs opacity-60 mt-1">Train and save to compare strategies!</p>
        </div>
      ) : (
        <div className="flex-grow overflow-y-auto custom-scrollbar space-y-3 pr-1">
          {savedAgents.map((agent) => (
            <div
              key={agent.id}
              className={`bg-black/40 border rounded-lg p-3 transition-all hover:border-gray-500 ${selectedAgent === agent.id ? 'border-neon-green shadow-[0_0_10px_rgba(16,185,129,0.2)]' : 'border-white/10'
                }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="block font-bold text-white text-sm">{agent.name}</span>
                  <span className="text-[10px] text-gray-500">{formatDate(agent.savedAt)}</span>
                </div>
                <div className="flex gap-1">
                  <button
                    className="p-1.5 bg-neon-blue/10 hover:bg-neon-blue/20 text-neon-blue rounded transition-colors"
                    onClick={() => handleLoad(agent)}
                    disabled={disabled}
                    title="Load this agent"
                  >
                    📂
                  </button>
                  <button
                    className="p-1.5 bg-white/5 hover:bg-white/10 text-gray-300 rounded transition-colors"
                    onClick={() => handleExport(agent)}
                    title="Export as JSON"
                  >
                    📤
                  </button>
                  <button
                    className="p-1.5 bg-neon-red/10 hover:bg-neon-red/20 text-neon-red rounded transition-colors"
                    onClick={() => handleDelete(agent)}
                    title="Delete agent"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-[10px]">
                <div className="bg-white/5 rounded p-1 text-center">
                  <span className="text-gray-500 block">Eps</span>
                  <span className="text-gray-300 font-mono">{agent.episodesTrained}</span>
                </div>
                <div className="bg-white/5 rounded p-1 text-center">
                  <span className="text-gray-500 block">Win%</span>
                  <span className={`font-mono ${agent.winRate >= 0.5 ? 'text-neon-green' : 'text-neon-red'}`}>
                    {(agent.winRate * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="bg-white/5 rounded p-1 text-center">
                  <span className="text-gray-500 block">Avg R</span>
                  <span className={`font-mono ${agent.avgReward >= 0 ? 'text-neon-green' : 'text-neon-red'}`}>
                    {agent.avgReward.toFixed(1)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
