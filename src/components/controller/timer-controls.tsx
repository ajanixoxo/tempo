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
    <div className="flex items-center justify-center gap-3 w-full max-w-sm mx-auto">
      {/* Primary Action Button (Start / Pause / Resume) */}
      {isRunning ? (
        <button
          onClick={onPause}
          className="flex-1 py-3 px-6 rounded-lg bg-tempo-surface hover:bg-tempo-hover text-amber-400 font-medium text-sm flex items-center justify-center gap-2 transition-colors active:scale-98"
          title="Pause timer (Space)"
        >
          <Pause className="w-4 h-4 fill-current" />
          <span>Pause</span>
          <span className="text-[10px] text-zinc-500 font-mono ml-1">Space</span>
        </button>
      ) : isPaused ? (
        <button
          onClick={onResume}
          className="flex-1 py-3 px-6 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 font-medium text-sm flex items-center justify-center gap-2 transition-colors active:scale-98"
          title="Resume timer (Space)"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>Resume</span>
          <span className="text-[10px] text-zinc-500 font-mono ml-1">Space</span>
        </button>
      ) : (
        <button
          onClick={onStart}
          disabled={!canStart}
          className="flex-1 py-3 px-6 rounded-lg bg-zinc-100 hover:bg-white disabled:bg-zinc-800 disabled:text-zinc-600 text-zinc-950 font-medium text-sm flex items-center justify-center gap-2 transition-colors active:scale-98"
          title="Start timer (Space)"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>Start</span>
          <span className="text-[10px] text-zinc-500 font-mono ml-1">Space</span>
        </button>
      )}

      {/* Reset Button */}
      <button
        onClick={onReset}
        disabled={status === 'idle'}
        className="px-4 py-3 rounded-lg bg-tempo-surface hover:bg-tempo-hover disabled:opacity-30 disabled:cursor-not-allowed text-zinc-400 hover:text-zinc-200 text-sm flex items-center gap-1.5 transition-colors"
        title="Reset timer (R)"
      >
        <RotateCcw className="w-3.5 h-3.5" />
        <span>Reset</span>
      </button>
    </div>
  );
};
