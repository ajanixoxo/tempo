import { describe, it, expect } from 'vitest';
import { validateTimerInput, isValidTimerModel } from '../src/lib/validation';
import { CreateTimerInput } from '../src/types/timer';

describe('Validation: Timer Inputs', () => {
  it('validates countdown timer with valid inputs', () => {
    const input: CreateTimerInput = {
      name: 'Keynote Talk',
      type: 'countdown',
      hours: 0,
      minutes: 25,
      seconds: 0,
    };
    const result = validateTimerInput(input);
    expect(result.isValid).toBe(true);
    expect(result.data?.initialDuration).toBe(1500); // 25 * 60
  });

  it('rejects empty timer name', () => {
    const input: CreateTimerInput = {
      name: '   ',
      type: 'countdown',
      hours: 0,
      minutes: 10,
      seconds: 0,
    };
    const result = validateTimerInput(input);
    expect(result.isValid).toBe(false);
    expect(result.errors.name).toBeDefined();
  });

  it('rejects countdown with 0 duration', () => {
    const input: CreateTimerInput = {
      name: 'Test',
      type: 'countdown',
      hours: 0,
      minutes: 0,
      seconds: 0,
    };
    const result = validateTimerInput(input);
    expect(result.isValid).toBe(false);
    expect(result.errors.duration).toBeDefined();
  });

  it('allows countup timer starting from 0 with optional target', () => {
    const input: CreateTimerInput = {
      name: 'Q&A Session',
      type: 'countup',
      hours: 0,
      minutes: 0,
      seconds: 0,
      targetHours: 0,
      targetMinutes: 15,
      targetSeconds: 0,
    };
    const result = validateTimerInput(input);
    expect(result.isValid).toBe(true);
    expect(result.data?.initialDuration).toBe(0);
    expect(result.data?.targetDuration).toBe(900);
  });
});

describe('Validation: isValidTimerModel', () => {
  it('validates correct TimerModel structure', () => {
    const valid = {
      id: 't-1',
      name: 'Welcome',
      type: 'countdown',
      initialDuration: 300,
      allowNegative: false,
      status: 'idle',
      startedAt: null,
      accumulatedElapsed: 0,
      timeAdjustment: 0,
      completedAt: null,
      createdAt: 1000,
      updatedAt: 1000,
    };
    expect(isValidTimerModel(valid)).toBe(true);
  });

  it('rejects invalid or corrupted objects', () => {
    expect(isValidTimerModel(null)).toBe(false);
    expect(isValidTimerModel({})).toBe(false);
    expect(isValidTimerModel({ id: 123, name: 'bad' })).toBe(false);
  });
});
