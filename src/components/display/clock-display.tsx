import React, { useEffect, useState } from 'react';
import { ClockSettings } from '@/types/display';
import { formatRealWorldClock } from '@/lib/time-format';

interface ClockDisplayProps {
  settings: ClockSettings;
  size?: 'normal' | 'hero';
}

export const ClockDisplay: React.FC<ClockDisplayProps> = ({ settings, size = 'normal' }) => {
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
    return (
      <div className="flex flex-col items-center justify-center text-center p-6 select-none">
        {dateStr && (
          <div className="text-xl sm:text-2xl font-medium text-slate-400 mb-4 tracking-wide uppercase">
            {dateStr}
          </div>
        )}
        <div className="flex items-baseline justify-center gap-3">
          <span className="font-mono text-[12vw] sm:text-[14vw] font-black tracking-tighter text-white tabular-nums leading-none">
            {time}
          </span>
          {period && (
            <span className="text-3xl sm:text-5xl font-bold text-slate-400 uppercase font-mono">
              {period}
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 font-mono text-slate-300 text-sm sm:text-base tabular-nums select-none bg-slate-900/60 px-3.5 py-1.5 rounded-xl border border-slate-700/50 backdrop-blur-md">
      {dateStr && <span className="text-slate-400 mr-1 hidden sm:inline">{dateStr} •</span>}
      <span className="font-bold text-white">{time}</span>
      {period && <span className="text-xs text-slate-400">{period}</span>}
    </div>
  );
};
