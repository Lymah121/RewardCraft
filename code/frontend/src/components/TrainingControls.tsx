/**
 * Training Controls Component
 * Advanced controls for training speed and hyperparameters
 * Helps students understand how different parameters affect learning
 */

import { useState } from 'react';
import './TrainingControls.css';

interface TrainingControlsProps {
  onSettingsChange: (settings: TrainingSettings) => void;
  disabled?: boolean;
  isTraining?: boolean;
}

export interface TrainingSettings {
  numEpisodes: number;
  speedMultiplier: number;
  learningRate: number;
  discountFactor: number;
  epsilon: number;
  epsilonDecay: number;
}

const DEFAULT_SETTINGS: TrainingSettings = {
  numEpisodes: 100,
  speedMultiplier: 2.0,
  learningRate: 0.1,
  discountFactor: 0.95,
  epsilon: 1.0,
  epsilonDecay: 0.995,
};

// Educational tooltips for each parameter
const TOOLTIPS = {
  numEpisodes: "Number of complete games the AI will play during training. More episodes = more learning opportunities, but takes longer.",
  speedMultiplier: "How fast the training runs. Lower = easier to watch, Higher = faster results. At 1x, you can see every enemy move!",
  learningRate: "How much the AI updates its knowledge after each action. High = learns fast but may be unstable. Low = learns slowly but steadily. (α in Q-learning formula)",
  discountFactor: "How much the AI values future rewards vs immediate rewards. High = plans ahead. Low = focuses on immediate gains. (γ in Q-learning formula)",
  epsilon: "How often the AI explores random actions vs using what it learned. High = more exploration. Low = more exploitation of known strategies.",
  epsilonDecay: "How quickly exploration decreases over time. Higher = explores longer. The AI should explore more early and exploit more later.",
};

export const TrainingControls = ({
  onSettingsChange,
  disabled = false,
  isTraining = false,
}: TrainingControlsProps) => {
  const [settings, setSettings] = useState<TrainingSettings>(DEFAULT_SETTINGS);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  const handleChange = (key: keyof TrainingSettings, value: number) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    onSettingsChange(newSettings);
  };

  const resetToDefaults = () => {
    setSettings(DEFAULT_SETTINGS);
    onSettingsChange(DEFAULT_SETTINGS);
  };

  const renderSlider = (
    key: keyof TrainingSettings,
    label: string,
    min: number,
    max: number,
    step: number,
    unit: string = '',
    formatValue?: (v: number) => string
  ) => {
    const value = settings[key];
    const displayValue = formatValue ? formatValue(value) : `${value}${unit}`;

    return (
      <div
        className="control-item"
        onMouseEnter={() => setActiveTooltip(key)}
        onMouseLeave={() => setActiveTooltip(null)}
      >
        <div className="control-header">
          <label>{label}</label>
          <span className="control-value">{displayValue}</span>
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => handleChange(key, parseFloat(e.target.value))}
          disabled={disabled || isTraining}
          className="control-slider"
        />
        {activeTooltip === key && (
          <div className="tooltip">
            <span className="tooltip-icon">💡</span>
            {TOOLTIPS[key]}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="training-controls-panel">
      <div className="controls-header">
        <h3>⚙️ Training Settings</h3>
        <button
          className="reset-button"
          onClick={resetToDefaults}
          disabled={disabled || isTraining}
        >
          Reset
        </button>
      </div>

      <div className="controls-section">
        <h4>Basic Settings</h4>

        {renderSlider(
          'numEpisodes',
          'Training Episodes',
          10, 500, 10, '',
          (v) => `${v} games`
        )}

        {renderSlider(
          'speedMultiplier',
          'Training Speed',
          0.5, 10, 0.5, 'x',
          (v) => {
            if (v <= 1) return `${v}x (Watch mode)`;
            if (v <= 2) return `${v}x (Normal)`;
            if (v <= 5) return `${v}x (Fast)`;
            return `${v}x (Turbo)`;
          }
        )}
      </div>

      <button
        className="advanced-toggle"
        onClick={() => setShowAdvanced(!showAdvanced)}
      >
        {showAdvanced ? '▼' : '▶'} Advanced Hyperparameters
        <span className="toggle-hint">
          {showAdvanced ? 'Hide' : 'Show Q-Learning parameters'}
        </span>
      </button>

      {showAdvanced && (
        <div className="controls-section advanced">
          <div className="advanced-warning">
            <span className="warning-icon">🧪</span>
            <span>These parameters control how the Q-Learning algorithm works. Experiment to see their effects!</span>
          </div>

          {renderSlider(
            'learningRate',
            'Learning Rate (α)',
            0.01, 1.0, 0.01, '',
            (v) => v.toFixed(2)
          )}

          {renderSlider(
            'discountFactor',
            'Discount Factor (γ)',
            0.5, 0.99, 0.01, '',
            (v) => v.toFixed(2)
          )}

          {renderSlider(
            'epsilon',
            'Initial Exploration (ε)',
            0.1, 1.0, 0.05, '',
            (v) => `${(v * 100).toFixed(0)}%`
          )}

          {renderSlider(
            'epsilonDecay',
            'Exploration Decay',
            0.9, 0.999, 0.001, '',
            (v) => v.toFixed(3)
          )}

          <div className="formula-box">
            <h5>Q-Learning Formula</h5>
            <code>Q(s,a) ← Q(s,a) + α[r + γ·max(Q(s',a')) - Q(s,a)]</code>
            <p className="formula-explanation">
              The AI updates its knowledge by combining what it knew before with the new reward received.
            </p>
          </div>
        </div>
      )}

      {isTraining && (
        <div className="training-active-notice">
          <span className="pulse-dot"></span>
          Settings locked during training
        </div>
      )}
    </div>
  );
};
