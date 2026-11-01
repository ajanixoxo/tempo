import { CreateTimerInput, TimerModel, TimerType } from '@/types/timer';
import { timeToSeconds } from './time-format';

export interface ValidationResult<T> {
  isValid: boolean;
  errors: Record<string, string>;
  data?: T;
}

export function validateTimerInput(input: CreateTimerInput): ValidationResult<{
  name: string;
  description?: string;
  type: TimerType;
  initialDuration: number;
  allowNegative: boolean;
  targetDuration?: number;
}> {
  const errors: Record<string, string> = {};

  const name = (input.name || '').trim();
  if (!name) {
    errors.name = 'Timer name is required.';
  } else if (name.length > 100) {
    errors.name = 'Timer name cannot exceed 100 characters.';
  }

  const hours = Math.max(0, Math.floor(input.hours || 0));
  const minutes = Math.max(0, Math.floor(input.minutes || 0));
  const seconds = Math.max(0, Math.floor(input.seconds || 0));

  const totalDuration = timeToSeconds(hours, minutes, seconds);

  if (input.type === 'countdown') {
    if (totalDuration <= 0) {
      errors.duration = 'Countdown duration must be greater than 0 seconds.';
    }
  }

  let targetDuration: number | undefined = undefined;
  if (input.type === 'countup') {
    const tHours = Math.max(0, Math.floor(input.targetHours || 0));
    const tMinutes = Math.max(0, Math.floor(input.targetMinutes || 0));
    const tSeconds = Math.max(0, Math.floor(input.targetSeconds || 0));
    const totalTarget = timeToSeconds(tHours, tMinutes, tSeconds);
    if (totalTarget > 0) {
      targetDuration = totalTarget;
    }
  }

  const isValid = Object.keys(errors).length === 0;

  return {
    isValid,
    errors,
    data: isValid
      ? {
          name,
          description: input.description?.trim() || undefined,
          type: input.type,
          initialDuration: input.type === 'countdown' ? totalDuration : 0,
          allowNegative: Boolean(input.allowNegative),
          targetDuration,
        }
      : undefined,
  };
}

export function isValidTimerModel(obj: unknown): obj is TimerModel {
  if (!obj || typeof obj !== 'object') return false;
  const o = obj as Record<string, unknown>;
  return (
    typeof o.id === 'string' &&
    typeof o.name === 'string' &&
    (o.type === 'countdown' || o.type === 'countup') &&
    typeof o.initialDuration === 'number' &&
    typeof o.allowNegative === 'boolean' &&
    typeof o.status === 'string' &&
    typeof o.accumulatedElapsed === 'number' &&
    typeof o.timeAdjustment === 'number' &&
    typeof o.createdAt === 'number' &&
    typeof o.updatedAt === 'number'
  );
}
