/**
 * Agent Manager Component
 * Save, load, and manage trained AI agents
 * Allows students to experiment and compare different reward configurations
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
    <div className="agent-manager">
      <div className="manager-header">
        <h3>💾 Saved Agents</h3>
        <button
          className="save-button"
          onClick={() => setShowSaveDialog(true)}
          disabled={disabled || !currentQTable || episodesTrained === 0}
        >
          Save Current
        </button>
      </div>

      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      {showSaveDialog && (
        <div className="save-dialog">
          <h4>Save Agent</h4>
          <input
            type="text"
            placeholder="Enter agent name..."
            value={agentName}
            onChange={(e) => setAgentName(e.target.value)}
            autoFocus
          />
          <div className="save-preview">
            <span>Episodes: {episodesTrained}</span>
            <span>Win Rate: {(winRate * 100).toFixed(1)}%</span>
            <span>Avg Reward: {avgReward.toFixed(1)}</span>
          </div>
          <div className="dialog-buttons">
            <button onClick={() => setShowSaveDialog(false)}>Cancel</button>
            <button className="primary" onClick={handleSave}>Save</button>
          </div>
        </div>
      )}

      {savedAgents.length === 0 ? (
        <div className="no-agents">
          <p>No saved agents yet</p>
          <p className="hint">Train an agent and save it to compare different reward configurations!</p>
        </div>
      ) : (
        <div className="agents-list">
          {savedAgents.map((agent) => (
            <div
              key={agent.id}
              className={`agent-card ${selectedAgent === agent.id ? 'selected' : ''}`}
            >
              <div className="agent-header">
                <span className="agent-name">{agent.name}</span>
                <span className="agent-date">{formatDate(agent.savedAt)}</span>
              </div>

              <div className="agent-stats">
                <div className="agent-stat">
                  <span className="stat-label">Episodes</span>
                  <span className="stat-value">{agent.episodesTrained}</span>
                </div>
                <div className="agent-stat">
                  <span className="stat-label">Win Rate</span>
                  <span className={`stat-value ${agent.winRate >= 0.5 ? 'positive' : 'negative'}`}>
                    {(agent.winRate * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="agent-stat">
                  <span className="stat-label">Avg Reward</span>
                  <span className={`stat-value ${agent.avgReward >= 0 ? 'positive' : 'negative'}`}>
                    {agent.avgReward.toFixed(1)}
                  </span>
                </div>
              </div>

              <div className="agent-actions">
                <button
                  className="action-btn load"
                  onClick={() => handleLoad(agent)}
                  disabled={disabled}
                  title="Load this agent"
                >
                  Load
                </button>
                <button
                  className="action-btn export"
                  onClick={() => handleExport(agent)}
                  title="Export as JSON"
                >
                  📤
                </button>
                <button
                  className="action-btn delete"
                  onClick={() => handleDelete(agent)}
                  title="Delete agent"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
