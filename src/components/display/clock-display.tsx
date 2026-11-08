import React, { useEffect, useState } from 'react';
import { ClockSettings, DisplayFontFamily, DisplayFontWeight } from '@/types/display';
import { formatRealWorldClock } from '@/lib/time-format';

interface ClockDisplayProps {
  settings: ClockSettings;
  size?: 'normal' | 'hero';
  scale?: number;
  fontFamily?: DisplayFontFamily;
  fontWeight?: DisplayFontWeight;
}

export const ClockDisplay: React.FC<ClockDisplayProps> = ({
  settings,
  size = 'normal',
  scale = 100,
  fontFamily = 'mono',
  fontWeight = 'bold',
}) => {
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

  const getFontFamilyClass = () => {
    switch (fontFamily) {
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

  const getWeightClass = () => {
    switch (fontWeight) {
      case 'normal':
        return 'font-normal';
      case 'semibold':
        return 'font-semibold';
      case 'extrabold':
        return 'font-extrabold';
      case 'black':
        return 'font-black';
      case 'bold':
      default:
        return 'font-bold';
    }
  };

  if (size === 'hero') {
    const multiplier = Math.max(0.3, scale / 100);
    const len = time.length;
    let baseVw = 28;
    if (len <= 5) baseVw = 28;
    else if (len <= 6) baseVw = 24.5;
    else if (len <= 8) baseVw = 18.5;
    else baseVw = 16;
    const vwSize = (baseVw * multiplier).toFixed(2);
    const heroStyle: React.CSSProperties = {
      fontSize: `clamp(4rem, ${vwSize}vw, 75vh)`,
      lineHeight: '0.92',
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
            className={`${getFontFamilyClass()} ${getWeightClass()} tracking-tight text-zinc-100 tabular-nums inline-block`}
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
