import { TimerCalculatedState, TimerModel } from '@/types/timer';
import { WarningSettings } from '@/types/display';
import { formatSecondsToTime } from './time-format';

export const DEFAULT_WARNING_SETTINGS: WarningSettings = {
  warningThresholdSeconds: 300, // 5 minutes
  urgentThresholdSeconds: 60, // 1 minute
  warningColor: '#F59E0B',
  urgentColor: '#EF4444',
  completionColor: '#DC2626',
  flashOnUrgent: true,
  flashOnCompletion: true,
};

/**
 * Pure calculation of the current timer state based on timestamps.
 * Does not mutate the timer.
 */
export function calculateTimerState(
  timer: TimerModel,
  now: number = Date.now(),
  warningSettings: WarningSettings = DEFAULT_WARNING_SETTINGS
): TimerCalculatedState {
  if (timer.type === 'countdown') {
    return calculateCountdownState(timer, now, warningSettings);
  } else {
    return calculateCountupState(timer, now, warningSettings);
  }
}

function calculateCountdownState(
  timer: TimerModel,
  now: number,
  warnings: WarningSettings
): TimerCalculatedState {
  const effectiveDuration = timer.initialDuration + timer.timeAdjustment;

  let elapsed = timer.accumulatedElapsed;
  if (timer.status === 'running' && timer.startedAt !== null) {
    const segmentSeconds = Math.max(0, (now - timer.startedAt) / 1000);
    elapsed += segmentSeconds;
  }

  const rawRemaining = effectiveDuration - elapsed;

  let currentSeconds: number;
  let isNegative = false;
  let isCompleted = timer.status === 'completed';
  let overtimeSeconds = 0;

  if (rawRemaining <= 0) {
    if (timer.allowNegative) {
      currentSeconds = Math.floor(rawRemaining);
      isNegative = true;
      isCompleted = true;
      overtimeSeconds = Math.abs(currentSeconds);
    } else {
      currentSeconds = 0;
      isCompleted = true;
    }
  } else {
    // Math.ceil gives natural countdown tick: at 59.9s remaining, user sees 60s until it hits 59.0s -> 59s
    currentSeconds = Math.ceil(rawRemaining);
  }

  const isWarning =
    timer.status !== 'idle' &&
    !isCompleted &&
    currentSeconds <= warnings.warningThresholdSeconds &&
    currentSeconds > warnings.urgentThresholdSeconds;

  const isUrgent =
    timer.status !== 'idle' &&
    !isCompleted &&
    currentSeconds <= warnings.urgentThresholdSeconds &&
    currentSeconds > 0;

  const totalForProgress = Math.max(1, effectiveDuration);
  const progressRatio = isNegative
    ? 1
    : Math.min(1, Math.max(0, (effectiveDuration - rawRemaining) / totalForProgress));

  const timeParts = formatSecondsToTime(currentSeconds, effectiveDuration >= 3600, '+');

  return {
    currentSeconds,
    rawSeconds: rawRemaining,
    progress: progressRatio,
    isNegative,
    isWarning,
    isUrgent,
    isCompleted,
    isOverTarget: false,
    overtimeSeconds,
    formattedTime: timeParts.formatted,
    hours: timeParts.hours,
    minutes: timeParts.minutes,
    seconds: timeParts.seconds,
    sign: timeParts.sign,
  };
}

function calculateCountupState(
  timer: TimerModel,
  now: number,
  _warnings: WarningSettings
): TimerCalculatedState {
  let elapsed = timer.accumulatedElapsed + timer.timeAdjustment;
  if (timer.status === 'running' && timer.startedAt !== null) {
    const segmentSeconds = Math.max(0, (now - timer.startedAt) / 1000);
    elapsed += segmentSeconds;
  }

  elapsed = Math.max(0, elapsed);
  const rawSeconds = elapsed;
  const currentSeconds = Math.floor(rawSeconds);

  let isOverTarget = false;
  let progressRatio = 0;

  if (timer.targetDuration && timer.targetDuration > 0) {
    progressRatio = Math.min(1, elapsed / timer.targetDuration);
    if (elapsed >= timer.targetDuration) {
      isOverTarget = true;
    }
  }

  const timeParts = formatSecondsToTime(
    currentSeconds,
    (timer.targetDuration && timer.targetDuration >= 3600) || currentSeconds >= 3600
  );

  return {
    currentSeconds,
    rawSeconds,
    progress: progressRatio,
    isNegative: false,
    isWarning: isOverTarget,
    isUrgent: false,
    isCompleted: timer.status === 'completed',
    isOverTarget,
    overtimeSeconds: isOverTarget && timer.targetDuration ? Math.max(0, currentSeconds - timer.targetDuration) : 0,
    formattedTime: timeParts.formatted,
    hours: timeParts.hours,
    minutes: timeParts.minutes,
    seconds: timeParts.seconds,
    sign: '',
  };
}

/**
 * Timer action reducer: handles start, pause, reset, adjust, tick.
 */
export function startTimer(timer: TimerModel, now: number = Date.now()): TimerModel {
  if (timer.status === 'running') return timer;

  // If completed and not allowing negative on countdown, cannot start unless time is added or reset
  if (timer.status === 'completed' && timer.type === 'countdown' && !timer.allowNegative) {
    const effectiveRemaining = timer.initialDuration + timer.timeAdjustment - timer.accumulatedElapsed;
    if (effectiveRemaining <= 0) {
      return timer;
    }
  }

  return {
    ...timer,
    status: 'running',
    startedAt: now,
    completedAt: null,
    updatedAt: now,
  };
}

export function pauseTimer(timer: TimerModel, now: number = Date.now()): TimerModel {
  if (timer.status !== 'running') return timer;

  const segmentSeconds = timer.startedAt ? Math.max(0, (now - timer.startedAt) / 1000) : 0;

  return {
    ...timer,
    status: 'paused',
    startedAt: null,
    accumulatedElapsed: timer.accumulatedElapsed + segmentSeconds,
    updatedAt: now,
  };
}

export function resetTimer(timer: TimerModel, now: number = Date.now()): TimerModel {
  return {
    ...timer,
    status: 'idle',
    startedAt: null,
    accumulatedElapsed: 0,
    timeAdjustment: 0,
    completedAt: null,
    updatedAt: now,
  };
}

export function adjustTimerTime(
  timer: TimerModel,
  deltaSeconds: number,
  now: number = Date.now()
): TimerModel {
  const newAdjustment = timer.timeAdjustment + deltaSeconds;

  // Check if countdown without negative allowed reaches or goes below 0
  if (timer.type === 'countdown' && !timer.allowNegative) {
    const currentElapsed =
      timer.accumulatedElapsed +
      (timer.status === 'running' && timer.startedAt ? Math.max(0, (now - timer.startedAt) / 1000) : 0);
    const newRemaining = timer.initialDuration + newAdjustment - currentElapsed;

    if (newRemaining <= 0) {
      // Complete the timer
      return {
        ...timer,
        status: 'completed',
        timeAdjustment: newAdjustment,
        accumulatedElapsed: timer.initialDuration + newAdjustment,
        startedAt: null,
        completedAt: now,
        updatedAt: now,
      };
    }
  }

  // If timer was completed, but adjustment adds enough time to make remaining positive, allow it to become paused/ready
  if (timer.status === 'completed' && timer.type === 'countdown') {
    const currentElapsed = timer.accumulatedElapsed;
    const newRemaining = timer.initialDuration + newAdjustment - currentElapsed;
    if (newRemaining > 0) {
      return {
        ...timer,
        status: 'paused',
        timeAdjustment: newAdjustment,
        completedAt: null,
        updatedAt: now,
      };
    }
  }

  return {
    ...timer,
    timeAdjustment: newAdjustment,
    updatedAt: now,
  };
}

/**
 * Check if a running timer has reached zero (for countdown) and should transition to completed.
 */
export function checkTimerCompletion(timer: TimerModel, now: number = Date.now()): TimerModel {
  if (timer.status !== 'running') return timer;

  if (timer.type === 'countdown') {
    const currentElapsed =
      timer.accumulatedElapsed +
      (timer.startedAt ? Math.max(0, (now - timer.startedAt) / 1000) : 0);
    const remaining = timer.initialDuration + timer.timeAdjustment - currentElapsed;

    if (remaining <= 0 && !timer.allowNegative) {
      return {
        ...timer,
        status: 'completed',
        accumulatedElapsed: timer.initialDuration + timer.timeAdjustment,
        startedAt: null,
        completedAt: now,
        updatedAt: now,
      };
    }
  }

  return timer;
}
