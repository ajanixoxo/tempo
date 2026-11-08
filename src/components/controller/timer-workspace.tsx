import React, { useEffect, useState } from 'react';
import { TimerModel } from '@/types/timer';
import { calculateTimerState } from '@/lib/timer-engine';
import { DigitalTime } from '@/components/shared/digital-time';
import { TimerControls } from './timer-controls';
import { TimeAdjustment } from './time-adjustment';
import { useDisplayStore } from '@/stores/display-store';

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
        <p className="text-xs font-mono text-zinc-500">Select or create a timer to begin.</p>
      </div>
    );
  }

  const calculated = calculateTimerState(timer, renderTime, warnings);

  const getVisualVariant = () => {
    if (calculated.isNegative) return 'urgent';
    if (calculated.isCompleted && !calculated.isNegative) return 'completed';
    if (calculated.isUrgent) return 'urgent';
    if (calculated.isWarning || calculated.isOverTarget) return 'warning';
    return 'default';
  };

  const getStatusText = () => {
    if (calculated.isNegative) {
      return (
        <span className="text-red-400 font-mono text-xs flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
          {timer.status === 'running' ? 'Overtime' : 'Overtime (Paused)'} ({calculated.formattedTime})
        </span>
      );
    }
    if (calculated.isCompleted && timer.allowNegative === false) {
      return <span className="text-zinc-500 font-mono text-xs">Ended</span>;
    }
    if (timer.status === 'running') {
      return <span className="text-emerald-400 font-mono text-xs">Running</span>;
    }
    if (timer.status === 'paused') {
      return <span className="text-amber-400 font-mono text-xs">Paused</span>;
    }
    return <span className="text-zinc-500 font-mono text-xs">Ready</span>;
  };

  return (
    <div className="flex-1 min-w-0 flex flex-col justify-between p-6 sm:p-10 md:p-12 overflow-y-auto bg-tempo-bg select-none">
      {/* Session Title Header */}
      <div className="flex items-baseline justify-between border-b border-tempo-hairline pb-4">
        <div className="flex items-baseline gap-3">
          <h2 className="text-lg font-medium text-white tracking-tight">
            {timer.name}
          </h2>
          {getStatusText()}
        </div>

        <div className="flex items-center gap-3 text-xs font-mono text-zinc-500">
          <span className="capitalize">{timer.type}</span>
          {timer.timeAdjustment !== 0 && (
            <span>
              {timer.timeAdjustment > 0 ? `+${timer.timeAdjustment}s` : `${timer.timeAdjustment}s`}
            </span>
          )}
        </div>
      </div>

      {/* Hero Display */}
      <div className="my-auto py-12 flex flex-col items-center justify-center text-center">
        <div className="relative">
          <DigitalTime
            formattedTime={calculated.formattedTime}
            size="2xl"
            weight="bold"
            animationMode="fluid"
            variant={getVisualVariant()}
            isFlashing={calculated.isUrgent && warnings.flashOnUrgent}
          />
        </div>

        {/* Progress Bar with Prominent Height */}
        {(timer.type === 'countdown' || (timer.type === 'countup' && timer.targetDuration)) && (
          <div className="w-full max-w-lg mt-8 px-2">
            <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500 mb-1.5">
              <span>Progress</span>
              <span>{Math.min(100, Math.max(0, Math.round(calculated.progress * 100)))}%</span>
            </div>
            <div className="h-3 w-full bg-tempo-surface rounded-full overflow-hidden">
              <div
                className={`h-full transition-[width] duration-1000 ease-linear ${
                  calculated.isUrgent
                    ? 'bg-red-500'
                    : calculated.isWarning || calculated.isOverTarget
                    ? 'bg-amber-400'
                    : 'bg-zinc-200'
                } ${calculated.isNegative ? 'bg-red-500 animate-overtime-beacon' : ''}`}
                style={{
                  width: calculated.isNegative
                    ? '100%'
                    : `${Math.min(100, Math.max(0, Math.round(calculated.progress * 100)))}%`,
                }}
              />
            </div>
          </div>
        )}

        {/* Primary Controls */}
        <div className="mt-10 w-full">
          <TimerControls
            status={timer.status}
            canStart={
              timer.type === 'countdown'
                ? timer.allowNegative !== false || calculated.currentSeconds > 0
                : true
            }
            onStart={onStart}
            onPause={onPause}
            onResume={onResume}
            onReset={onReset}
          />
        </div>
      </div>

      {/* Bottom: Minimal Adjustment Bar */}
      <div className="border-t border-tempo-hairline pt-4 max-w-xl mx-auto w-full">
        <TimeAdjustment onAdjust={onAdjust} />
      </div>
    </div>
  );
};
