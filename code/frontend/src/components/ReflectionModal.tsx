import { useState } from 'react';

interface ReflectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  presetName?: string;
  winRate: number;
  sessionUuid: string;
  studentName: string;
  onStudentNameChange: (name: string) => void;
}

export const ReflectionModal = ({
  isOpen,
  onClose,
  presetName,
  winRate,
  sessionUuid,
  studentName,
  onStudentNameChange,
}: ReflectionModalProps) => {
  const [localName, setLocalName] = useState(studentName);
  const [response1, setResponse1] = useState('');
  const [response2, setResponse2] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleNameChange = (name: string) => {
    setLocalName(name);
    onStudentNameChange(name);
  };

  const combinedResponse = [
    `[Q1 - Unintended Behaviors]: ${response1}`,
    `[Q2 - Real-World Connection]: ${response2}`,
  ].join('\n\n');

  const canSubmit =
    localName.trim() !== '' &&
    response1.trim() !== '' &&
    response2.trim() !== '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/research/reflection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_uuid: sessionUuid,
          student_name: localName.trim(),
          preset_name: presetName || 'Custom',
          win_rate: winRate,
          response: combinedResponse,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Failed to save reflection');
      }

      setSubmitted(true);
      setTimeout(() => {
        onClose();
        // Reset for next run
        setSubmitted(false);
        setResponse1('');
        setResponse2('');
        setError(null);
      }, 2500);
    } catch (err: any) {
      setError(err.message || 'Network error. Check your connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-overlay-in">
      <div className="bg-gray-900 border border-neon-purple/40 rounded-2xl shadow-[0_0_60px_rgba(139,92,246,0.15)] max-w-xl w-full animate-modal-in overflow-hidden">

        {/* Animated gradient top border */}
        <div className="h-1 w-full bg-gradient-to-r from-neon-blue via-neon-purple to-neon-blue animate-pulse" />

        <div className="p-6">
          {/* Title row */}
          <div className="flex items-start justify-between mb-1">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-neon-purple to-neon-blue bg-clip-text text-transparent flex items-center gap-2">
              <span>🧠</span> Time to Reflect
            </h2>
            {/* Progress indicator: lights up as each field is filled */}
            <div className="flex gap-1.5 pt-1.5" title="Fields completed">
              <div className={`w-2 h-2 rounded-full transition-all duration-300 ${localName.trim() ? 'bg-neon-purple shadow-[0_0_4px_#8b5cf6]' : 'bg-gray-700'}`} />
              <div className={`w-2 h-2 rounded-full transition-all duration-300 ${response1.trim() ? 'bg-neon-yellow shadow-[0_0_4px_#f59e0b]' : 'bg-gray-700'}`} />
              <div className={`w-2 h-2 rounded-full transition-all duration-300 ${response2.trim() ? 'bg-neon-blue shadow-[0_0_4px_#06b6d4]' : 'bg-gray-700'}`} />
            </div>
          </div>
          <p className="text-gray-500 text-xs mb-5">Fill all three fields — your responses are saved for research analysis.</p>

          {submitted ? (
            <div className="text-center py-10">
              <div className="text-5xl mb-4">✨</div>
              <h3 className="text-xl font-bold text-neon-green mb-2">Reflection Saved!</h3>
              <p className="text-gray-400 text-sm">Great insight into the AI's behavior. Returning to the lab…</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Student Name */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                  Your Name <span className="text-neon-red">*</span>
                </label>
                <input
                  type="text"
                  value={localName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Enter your name or student ID"
                  className="w-full bg-black/60 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-neon-purple focus:ring-1 focus:ring-neon-purple/50 transition-all"
                  required
                />
              </div>

              {/* Context Banner */}
              <div className="bg-black/40 rounded-xl p-4 border border-white/5 flex items-center gap-3">
                <span className="text-2xl shrink-0">{winRate >= 0.5 ? '🏆' : '📉'}</span>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Your AI finished training with the{' '}
                  <strong className="text-neon-purple">{presetName || 'Custom'}</strong> reward config
                  {' '}and achieved a win rate of{' '}
                  <strong className={winRate >= 0.5 ? 'text-neon-green' : 'text-neon-red'}>
                    {(winRate * 100).toFixed(0)}%
                  </strong>.
                </p>
              </div>

              {/* Q1 */}
              <div>
                <label className="block text-xs font-bold text-neon-yellow/80 uppercase tracking-wider mb-1">
                  Q1 — Unintended Behaviors <span className="text-neon-red">*</span>
                </label>
                <p className="text-gray-500 text-xs mb-2">
                  What unintended behaviors (if any) did you observe? How did your specific reward settings encourage that behavior?
                </p>
                <textarea
                  value={response1}
                  onChange={(e) => setResponse1(e.target.value)}
                  placeholder="I noticed the agent often… because the reward for… meant it learned to…"
                  className="w-full h-24 bg-black/60 border border-gray-700 rounded-lg p-3 text-sm text-gray-200 focus:outline-none focus:border-neon-yellow/50 focus:ring-1 focus:ring-neon-yellow/30 transition-all resize-none"
                  required
                />
              </div>

              {/* Q2 */}
              <div>
                <label className="block text-xs font-bold text-neon-blue/80 uppercase tracking-wider mb-1">
                  Q2 — Real-World Connection <span className="text-neon-red">*</span>
                </label>
                <p className="text-gray-500 text-xs mb-2">
                  Can you think of a real AI system (e.g., a recommendation algorithm, self-driving car, or robot) that might develop similar specification gaming problems? Why?
                </p>
                <textarea
                  value={response2}
                  onChange={(e) => setResponse2(e.target.value)}
                  placeholder="A real-world example could be… because if you reward it for…"
                  className="w-full h-24 bg-black/60 border border-gray-700 rounded-lg p-3 text-sm text-gray-200 focus:outline-none focus:border-neon-blue/50 focus:ring-1 focus:ring-neon-blue/30 transition-all resize-none"
                  required
                />
              </div>

              {error && (
                <div className="bg-neon-red/10 border border-neon-red/30 rounded-lg p-3 text-neon-red text-sm flex items-center gap-2">
                  <span>⚠️</span> {error}
                </div>
              )}

              <div className="flex justify-between items-center pt-2 border-t border-white/5">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-gray-500 hover:text-gray-300 transition-colors"
                >
                  Skip for now
                </button>
                <button
                  type="submit"
                  disabled={!canSubmit || isSubmitting}
                  className="px-6 py-2.5 bg-gradient-to-r from-neon-purple to-purple-500 hover:from-purple-500 hover:to-neon-purple text-white rounded-lg text-sm font-bold shadow-[0_0_20px_rgba(139,92,246,0.35)] disabled:opacity-40 disabled:shadow-none transition-all hover:scale-[1.02] flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <span className="inline-block w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Saving…
                    </>
                  ) : (
                    '💾 Save Reflection'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
