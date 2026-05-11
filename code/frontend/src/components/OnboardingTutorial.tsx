/**
 * OnboardingTutorial Component
 * First-time guided walkthrough explaining RL concepts before entering the tool.
 * 8 slides covering: RL basics → game mechanics → reward functions → spec gaming → Q-table → mission
 */

import { useState } from 'react';

interface OnboardingTutorialProps {
  onComplete: () => void;
  studentName: string;
  onStudentNameChange: (name: string) => void;
}

interface Slide {
  id: string;
  emoji: string;
  title: string;
  subtitle?: string;
  content: React.ReactNode;
  accentColor: string;
}

const SLIDES: Slide[] = [
  {
    id: 'welcome',
    emoji: '🎮',
    title: 'Welcome to RewardCraft',
    subtitle: 'Train an AI without writing a single line of code',
    accentColor: 'neon-blue',
    content: (
      <div className="space-y-4">
        <p className="text-gray-300 text-base leading-relaxed">
          In the next few minutes, you'll learn how Artificial Intelligence actually learns — by doing it yourself.
        </p>
        <div className="grid grid-cols-3 gap-3 mt-6">
          {[
            { icon: '🎯', label: 'Design', desc: 'Choose what your AI values' },
            { icon: '🤖', label: 'Train', desc: 'Watch it learn in real time' },
            { icon: '🧪', label: 'Reflect', desc: 'Discover what went wrong' },
          ].map((item) => (
            <div key={item.label} className="bg-black/40 rounded-xl p-4 border border-white/10 text-center">
              <div className="text-3xl mb-2">{item.icon}</div>
              <div className="text-sm font-bold text-white mb-1">{item.label}</div>
              <div className="text-xs text-gray-500">{item.desc}</div>
            </div>
          ))}
        </div>
        <p className="text-gray-500 text-sm mt-4 text-center italic">
          This tutorial takes about 3 minutes. Let's go!
        </p>
      </div>
    ),
  },
  {
    id: 'what-is-rl',
    emoji: '🤖',
    title: 'What is Reinforcement Learning?',
    subtitle: 'How AI learns from experience',
    accentColor: 'neon-purple',
    content: (
      <div className="space-y-5">
        <p className="text-gray-300 text-base leading-relaxed">
          Imagine training a dog. When it sits on command, you give it a treat. When it barks, you ignore it. Over time, the dog learns what earns treats.
        </p>
        <div className="bg-black/40 rounded-xl p-5 border border-neon-purple/20">
          <div className="flex items-center justify-between gap-2 text-sm">
            {[
              { icon: '👁️', label: 'Observe', sub: 'See the world' },
              { icon: '→', label: '', sub: '', arrow: true },
              { icon: '🎮', label: 'Act', sub: 'Choose an action' },
              { icon: '→', label: '', sub: '', arrow: true },
              { icon: '⭐', label: 'Reward', sub: 'Get feedback' },
              { icon: '→', label: '', sub: '', arrow: true },
              { icon: '🧠', label: 'Learn', sub: 'Update strategy' },
            ].map((step, i) =>
              step.arrow ? (
                <div key={i} className="text-gray-600 text-xl font-bold">→</div>
              ) : (
                <div key={i} className="text-center flex-1">
                  <div className="text-2xl mb-1">{step.icon}</div>
                  <div className="text-xs font-bold text-white">{step.label}</div>
                  <div className="text-[10px] text-gray-500">{step.sub}</div>
                </div>
              )
            )}
          </div>
        </div>
        <p className="text-gray-300 text-sm leading-relaxed">
          AI does the same thing — millions of times per second. This loop is called <strong className="text-neon-purple">Reinforcement Learning (RL)</strong>.
        </p>
        <div className="bg-neon-purple/10 border border-neon-purple/30 rounded-lg p-3 text-sm text-purple-200">
          <strong>🔑 Key idea:</strong> The AI doesn't know the rules — it figures them out by trial and error, guided only by the rewards you give it.
        </div>
      </div>
    ),
  },
  {
    id: 'the-game',
    emoji: '🏰',
    title: 'Your Tower Defense Game',
    subtitle: 'This is the world your AI will learn to navigate',
    accentColor: 'neon-green',
    content: (
      <div className="space-y-4">
        <p className="text-gray-300 text-base leading-relaxed">
          Your AI controls a Tower Defense game. Enemies march from left to right — your towers must stop them before they reach the base.
        </p>

        {/* Mini game diagram */}
        <div className="bg-black/60 rounded-xl border border-white/10 overflow-hidden">
          <div className="bg-[#1e293b] p-4 font-mono text-xs">
            <div className="flex items-center justify-between mb-2 text-gray-500 text-[10px]">
              <span className="text-neon-green">START</span>
              <span className="text-gray-600">──── enemy path ────</span>
              <span className="text-neon-blue">BASE</span>
            </div>
            <div className="grid grid-cols-10 gap-0.5">
              {Array.from({ length: 100 }, (_, i) => {
                const row = Math.floor(i / 10);
                const isPath = row === 5;
                const isTower = [12, 23, 47, 68].includes(i);
                const isEnemy = [51, 53].includes(i);
                return (
                  <div
                    key={i}
                    className={`h-5 rounded-sm flex items-center justify-center text-[8px] ${
                      isTower ? 'bg-neon-blue/30 border border-neon-blue/60' :
                      isEnemy ? 'bg-neon-red/40 border border-neon-red/60' :
                      isPath ? 'bg-amber-900/30 border border-amber-700/20' :
                      'bg-white/3 border border-white/5'
                    }`}
                  >
                    {isTower ? '▲' : isEnemy ? '●' : ''}
                  </div>
                );
              })}
            </div>
            <div className="flex justify-around mt-2 text-[9px]">
              <span className="text-neon-blue">▲ Tower</span>
              <span className="text-neon-red">● Enemy</span>
              <span className="text-amber-600">─ Path</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          {[
            { icon: '🏗️', label: 'Build towers', desc: 'Costs gold to place' },
            { icon: '⬆️', label: 'Upgrade towers', desc: 'More powerful but costs more' },
            { icon: '💰', label: 'Save gold', desc: 'For future towers' },
            { icon: '🌊', label: 'Survive 5 waves', desc: 'To win the game' },
          ].map((a) => (
            <div key={a.label} className="bg-black/30 rounded-lg p-2 border border-white/5 flex items-start gap-2">
              <span className="text-lg">{a.icon}</span>
              <div>
                <div className="text-xs font-bold text-white">{a.label}</div>
                <div className="text-[10px] text-gray-500">{a.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 'reward-function',
    emoji: '🎯',
    title: 'What is a Reward Function?',
    subtitle: "You're the teacher — you decide what 'good' means",
    accentColor: 'neon-yellow',
    content: (
      <div className="space-y-5">
        <p className="text-gray-300 text-base leading-relaxed">
          The AI doesn't know that winning is good. <em>You</em> have to tell it — by assigning a number to each event. This is your <strong className="text-neon-yellow">reward function</strong>.
        </p>

        <div className="space-y-2">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Example Reward Function:</div>
          {[
            { event: 'Enemy defeated', value: '+10', color: 'neon-green', good: true },
            { event: 'Enemy reached base', value: '−50', color: 'neon-red', good: false },
            { event: 'Tower built', value: '−2', color: 'neon-red', good: false },
            { event: 'Wave completed', value: '+20', color: 'neon-green', good: true },
          ].map((r) => (
            <div key={r.event} className={`flex justify-between items-center px-4 py-2 rounded-lg border ${r.good ? 'bg-neon-green/5 border-neon-green/20' : 'bg-neon-red/5 border-neon-red/20'}`}>
              <span className="text-sm text-gray-200">{r.event}</span>
              <span className={`font-mono font-bold text-${r.color}`}>{r.value}</span>
            </div>
          ))}
        </div>

        <div className="bg-neon-yellow/10 border border-neon-yellow/30 rounded-lg p-3 text-sm text-yellow-200">
          <strong>💡 Think of it like a grade sheet.</strong> The AI tries to score as many points as possible. Whatever you reward, it will try to do more of.
        </div>
      </div>
    ),
  },
  {
    id: 'spec-gaming',
    emoji: '⚠️',
    title: 'The Catch: Specification Gaming',
    subtitle: "What happens when you reward the wrong thing?",
    accentColor: 'neon-red',
    content: (
      <div className="space-y-5">
        <p className="text-gray-300 text-base leading-relaxed">
          AI is very literal. If you write a reward function with a loophole, it <em>will</em> exploit it — in ways you never expected.
        </p>

        <div className="bg-black/50 rounded-xl border border-neon-red/30 p-4 space-y-3">
          <div className="text-xs font-bold text-neon-red uppercase tracking-wider">⚠️ Real Example from This Game</div>
          <div className="space-y-2">
            <div className="flex items-start gap-2 text-sm">
              <span className="text-neon-red mt-0.5">→</span>
              <span className="text-gray-300">You set gold savings reward to <strong className="text-neon-yellow">+100</strong> (very high)</span>
            </div>
            <div className="flex items-start gap-2 text-sm">
              <span className="text-neon-red mt-0.5">→</span>
              <span className="text-gray-300">The AI learns: "Building towers costs gold, and spending gold loses points"</span>
            </div>
            <div className="flex items-start gap-2 text-sm">
              <span className="text-neon-red mt-0.5">→</span>
              <span className="text-gray-300 font-bold text-neon-red">Result: The AI hoards all its gold and builds zero towers. Game over on wave 1!</span>
            </div>
          </div>
        </div>

        <div className="bg-neon-blue/10 border border-neon-blue/30 rounded-lg p-3 text-sm text-blue-200">
          <strong>🌍 This happens in the real world too.</strong> YouTube recommends addictive content because it was rewarded for watch time. This is the same problem — at scale.
        </div>

        <p className="text-gray-400 text-sm text-center italic">
          Your goal is to design a reward function that avoids these traps.
        </p>
      </div>
    ),
  },
  {
    id: 'q-table',
    emoji: '🧠',
    title: 'The AI Brain: Q-Table',
    subtitle: 'A map of everything the AI has learned',
    accentColor: 'neon-blue',
    content: (
      <div className="space-y-5">
        <p className="text-gray-300 text-base leading-relaxed">
          Every time the AI makes a decision, it updates a giant lookup table called the <strong className="text-neon-blue">Q-Table</strong>. Each row is a game situation, each column is an action.
        </p>

        {/* Mini Q-table mockup */}
        <div className="overflow-hidden rounded-lg border border-white/10 text-[10px] font-mono">
          <div className="bg-cyber-dark/80 grid grid-cols-4 gap-px">
            <div className="bg-gray-800 p-2 text-gray-400 font-bold">State</div>
            <div className="bg-gray-800 p-2 text-center text-neon-blue">Build Tower</div>
            <div className="bg-gray-800 p-2 text-center text-neon-blue">Save Gold</div>
            <div className="bg-gray-800 p-2 text-center text-neon-blue">Upgrade</div>
            <div className="bg-black/40 p-2 text-gray-400">Wave 1, few enemies</div>
            <div className="bg-neon-green/10 p-2 text-center text-neon-green font-bold">+8.2</div>
            <div className="bg-black/20 p-2 text-center text-gray-500">+1.4</div>
            <div className="bg-black/20 p-2 text-center text-gray-500">+0.3</div>
            <div className="bg-black/40 p-2 text-gray-400">Wave 3, many enemies</div>
            <div className="bg-neon-green/20 p-2 text-center text-neon-green font-bold">+15.7</div>
            <div className="bg-neon-red/10 p-2 text-center text-neon-red">−4.1</div>
            <div className="bg-neon-green/10 p-2 text-center text-neon-green">+6.9</div>
          </div>
        </div>

        <p className="text-gray-300 text-sm leading-relaxed">
          The AI always picks the action with the highest Q-value for the current situation. You'll watch this table fill up — starting empty and slowly becoming the AI's strategy.
        </p>

        <div className="bg-neon-blue/10 border border-neon-blue/30 rounded-lg p-3 text-sm text-blue-200">
          <strong>✨ Higher = better.</strong> Green cells are actions the AI learned are good. Red cells are ones it learned to avoid.
        </div>
      </div>
    ),
  },
  {
    id: 'get-name',
    emoji: '👤',
    title: 'One Last Thing',
    subtitle: 'Your responses will be saved for class analysis',
    accentColor: 'neon-purple',
    content: null, // rendered separately
  },
  {
    id: 'mission',
    emoji: '🚀',
    title: "You're Ready!",
    subtitle: "Here's your mission for today",
    accentColor: 'neon-green',
    content: (
      <div className="space-y-4">
        <div className="space-y-3">
          {[
            { step: '1', icon: '🎨', title: 'Design your reward function', desc: 'Start with Simple Mode — pick Punish / Ignore / Reward for each event' },
            { step: '2', icon: '▶️', title: 'Run training', desc: 'Watch the AI play 100 games and learn from your rewards' },
            { step: '3', icon: '🧠', title: 'Observe the Q-Table', desc: 'See what strategies your AI developed' },
            { step: '4', icon: '💬', title: 'Reflect', desc: "After training, you'll be asked what you noticed — write honestly!" },
          ].map((item) => (
            <div key={item.step} className="flex items-start gap-4 bg-black/30 rounded-xl p-3 border border-white/5">
              <div className="w-8 h-8 rounded-full bg-neon-green/20 border border-neon-green/40 flex items-center justify-center text-neon-green font-bold text-sm shrink-0">
                {item.step}
              </div>
              <div>
                <div className="text-sm font-bold text-white flex items-center gap-2">
                  <span>{item.icon}</span> {item.title}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">{item.desc}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-neon-green/10 border border-neon-green/30 rounded-lg p-3 text-sm text-green-200 text-center">
          <strong>💡 Tip:</strong> Try a preset first (like "Balanced" or "Greedy Killer"), then experiment with your own!
        </div>
      </div>
    ),
  },
];

export const OnboardingTutorial = ({
  onComplete,
  studentName,
  onStudentNameChange,
}: OnboardingTutorialProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [localName, setLocalName] = useState(studentName);

  const slide = SLIDES[currentSlide];
  const isNameSlide = slide.id === 'get-name';
  const isFirst = currentSlide === 0;
  const isLast = currentSlide === SLIDES.length - 1;
  const canAdvance = isNameSlide ? localName.trim().length > 0 : true;

  const handleNext = () => {
    if (isNameSlide) {
      onStudentNameChange(localName);
      localStorage.setItem('rc_student_name', localName);
    }
    if (isLast) {
      localStorage.setItem('rc_tutorial_complete', 'true');
      onComplete();
    } else {
      setCurrentSlide((p) => p + 1);
    }
  };

  const handleBack = () => setCurrentSlide((p) => p - 1);

  const accentClasses: Record<string, { border: string; glow: string; text: string; bg: string; btn: string }> = {
    'neon-blue':   { border: 'border-neon-blue/40',   glow: 'shadow-[0_0_40px_rgba(6,182,212,0.12)]',     text: 'text-neon-blue',   bg: 'bg-neon-blue/10',   btn: 'bg-neon-blue hover:bg-cyan-400 text-black' },
    'neon-purple': { border: 'border-neon-purple/40', glow: 'shadow-[0_0_40px_rgba(139,92,246,0.12)]',   text: 'text-neon-purple', bg: 'bg-neon-purple/10', btn: 'bg-neon-purple hover:bg-purple-400 text-white' },
    'neon-green':  { border: 'border-neon-green/40',  glow: 'shadow-[0_0_40px_rgba(16,185,129,0.12)]',   text: 'text-neon-green',  bg: 'bg-neon-green/10',  btn: 'bg-neon-green hover:bg-emerald-400 text-black' },
    'neon-red':    { border: 'border-neon-red/40',    glow: 'shadow-[0_0_40px_rgba(244,63,94,0.12)]',    text: 'text-neon-red',    bg: 'bg-neon-red/10',    btn: 'bg-neon-red hover:bg-rose-400 text-white' },
    'neon-yellow': { border: 'border-neon-yellow/40', glow: 'shadow-[0_0_40px_rgba(245,158,11,0.12)]',   text: 'text-neon-yellow', bg: 'bg-neon-yellow/10', btn: 'bg-neon-yellow hover:bg-amber-400 text-black' },
  };

  const ac = accentClasses[slide.accentColor] || accentClasses['neon-blue'];

  return (
    <div className="fixed inset-0 bg-cyber-black z-[200] flex flex-col items-center justify-center p-6 animate-overlay-in">
      {/* Background grid */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(rgba(6,182,212,1) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,1) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}
      />

      {/* Header bar */}
      <div className="w-full max-w-2xl mb-4 flex items-center justify-between">
        <div className="text-xs text-gray-600 font-mono">RewardCraft — Onboarding</div>
        <div className="flex gap-1.5">
          {SLIDES.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === currentSlide
                  ? `w-6 ${ac.bg} border ${ac.border}`
                  : i < currentSlide
                  ? 'w-1.5 bg-gray-600'
                  : 'w-1.5 bg-gray-800'
              }`}
            />
          ))}
        </div>
        <div className="text-xs text-gray-600 font-mono">{currentSlide + 1} / {SLIDES.length}</div>
      </div>

      {/* Card */}
      <div className={`relative w-full max-w-2xl bg-gray-900 border ${ac.border} rounded-2xl ${ac.glow} animate-modal-in overflow-hidden`}>
        {/* Accent top bar */}
        <div className={`h-1 w-full ${ac.bg} border-b ${ac.border}`} />

        <div className="p-8">
          {/* Slide Header */}
          <div className="flex items-start gap-4 mb-6">
            <div className={`text-5xl p-3 rounded-2xl ${ac.bg} border ${ac.border} shrink-0`}>
              {slide.emoji}
            </div>
            <div>
              <h1 className={`text-2xl font-bold ${ac.text} leading-tight`}>{slide.title}</h1>
              {slide.subtitle && (
                <p className="text-gray-400 text-sm mt-1">{slide.subtitle}</p>
              )}
            </div>
          </div>

          {/* Slide Content */}
          <div className="min-h-[260px]">
            {isNameSlide ? (
              <div className="space-y-5">
                <p className="text-gray-300 text-base leading-relaxed">
                  Enter your name below. After each training run, you'll answer two quick reflection questions — your responses help the class learn together.
                </p>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Your Name or Student ID <span className="text-neon-red">*</span>
                  </label>
                  <input
                    type="text"
                    value={localName}
                    onChange={(e) => setLocalName(e.target.value)}
                    placeholder="e.g. Alex Johnson or Student #12"
                    autoFocus
                    onKeyDown={(e) => e.key === 'Enter' && canAdvance && handleNext()}
                    className="w-full bg-black/60 border border-gray-700 rounded-xl px-4 py-3 text-base text-gray-200 focus:outline-none focus:border-neon-purple focus:ring-1 focus:ring-neon-purple/50 transition-all"
                  />
                  {localName.trim().length === 0 && (
                    <p className="text-xs text-gray-600 mt-2 italic">Required to track your progress</p>
                  )}
                </div>
                <div className="bg-black/30 rounded-xl border border-white/5 p-4 text-sm text-gray-400">
                  🔒 Your name is only used for class analysis — it's stored locally and not shared outside this tool.
                </div>
              </div>
            ) : (
              slide.content
            )}
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-white/5">
            <button
              onClick={handleBack}
              disabled={isFirst}
              className="px-5 py-2.5 rounded-lg text-sm font-medium text-gray-500 hover:text-gray-300 disabled:opacity-0 transition-all"
            >
              ← Back
            </button>

            <div className="flex items-center gap-3">
              {!isFirst && (
                <button
                  onClick={() => {
                    localStorage.setItem('rc_tutorial_complete', 'true');
                    onComplete();
                  }}
                  className="text-xs text-gray-600 hover:text-gray-400 transition-colors underline"
                >
                  Skip tutorial
                </button>
              )}
              <button
                onClick={handleNext}
                disabled={!canAdvance}
                className={`px-7 py-2.5 rounded-xl text-sm font-bold shadow-lg transition-all transform hover:scale-[1.03] disabled:opacity-40 disabled:scale-100 disabled:cursor-not-allowed ${ac.btn}`}
              >
                {isLast ? '🚀 Enter RewardCraft' : isNameSlide ? 'Save & Continue →' : 'Next →'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer note */}
      <p className="text-[10px] text-gray-700 mt-4">
        You can restart this tutorial anytime from the header menu.
      </p>
    </div>
  );
};
