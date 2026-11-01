import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  loadStoredTimers,
  saveStoredTimers,
  loadStoredDisplaySettings,
  saveStoredDisplaySettings,
  loadStoredMessage,
  saveStoredMessage,
  INITIAL_PRESET_TIMERS,
  DEFAULT_DISPLAY_SETTINGS,
} from '../src/lib/storage';
import { TimerModel } from '../src/types/timer';
import { AudienceMessage, DisplaySettings } from '../src/types/display';
import { calculateTimerState } from '../src/lib/timer-engine';

// Mock localStorage for Vitest
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(global, 'window', {
  value: {
    localStorage: localStorageMock,
  },
  writable: true,
});

describe('Persistence: LocalStorage Module', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it('returns initial preset timers when storage is empty', () => {
    const { timers, activeTimerId } = loadStoredTimers();
    expect(timers.length).toBe(INITIAL_PRESET_TIMERS.length);
    expect(activeTimerId).toBe(INITIAL_PRESET_TIMERS[0].id);
  });

  it('safely saves and recovers configured timers', () => {
    const testTimers: TimerModel[] = [
      {
        id: 'test-event-1',
        name: 'Conference Intro',
        type: 'countdown',
        initialDuration: 900,
        allowNegative: false,
        status: 'idle',
        startedAt: null,
        accumulatedElapsed: 0,
        timeAdjustment: 0,
        completedAt: null,
        createdAt: 1000,
        updatedAt: 1000,
      },
    ];

    saveStoredTimers(testTimers, 'test-event-1');
    const { timers, activeTimerId } = loadStoredTimers();

    expect(timers.length).toBe(1);
    expect(timers[0].name).toBe('Conference Intro');
    expect(activeTimerId).toBe('test-event-1');
  });

  it('safely handles malformed JSON in localStorage without crashing', () => {
    localStorageMock.setItem('tempo_v1_timers', '{ not valid json');
    const { timers } = loadStoredTimers();
    expect(timers.length).toBe(INITIAL_PRESET_TIMERS.length);
  });

  it('accurately recovers a running timer after simulated browser refresh', () => {
    const startedTimestamp = 50000;
    const runningTimer: TimerModel = {
      id: 'running-timer',
      name: 'Keynote Speech',
      type: 'countdown',
      initialDuration: 600, // 10 minutes
      allowNegative: false,
      status: 'running',
      startedAt: startedTimestamp,
      accumulatedElapsed: 0,
      timeAdjustment: 0,
      completedAt: null,
      createdAt: startedTimestamp,
      updatedAt: startedTimestamp,
    };

    saveStoredTimers([runningTimer], runningTimer.id);

    // Refresh simulation: re-load from storage
    const { timers, activeTimerId } = loadStoredTimers();
    expect(activeTimerId).toBe('running-timer');
    const recovered = timers[0];

    // Verify timestamp calculation after 120 seconds of real time
    const simulatedNow = startedTimestamp + 120000;
    const state = calculateTimerState(recovered, simulatedNow);
    expect(state.currentSeconds).toBe(480); // 600 - 120 = 480 seconds (08:00)
    expect(state.formattedTime).toBe('08:00');
  });

  it('saves and loads display settings faithfully', () => {
    const customSettings: DisplaySettings = {
      ...DEFAULT_DISPLAY_SETTINGS,
      mode: 'timer-message',
      appearance: {
        ...DEFAULT_DISPLAY_SETTINGS.appearance,
        bgColor: '#111827',
      },
    };

    saveStoredDisplaySettings(customSettings);
    const loaded = loadStoredDisplaySettings();
    expect(loaded.mode).toBe('timer-message');
    expect(loaded.appearance.bgColor).toBe('#111827');
  });

  it('saves and loads audience messages faithfully', () => {
    const testMsg: AudienceMessage = {
      id: 'msg-1',
      content: 'Lunch will be served on the terrace.',
      visible: true,
      variant: 'banner',
      updatedAt: 12345,
    };

    saveStoredMessage(testMsg);
    const loaded = loadStoredMessage();
    expect(loaded?.content).toBe('Lunch will be served on the terrace.');
    expect(loaded?.visible).toBe(true);

    // Test clear
    saveStoredMessage(null);
    expect(loadStoredMessage()).toBeNull();
  });
});
