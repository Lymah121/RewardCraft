/**
 * Training Controls Component - Phase 3
 * Advanced controls for training speed and hyperparameters
 * Helps students understand how different parameters affect learning
 *
 * Visual design:
 * - Cyberpunk aesthetic with styled inputs
 * - Interactive tooltips
 * - Collapsible advanced section
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
        className="relative group mb-4"
        onMouseEnter={() => setActiveTooltip(key)}
        onMouseLeave={() => setActiveTooltip(null)}
      >
        <div className="flex justify-between items-center mb-1">
          <label className="text-sm font-medium text-gray-300 group-hover:text-neon-blue transition-colors">
            {label}
          </label>
          <span className="font-mono text-neon-blue font-bold text-sm">{displayValue}</span>
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => handleChange(key, parseFloat(e.target.value))}
          disabled={disabled || isTraining}
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-neon-blue hover:accent-cyan-300 disabled:opacity-50 disabled:cursor-not-allowed"
        />
        {activeTooltip === key && (
          <div className="absolute z-50 bottom-full left-0 mb-2 p-2 bg-gray-900 border border-neon-blue/30 rounded shadow-xl text-xs text-gray-200 w-64 pointer-events-none backdrop-blur-md">
            <span className="mr-1">💡</span>
            {TOOLTIPS[key]}
            <div className="absolute bottom-0 left-4 transform translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900 border-r border-b border-neon-blue/30"></div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-100 flex items-center gap-2">
          <span className="text-2xl">⚙️</span> Settings
        </h3>
        <button
          className="text-xs text-gray-400 hover:text-white underline disabled:opacity-50"
          onClick={resetToDefaults}
          disabled={disabled || isTraining}
        >
          Reset Defaults
        </button>
      </div>

      <div className="space-y-2">
        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Basic Settings</h4>

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
            if (v <= 1) return `${v}x (Watch)`;
            if (v <= 2) return `${v}x (Normal)`;
            if (v <= 5) return `${v}x (Fast)`;
            return `${v}x (Turbo)`;
          }
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-white/10">
        <button
          className="flex items-center gap-2 text-sm font-bold text-neon-purple hover:text-purple-300 transition-colors w-full"
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          <span className={`transform transition-transform ${showAdvanced ? 'rotate-90' : ''}`}>▶</span>
          Advanced Hyperparameters
        </button>

        {showAdvanced && (
          <div className="mt-4 space-y-4 animate-fadeIn">
            <div className="bg-neon-purple/10 border border-neon-purple/20 rounded p-3 text-xs text-purple-200 mb-4 flex gap-2">
              <span className="text-lg">🧪</span>
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

            <div className="bg-black/30 rounded p-3 font-mono text-xs text-gray-400 border border-white/5 mt-4">
              <h5 className="font-bold text-gray-300 mb-1">Q-Learning Formula</h5>
              <code className="text-neon-green block mb-2">Q(s,a) ← Q(s,a) + α[r + γ·max(Q(s',a')) - Q(s,a)]</code>
              <p className="opacity-70">
                The AI updates its knowledge by combining what it knew before with the new reward received.
              </p>
            </div>
          </div>
        )}
      </div>

      {isTraining && (
        <div className="mt-4 p-2 bg-neon-blue/10 border border-neon-blue/30 rounded text-center text-xs text-neon-blue animate-pulse">
          🔒 Settings locked during training
        </div>
      )}
    </div>
  );
};
