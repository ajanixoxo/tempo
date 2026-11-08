import React from 'react';
import { TimerCalculatedState } from '@/types/timer';
import { DisplaySettings } from '@/types/display';
import { DigitalTime } from '../shared/digital-time';

interface TimerDisplayProps {
  calculated: TimerCalculatedState;
  settings: DisplaySettings;
  title?: string;
  isCountup?: boolean;
}

export const TimerDisplay: React.FC<TimerDisplayProps> = ({
  calculated,
  settings,
  title,
}) => {
  const { appearance, visibility, warnings } = settings;

  const getTimerVariant = () => {
    if (calculated.isCompleted && !calculated.isNegative) return 'completed';
    if (calculated.isUrgent) return 'urgent';
    if (calculated.isWarning || calculated.isOverTarget) return 'warning';
    return 'custom';
  };

  const getCustomColor = () => {
    if (calculated.isCompleted && !calculated.isNegative) return warnings.completionColor;
    if (calculated.isUrgent) return warnings.urgentColor;
    if (calculated.isWarning || calculated.isOverTarget) return warnings.warningColor;
    return appearance.timerColor;
  };

  const isFlashing =
    (calculated.isUrgent && warnings.flashOnUrgent) ||
    (calculated.isCompleted && warnings.flashOnCompletion && !calculated.isNegative);

  const timerScale = appearance.timerScale ?? 100;

  return (
    <div className="flex flex-col items-center justify-center text-center w-full max-w-none px-4 sm:px-8 select-none">
      {/* Session Title (when enabled and mode shows title) */}
      {visibility.showTitle && title && (
        <h2 className="text-xl sm:text-3xl md:text-5xl font-normal tracking-tight text-zinc-400 mb-4 sm:mb-8 max-w-5xl truncate px-4">
          {title}
        </h2>
      )}

      {/* Hero Timer with Custom Scale */}
      <div className="relative flex items-center justify-center w-full overflow-hidden">
        <DigitalTime
          formattedTime={calculated.formattedTime}
          size="hero"
          scale={timerScale}
          variant={getTimerVariant()}
          customColor={getCustomColor()}
          isFlashing={isFlashing}
          className={`${
            appearance.fontFamily === 'mono'
              ? 'font-mono'
              : appearance.fontFamily === 'serif'
              ? 'font-serif'
              : 'font-sans'
          }`}
        />
      </div>

      {/* Minimal Progress Line */}
      {visibility.showProgress && (
        <div className="w-full max-w-2xl mt-8 sm:mt-12 px-6">
          <div className="h-[2px] w-full bg-zinc-900 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                calculated.isUrgent
                  ? 'bg-red-500'
                  : calculated.isWarning || calculated.isOverTarget
                  ? 'bg-amber-400'
                  : 'bg-zinc-400'
              }`}
              style={{
                width: `${Math.min(100, Math.round(calculated.progress * 100))}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Overtime or Ended Indicators */}
      {calculated.isNegative && (
        <div className="mt-6 flex items-center justify-center gap-2 text-sm sm:text-base font-mono tracking-widest text-red-400 uppercase">
          <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
          <span>Overtime ({calculated.formattedTime})</span>
        </div>
      )}

      {calculated.isCompleted && !calculated.isNegative && (
        <div className="mt-6 text-sm sm:text-base font-mono tracking-widest text-zinc-500 uppercase">
          Time Up
        </div>
      )}
    </div>
  );
};
