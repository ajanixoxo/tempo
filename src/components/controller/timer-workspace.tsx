import React, { useEffect, useState } from 'react';
import { TimerModel } from '@/types/timer';
import { calculateTimerState } from '@/lib/timer-engine';
import { DigitalTime } from '@/components/shared/digital-time';
import { TimerControls } from './timer-controls';
import { TimeAdjustment } from './time-adjustment';
import { useDisplayStore } from '@/stores/display-store';
import { AlertCircle, Clock, CheckCircle, Flame } from 'lucide-react';

interface TimerWorkspaceProps {
  timer: TimerModel | null;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
  onAdjust: (seconds: number) => void;
  onTick: () => void;
}

export const TimerWorkspace: React.FC<TimerWorkspaceProps> = ({
  timer,
  onStart,
  onPause,
  onResume,
  onReset,
  onAdjust,
  onTick,
}) => {
  const warnings = useDisplayStore((state) => state.settings.warnings);
  const [renderTime, setRenderTime] = useState<number>(Date.now());

  // High-frequency UI tick loop (updates display smoothly while running)
  useEffect(() => {
    if (!timer || timer.status !== 'running') {
      return;
    }

    const interval = setInterval(() => {
      setRenderTime(Date.now());
      onTick();
    }, 100);

    return () => clearInterval(interval);
  }, [timer, onTick]);

  if (!timer) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-tempo-bg">
        <div className="w-16 h-16 rounded-2xl bg-tempo-card border border-tempo-border flex items-center justify-center text-slate-400 mb-4">
          <Clock className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-1">No timer selected</h3>
        <p className="text-xs text-slate-400 max-w-sm">
          Select a timer from the library on the left or create a new timer to get started.
        </p>
      </div>
    );
  }

  const calculated = calculateTimerState(timer, renderTime, warnings);

  const getVisualVariant = () => {
    if (calculated.isCompleted && !calculated.isNegative) return 'completed';
    if (calculated.isUrgent) return 'urgent';
    if (calculated.isWarning || calculated.isOverTarget) return 'warning';
    return 'default';
  };

  const getStatusBadge = () => {
    if (calculated.isCompleted && !timer.allowNegative) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs font-semibold">
          <CheckCircle className="w-3.5 h-3.5" />
          Completed
        </span>
      );
    }
    if (calculated.isNegative) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold animate-pulse">
          <AlertCircle className="w-3.5 h-3.5" />
          Overtime ({calculated.formattedTime})
        </span>
      );
    }
    if (timer.status === 'running') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Running
        </span>
      );
    }
    if (timer.status === 'paused') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          Paused
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-xs font-medium">
        Ready
      </span>
    );
  };

  return (
    <div className="flex-1 flex flex-col justify-between p-6 sm:p-8 overflow-y-auto bg-tempo-bg">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-tempo-border/50 pb-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {timer.name}
            </h2>
            {getStatusBadge()}
          </div>
          {timer.description && (
            <p className="text-xs text-slate-400 mt-1">{timer.description}</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono uppercase px-2.5 py-1 rounded-md bg-tempo-surface border border-tempo-border text-slate-300">
            {timer.type}
          </span>
          {timer.timeAdjustment !== 0 && (
            <span
              className={`text-xs font-mono px-2.5 py-1 rounded-md border ${
                timer.timeAdjustment > 0
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
              }`}
            >
              {timer.timeAdjustment > 0 ? `+${timer.timeAdjustment}s` : `${timer.timeAdjustment}s`}
            </span>
          )}
        </div>
      </div>

      {/* Center Stage: Giant Digital Timer */}
      <div className="my-auto py-8 sm:py-12 flex flex-col items-center justify-center text-center">
        {/* Warning Alert Banner if urgent */}
        {calculated.isUrgent && (
          <div className="mb-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-semibold animate-bounce">
            <Flame className="w-4 h-4 text-rose-400" />
            <span>Time is almost up! Under 1 minute remaining.</span>
          </div>
        )}

        {calculated.isOverTarget && timer.type === 'countup' && (
          <div className="mb-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-semibold">
            <AlertCircle className="w-4 h-4 text-amber-400" />
            <span>Target duration exceeded.</span>
          </div>
        )}

        <div className="relative py-4 px-8 rounded-3xl bg-tempo-card/40 border border-tempo-border/40 shadow-2xl">
          <DigitalTime
            formattedTime={calculated.formattedTime}
            size="2xl"
            variant={getVisualVariant()}
            isFlashing={calculated.isUrgent && warnings.flashOnUrgent}
          />
        </div>

        {/* Progress Bar (countdown or countup target) */}
        {(timer.type === 'countdown' || (timer.type === 'countup' && timer.targetDuration)) && (
          <div className="w-full max-w-xl mt-6 px-4">
            <div className="h-2 w-full bg-tempo-surface rounded-full overflow-hidden border border-tempo-border/40">
              <div
                className={`h-full transition-all duration-300 ${
                  calculated.isUrgent
                    ? 'bg-rose-500'
                    : calculated.isWarning || calculated.isOverTarget
                    ? 'bg-amber-400'
                    : 'bg-blue-500'
                }`}
                style={{ width: `${Math.min(100, Math.round(calculated.progress * 100))}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] font-mono text-slate-400 mt-1.5">
              <span>0%</span>
              <span>{Math.round(calculated.progress * 100)}%</span>
              <span>100%</span>
            </div>
          </div>
        )}

        {/* Primary Controls */}
        <div className="mt-8 w-full">
          <TimerControls
            status={timer.status}
            canStart={
              timer.type === 'countdown'
                ? calculated.currentSeconds > 0 || timer.allowNegative
                : true
            }
            onStart={onStart}
            onPause={onPause}
            onResume={onResume}
            onReset={onReset}
          />
        </div>
      </div>

      {/* Bottom Area: Live Adjustment */}
      <div className="border-t border-tempo-border/50 pt-4 max-w-xl mx-auto w-full">
        <TimeAdjustment onAdjust={onAdjust} />
      </div>
    </div>
  );
};
