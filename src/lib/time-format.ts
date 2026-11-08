import { ClockFormat } from '@/types/display';

export interface FormattedTimeParts {
  hours: number;
  minutes: number;
  seconds: number;
  formatted: string;
  sign: '' | '-' | '+';
  hasHours: boolean;
}

/**
 * Format raw seconds (can be positive, zero, or negative) into display components.
 * When negative (in overtime), counts up additional time with a '+' prefix (Stagetimer style).
 */
export function formatSecondsToTime(
  totalSeconds: number,
  forceHours = false,
  overtimeSign: '+' | '-' = '+'
): FormattedTimeParts {
  const isNegative = totalSeconds < 0;
  const absSeconds = Math.abs(Math.floor(totalSeconds));

  const hours = Math.floor(absSeconds / 3600);
  const minutes = Math.floor((absSeconds % 3600) / 60);
  const seconds = absSeconds % 60;

  const pad = (num: number): string => num.toString().padStart(2, '0');

  const sign: '' | '-' | '+' = isNegative ? overtimeSign : '';
  // When in overtime, format as +MM:SS (e.g. +00:20) unless overtime itself exceeds an hour
  const hasHours = hours > 0 || (!isNegative && forceHours);

  const formatted = hasHours
    ? `${sign}${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
    : `${sign}${pad(minutes)}:${pad(seconds)}`;

  return {
    hours,
    minutes,
    seconds,
    formatted,
    sign,
    hasHours,
  };
}

/**
 * Convert hours, minutes, seconds into total seconds.
 */
export function timeToSeconds(hours = 0, minutes = 0, seconds = 0): number {
  const safeHours = Math.max(0, Math.floor(hours || 0));
  const safeMinutes = Math.max(0, Math.floor(minutes || 0));
  const safeSeconds = Math.max(0, Math.floor(seconds || 0));
  return safeHours * 3600 + safeMinutes * 60 + safeSeconds;
}

/**
 * Format real-world clock time based on format settings.
 */
export function formatRealWorldClock(
  date: Date,
  format: ClockFormat = '12h',
  showSeconds = true,
  showDate = false
): { time: string; period?: string; dateStr?: string } {
  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');

  let period: string | undefined = undefined;

  if (format === '12h') {
    period = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    if (hours === 0) hours = 12;
  }

  const hoursStr = hours.toString().padStart(2, '0');
  const time = showSeconds ? `${hoursStr}:${minutes}:${seconds}` : `${hoursStr}:${minutes}`;

  let dateStr: string | undefined = undefined;
  if (showDate) {
    dateStr = date.toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  return { time, period, dateStr };
}
