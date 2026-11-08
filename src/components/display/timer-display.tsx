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

  const getFontFamilyClass = () => {
    switch (appearance.fontFamily) {
      case 'condensed':
        return 'font-condensed';
      case 'impact':
        return 'font-impact';
      case 'sans':
        return 'font-sans';
      case 'serif':
        return 'font-serif';
      case 'mono':
      default:
        return 'font-mono';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center text-center w-full max-w-none px-4 sm:px-8 select-none">
      {/* Session Title (when enabled and mode shows title) */}
      {visibility.showTitle && title && (
        <h2 className="text-sm sm:text-lg md:text-2xl font-medium tracking-wider text-sky-400 uppercase mb-2 sm:mb-4 max-w-5xl truncate px-4">
          {title}
        </h2>
      )}

      {/* Hero Timer with Custom Scale & Bold Weight */}
      <div className="relative flex items-center justify-center w-full overflow-hidden">
        <DigitalTime
          formattedTime={calculated.formattedTime}
          size="hero"
          scale={timerScale}
          weight={appearance.fontWeight || 'bold'}
          animationMode={appearance.animationMode || 'fluid'}
          variant={getTimerVariant()}
          customColor={getCustomColor()}
          isFlashing={isFlashing}
          className={getFontFamilyClass()}
        />
      </div>

      {/* Overtime or Ended Indicators */}
      {calculated.isNegative && (
        <div className="mt-6 flex items-center justify-center gap-2 text-sm sm:text-base font-mono tracking-widest text-red-400 uppercase animate-overtime-beacon">
          <span className="w-2.5 h-2.5 rounded-full bg-red-400 animate-pulse" />
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
