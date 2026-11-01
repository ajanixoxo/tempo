import React from 'react';
import { TimerStatus } from '@/types/timer';
import { Play, Pause, RotateCcw } from 'lucide-react';

interface TimerControlsProps {
  status: TimerStatus;
  canStart: boolean;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
}

export const TimerControls: React.FC<TimerControlsProps> = ({
  status,
  canStart,
  onStart,
  onPause,
  onResume,
  onReset,
}) => {
  const isRunning = status === 'running';
  const isPaused = status === 'paused';

  return (
    <div className="flex items-center gap-3 w-full max-w-md mx-auto">
      {/* Primary Action Button (Start / Pause / Resume) */}
      {isRunning ? (
        <button
          onClick={onPause}
          className="flex-1 py-4 px-6 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 transition-all shadow-xl shadow-amber-500/20 active:scale-98"
          title="Pause timer (Space)"
        >
          <Pause className="w-5 h-5 fill-current" />
          <span>PAUSE</span>
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-black/20 text-[10px] uppercase font-mono font-normal">
            Space
          </kbd>
        </button>
      ) : isPaused ? (
        <button
          onClick={onResume}
          className="flex-1 py-4 px-6 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 transition-all shadow-xl shadow-emerald-500/20 active:scale-98"
          title="Resume timer (Space)"
        >
          <Play className="w-5 h-5 fill-current" />
          <span>RESUME</span>
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-black/20 text-[10px] uppercase font-mono font-normal">
            Space
          </kbd>
        </button>
      ) : (
        <button
          onClick={onStart}
          disabled={!canStart}
          className="flex-1 py-4 px-6 rounded-2xl bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 transition-all shadow-xl shadow-blue-600/25 disabled:shadow-none active:scale-98"
          title="Start timer (Space)"
        >
          <Play className="w-5 h-5 fill-current" />
          <span>START</span>
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-white/20 text-[10px] uppercase font-mono font-normal">
            Space
          </kbd>
        </button>
      )}

      {/* Reset Button */}
      <button
        onClick={onReset}
        disabled={status === 'idle'}
        className="px-5 py-4 rounded-2xl bg-tempo-surface hover:bg-tempo-border/80 border border-tempo-border disabled:opacity-40 disabled:cursor-not-allowed text-slate-200 hover:text-white font-semibold text-sm flex items-center gap-2 transition-all active:scale-98"
        title="Reset timer (R)"
      >
        <RotateCcw className="w-4 h-4" />
        <span>Reset</span>
        <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-tempo-card text-[10px] uppercase font-mono font-normal text-slate-400">
          R
        </kbd>
      </button>
    </div>
  );
};
