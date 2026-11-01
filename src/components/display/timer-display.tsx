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
  isCountup = false,
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

  return (
    <div className="flex flex-col items-center justify-center text-center w-full max-w-7xl mx-auto px-4 select-none">
      {/* Session Title (when enabled and mode shows title) */}
      {visibility.showTitle && title && (
        <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold tracking-tight text-slate-300 mb-4 sm:mb-8 max-w-4xl truncate px-4">
          {title}
        </h2>
      )}

      {/* Giant Hero Timer */}
      <div className="relative flex items-center justify-center">
        <DigitalTime
          formattedTime={calculated.formattedTime}
          size="hero"
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

      {/* Progress Bar (when enabled) */}
      {visibility.showProgress && (
        <div className="w-full max-w-3xl mt-8 sm:mt-12 px-6">
          <div className="h-3 sm:h-4 w-full bg-slate-800/80 rounded-full overflow-hidden border border-slate-700/60 shadow-inner">
            <div
              className={`h-full transition-all duration-300 ${
                calculated.isUrgent
                  ? 'bg-rose-500'
                  : calculated.isWarning || calculated.isOverTarget
                  ? 'bg-amber-400'
                  : 'bg-blue-500'
              }`}
              style={{
                width: `${Math.min(100, Math.round(calculated.progress * 100))}%`,
                backgroundColor:
                  calculated.isUrgent
                    ? warnings.urgentColor
                    : calculated.isWarning
                    ? warnings.warningColor
                    : appearance.accentColor,
              }}
            />
          </div>
        </div>
      )}

      {/* Overtime or Completed Indicators */}
      {calculated.isNegative && (
        <div className="mt-6 px-4 py-1.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-sm sm:text-base font-semibold animate-pulse">
          OVERTIME
        </div>
      )}

      {calculated.isCompleted && !calculated.isNegative && (
        <div className="mt-6 px-4 py-1.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-sm sm:text-base font-semibold">
          TIME UP
        </div>
      )}
    </div>
  );
};
