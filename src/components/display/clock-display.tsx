import React, { useEffect, useState } from 'react';
import { ClockSettings } from '@/types/display';
import { formatRealWorldClock } from '@/lib/time-format';

interface ClockDisplayProps {
  settings: ClockSettings;
  size?: 'normal' | 'hero';
  scale?: number;
}

export const ClockDisplay: React.FC<ClockDisplayProps> = ({ settings, size = 'normal', scale = 100 }) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 500);

    return () => clearInterval(timer);
  }, []);

  const { time, period, dateStr } = formatRealWorldClock(
    currentDate,
    settings.format,
    settings.showSeconds,
    settings.showDate
  );

  if (size === 'hero') {
    const multiplier = Math.max(0.3, scale / 100);
    const vwSize = (18 * multiplier).toFixed(2);
    const heroStyle: React.CSSProperties = {
      fontSize: `clamp(3rem, ${vwSize}vw, 70vh)`,
      lineHeight: '0.95',
      whiteSpace: 'nowrap',
    };

    return (
      <div className="flex flex-col items-center justify-center text-center p-6 select-none w-full max-w-none">
        {dateStr && (
          <div className="text-lg sm:text-xl font-normal text-zinc-500 mb-4 tracking-widest uppercase font-mono">
            {dateStr}
          </div>
        )}
        <div className="flex items-baseline justify-center gap-4 overflow-hidden w-full">
          <span
            style={heroStyle}
            className="font-mono font-light tracking-tighter text-zinc-100 tabular-nums inline-block"
          >
            {time}
          </span>
          {period && (
            <span className="text-2xl sm:text-5xl font-normal text-zinc-500 uppercase font-mono">
              {period}
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 font-mono text-zinc-400 text-sm tabular-nums select-none bg-zinc-900/40 px-3 py-1 rounded-md">
      {dateStr && <span className="text-zinc-500 mr-1 hidden sm:inline">{dateStr} •</span>}
      <span className="text-zinc-200">{time}</span>
      {period && <span className="text-xs text-zinc-500">{period}</span>}
    </div>
  );
};
