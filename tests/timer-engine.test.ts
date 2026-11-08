import { describe, it, expect } from 'vitest';
import {
  calculateTimerState,
  startTimer,
  pauseTimer,
  resetTimer,
  adjustTimerTime,
  checkTimerCompletion,
} from '../src/lib/timer-engine';
import { TimerModel } from '../src/types/timer';

function createMockCountdown(overrides: Partial<TimerModel> = {}): TimerModel {
  return {
    id: 'test-timer-1',
    name: 'Keynote Speech',
    type: 'countdown',
    initialDuration: 300, // 5 minutes
    allowNegative: false,
    status: 'idle',
    startedAt: null,
    accumulatedElapsed: 0,
    timeAdjustment: 0,
    completedAt: null,
    createdAt: 1000,
    updatedAt: 1000,
    ...overrides,
  };
}

function createMockCountup(overrides: Partial<TimerModel> = {}): TimerModel {
  return {
    id: 'test-timer-2',
    name: 'Open Discussion',
    type: 'countup',
    initialDuration: 0,
    allowNegative: false,
    targetDuration: 600, // 10 minutes target
    status: 'idle',
    startedAt: null,
    accumulatedElapsed: 0,
    timeAdjustment: 0,
    completedAt: null,
    createdAt: 1000,
    updatedAt: 1000,
    ...overrides,
  };
}

describe('Timer Engine: Countdown calculations', () => {
  it('returns initial duration when idle', () => {
    const timer = createMockCountdown({ initialDuration: 300 });
    const state = calculateTimerState(timer, 1000);
    expect(state.currentSeconds).toBe(300);
    expect(state.formattedTime).toBe('05:00');
    expect(state.progress).toBe(0);
    expect(state.isNegative).toBe(false);
    expect(state.isCompleted).toBe(false);
  });

  it('correctly calculates remaining time while running', () => {
    const t0 = 10000;
    let timer = createMockCountdown({ initialDuration: 300 });
    timer = startTimer(timer, t0);

    // 30 seconds later
    const state = calculateTimerState(timer, t0 + 30000);
    expect(state.currentSeconds).toBe(270);
    expect(state.formattedTime).toBe('04:30');
    expect(state.progress).toBeCloseTo(30 / 300, 3);
  });

  it('pauses and maintains accumulated elapsed time', () => {
    const t0 = 10000;
    let timer = createMockCountdown({ initialDuration: 300 });
    timer = startTimer(timer, t0);
    // Pause after 45 seconds
    timer = pauseTimer(timer, t0 + 45000);
    expect(timer.status).toBe('paused');
    expect(timer.startedAt).toBeNull();
    expect(timer.accumulatedElapsed).toBe(45);

    // Check state 10 minutes later while paused
    const state = calculateTimerState(timer, t0 + 600000);
    expect(state.currentSeconds).toBe(255);
    expect(state.formattedTime).toBe('04:15');
  });

  it('resumes accurately from paused state', () => {
    const t0 = 10000;
    let timer = createMockCountdown({ initialDuration: 300 });
    timer = startTimer(timer, t0);
    timer = pauseTimer(timer, t0 + 45000); // 45s elapsed

    // Resume at t0 + 100000
    const resumeTime = t0 + 100000;
    timer = startTimer(timer, resumeTime);

    // Check after running 15 more seconds (total 60s elapsed)
    const state = calculateTimerState(timer, resumeTime + 15000);
    expect(state.currentSeconds).toBe(240);
    expect(state.formattedTime).toBe('04:00');
  });

  it('resets timer cleanly back to initial state', () => {
    let timer = createMockCountdown({
      status: 'paused',
      accumulatedElapsed: 120,
      timeAdjustment: 60,
    });
    timer = resetTimer(timer);
    expect(timer.status).toBe('idle');
    expect(timer.accumulatedElapsed).toBe(0);
    expect(timer.timeAdjustment).toBe(0);
    expect(timer.startedAt).toBeNull();
  });
});

describe('Timer Engine: Live Time Adjustments', () => {
  it('adds time while running without resetting', () => {
    const t0 = 10000;
    let timer = createMockCountdown({ initialDuration: 180 });
    timer = startTimer(timer, t0);

    // Run for 30s
    let state = calculateTimerState(timer, t0 + 30000);
    expect(state.currentSeconds).toBe(150);

    // Add 60s (+1 minute)
    timer = adjustTimerTime(timer, 60, t0 + 30000);
    state = calculateTimerState(timer, t0 + 30000);
    expect(state.currentSeconds).toBe(210);

    // Run 10s more
    state = calculateTimerState(timer, t0 + 40000);
    expect(state.currentSeconds).toBe(200);
  });

  it('subtracts time while running', () => {
    const t0 = 10000;
    let timer = createMockCountdown({ initialDuration: 180 });
    timer = startTimer(timer, t0);

    // Subtract 30s
    timer = adjustTimerTime(timer, -30, t0 + 10000);
    const state = calculateTimerState(timer, t0 + 10000);
    expect(state.currentSeconds).toBe(140); // 180 - 30 - 10 = 140
  });

  it('completes timer if subtracting time drops remaining to 0 or below (when negative disallowed)', () => {
    const t0 = 10000;
    let timer = createMockCountdown({ initialDuration: 60, allowNegative: false });
    timer = startTimer(timer, t0);

    // Subtract 120s
    timer = adjustTimerTime(timer, -120, t0 + 10000);
    expect(timer.status).toBe('completed');
    const state = calculateTimerState(timer, t0 + 10000);
    expect(state.currentSeconds).toBe(0);
    expect(state.isCompleted).toBe(true);
  });
});

describe('Timer Engine: Zero Handling & Negative Overtime', () => {
  it('stops and completes at zero when allowNegative is false', () => {
    const t0 = 10000;
    let timer = createMockCountdown({ initialDuration: 10, allowNegative: false });
    timer = startTimer(timer, t0);

    // After 10s: reached 0
    timer = checkTimerCompletion(timer, t0 + 10000);
    expect(timer.status).toBe('completed');

    const state = calculateTimerState(timer, t0 + 15000);
    expect(state.currentSeconds).toBe(0);
    expect(state.formattedTime).toBe('00:00');
    expect(state.isCompleted).toBe(true);
    expect(state.isNegative).toBe(false);
  });

  it('continues counting into negative time when allowNegative is true', () => {
    const t0 = 10000;
    let timer = createMockCountdown({ initialDuration: 10, allowNegative: true });
    timer = startTimer(timer, t0);

    // After 15 seconds (5 seconds overdue)
    const state = calculateTimerState(timer, t0 + 15000);
    expect(state.isNegative).toBe(true);
    expect(state.currentSeconds).toBe(-5);
    expect(state.overtimeSeconds).toBe(5);
    expect(state.formattedTime).toBe('+00:05');

    // After 30 seconds (20 seconds overdue) - formats as +00:20
    const state20 = calculateTimerState(timer, t0 + 30000);
    expect(state20.isNegative).toBe(true);
    expect(state20.currentSeconds).toBe(-20);
    expect(state20.overtimeSeconds).toBe(20);
    expect(state20.formattedTime).toBe('+00:20');
  });
});

describe('Timer Engine: Count-up Timer', () => {
  it('starts at zero and counts upwards', () => {
    const t0 = 5000;
    let timer = createMockCountup({ targetDuration: 600 });
    timer = startTimer(timer, t0);

    const state1 = calculateTimerState(timer, t0 + 65000);
    expect(state1.currentSeconds).toBe(65);
    expect(state1.formattedTime).toBe('01:05');
    expect(state1.isOverTarget).toBe(false);
  });

  it('triggers warning when target duration is reached but continues running', () => {
    const t0 = 5000;
    let timer = createMockCountup({ targetDuration: 60 });
    timer = startTimer(timer, t0);

    // At 70 seconds: 10 seconds past target
    const state = calculateTimerState(timer, t0 + 70000);
    expect(state.currentSeconds).toBe(70);
    expect(state.isOverTarget).toBe(true);
    expect(state.isWarning).toBe(true);
    expect(timer.status).toBe('running');
  });
});
