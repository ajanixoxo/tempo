export type TimerType = 'countdown' | 'countup';

export type TimerStatus = 'idle' | 'running' | 'paused' | 'completed';

export interface TimerModel {
  id: string;
  name: string;
  description?: string;
  type: TimerType;
  initialDuration: number; // in seconds
  allowNegative: boolean; // default false for countdown
  targetDuration?: number; // optional target duration in seconds for count-up
  status: TimerStatus;
  startedAt: number | null; // Date.now() timestamp when timer transitioned to running
  accumulatedElapsed: number; // seconds accumulated before current run segment
  timeAdjustment: number; // net live adjustments (+ / - seconds)
  completedAt: number | null; // Date.now() timestamp when timer completed
  createdAt: number;
  updatedAt: number;
}

export interface TimerCalculatedState {
  currentSeconds: number; // remaining seconds for countdown, elapsed seconds for count-up
  rawSeconds: number; // exact floating point before rounding
  progress: number; // 0 to 1 (or 0 to 1+ for over-target)
  isNegative: boolean; // true if countdown is past 0 into negative/overtime
  isWarning: boolean; // true if within warning threshold
  isUrgent: boolean; // true if within urgent threshold
  isCompleted: boolean;
  isOverTarget: boolean; // true for count-up past target
  overtimeSeconds: number; // additional seconds used past 0 in overtime
  formattedTime: string; // "+MM:SS" (in overtime) or "MM:SS" or "HH:MM:SS"
  hours: number;
  minutes: number;
  seconds: number;
  sign: '' | '-' | '+';
}

export interface CreateTimerInput {
  name: string;
  description?: string;
  type: TimerType;
  hours: number;
  minutes: number;
  seconds: number;
  allowNegative?: boolean;
  targetHours?: number;
  targetMinutes?: number;
  targetSeconds?: number;
}

export interface UpdateTimerInput {
  name?: string;
  description?: string;
  type?: TimerType;
  hours?: number;
  minutes?: number;
  seconds?: number;
  allowNegative?: boolean;
  targetHours?: number;
  targetMinutes?: number;
  targetSeconds?: number;
}
