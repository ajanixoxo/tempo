import { TimerModel } from '@/types/timer';
import { AudienceMessage, DisplaySettings } from '@/types/display';
import { isValidTimerModel } from './validation';
import { DEFAULT_WARNING_SETTINGS } from './timer-engine';

export const TEMPO_STORAGE_VERSION = 1;

const KEYS = {
  VERSION: 'tempo_schema_version',
  TIMERS: 'tempo_v1_timers',
  ACTIVE_TIMER_ID: 'tempo_v1_active_timer_id',
  DISPLAY_SETTINGS: 'tempo_v1_display_settings',
  MESSAGE: 'tempo_v1_message',
} as const;

export const DEFAULT_DISPLAY_SETTINGS: DisplaySettings = {
  mode: 'timer-only',
  appearance: {
    bgColor: '#080809',
    timerColor: '#FFFFFF',
    messageColor: '#E4E4E7',
    accentColor: '#FFFFFF',
    fontSize: 'large',
    fontFamily: 'mono',
    fontWeight: 'bold',
    timerScale: 100,
    animationMode: 'fluid',
  },
  visibility: {
    showTitle: true,
    showClock: true,
    showMessage: true,
    showProgress: true,
    showStatus: true,
  },
  warnings: DEFAULT_WARNING_SETTINGS,
  clock: {
    enabled: true,
    format: '12h',
    showSeconds: true,
    showDate: false,
  },
};

export const INITIAL_PRESET_TIMERS: TimerModel[] = [
  {
    id: 'preset-welcome',
    name: 'Opening & Welcome',
    description: 'Welcome attendees and opening remarks',
    type: 'countdown',
    initialDuration: 600, // 10 minutes
    allowNegative: true,
    status: 'idle',
    startedAt: null,
    accumulatedElapsed: 0,
    timeAdjustment: 0,
    completedAt: null,
    createdAt: 1700000000000,
    updatedAt: 1700000000000,
  },
  {
    id: 'preset-presentation',
    name: 'Keynote Presentation',
    description: 'Main keynote address',
    type: 'countdown',
    initialDuration: 1800, // 30 minutes
    allowNegative: true,
    status: 'idle',
    startedAt: null,
    accumulatedElapsed: 0,
    timeAdjustment: 0,
    completedAt: null,
    createdAt: 1700000001000,
    updatedAt: 1700000001000,
  },
  {
    id: 'preset-qa',
    name: 'Q&A Session',
    description: 'Questions and answers with audience',
    type: 'countdown',
    initialDuration: 900, // 15 minutes
    allowNegative: true,
    status: 'idle',
    startedAt: null,
    accumulatedElapsed: 0,
    timeAdjustment: 0,
    completedAt: null,
    createdAt: 1700000002000,
    updatedAt: 1700000002000,
  },
  {
    id: 'preset-open-forum',
    name: 'Open Forum / Discussion',
    description: 'Count-up timer with 20 minute target',
    type: 'countup',
    initialDuration: 0,
    allowNegative: false,
    targetDuration: 1200, // 20 minutes
    status: 'idle',
    startedAt: null,
    accumulatedElapsed: 0,
    timeAdjustment: 0,
    completedAt: null,
    createdAt: 1700000003000,
    updatedAt: 1700000003000,
  },
];

function isLocalStorageAvailable(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const testKey = '__tempo_test_key__';
    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

export function loadStoredTimers(): { timers: TimerModel[]; activeTimerId: string | null } {
  if (!isLocalStorageAvailable()) {
    return { timers: INITIAL_PRESET_TIMERS, activeTimerId: INITIAL_PRESET_TIMERS[0].id };
  }

  try {
    const raw = window.localStorage.getItem(KEYS.TIMERS);
    const activeId = window.localStorage.getItem(KEYS.ACTIVE_TIMER_ID);

    if (!raw) {
      // First run: save defaults
      saveStoredTimers(INITIAL_PRESET_TIMERS, INITIAL_PRESET_TIMERS[0].id);
      return { timers: INITIAL_PRESET_TIMERS, activeTimerId: INITIAL_PRESET_TIMERS[0].id };
    }

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return { timers: INITIAL_PRESET_TIMERS, activeTimerId: INITIAL_PRESET_TIMERS[0].id };
    }

    const validTimers = parsed.filter(isValidTimerModel);
    if (validTimers.length === 0) {
      return { timers: INITIAL_PRESET_TIMERS, activeTimerId: INITIAL_PRESET_TIMERS[0].id };
    }

    // Ensure all countdown timers allow negative/overtime by default,
    // and if a timer was stuck in 'completed' status, recover it to ready/paused so it can run
    const migratedTimers = validTimers.map((timer) => {
      if (timer.type === 'countdown') {
        const isCompleted = timer.status === 'completed';
        return {
          ...timer,
          allowNegative: true,
          status: isCompleted ? (timer.accumulatedElapsed > 0 ? 'paused' : 'idle') : timer.status,
        };
      }
      return timer;
    });

    const resolvedActiveId =
      activeId && migratedTimers.some((t) => t.id === activeId)
        ? activeId
        : migratedTimers[0].id;

    saveStoredTimers(migratedTimers, resolvedActiveId);

    return { timers: migratedTimers, activeTimerId: resolvedActiveId };
  } catch (error) {
    console.error('Failed to load timers from LocalStorage:', error);
    return { timers: INITIAL_PRESET_TIMERS, activeTimerId: INITIAL_PRESET_TIMERS[0].id };
  }
}

export function saveStoredTimers(timers: TimerModel[], activeTimerId: string | null): void {
  if (!isLocalStorageAvailable()) return;
  try {
    window.localStorage.setItem(KEYS.TIMERS, JSON.stringify(timers));
    if (activeTimerId) {
      window.localStorage.setItem(KEYS.ACTIVE_TIMER_ID, activeTimerId);
    } else {
      window.localStorage.removeItem(KEYS.ACTIVE_TIMER_ID);
    }
  } catch (error) {
    console.error('Failed to save timers to LocalStorage:', error);
  }
}

export function loadStoredDisplaySettings(): DisplaySettings {
  if (!isLocalStorageAvailable()) return DEFAULT_DISPLAY_SETTINGS;

  try {
    const raw = window.localStorage.getItem(KEYS.DISPLAY_SETTINGS);
    if (!raw) return DEFAULT_DISPLAY_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<DisplaySettings>;

    return {
      ...DEFAULT_DISPLAY_SETTINGS,
      ...parsed,
      appearance: {
        ...DEFAULT_DISPLAY_SETTINGS.appearance,
        ...(parsed.appearance || {}),
        fontWeight: parsed.appearance?.fontWeight || 'bold',
        animationMode: parsed.appearance?.animationMode || 'fluid',
        timerScale:
          typeof parsed.appearance?.timerScale === 'number' && parsed.appearance.timerScale > 0
            ? parsed.appearance.timerScale
            : DEFAULT_DISPLAY_SETTINGS.appearance.timerScale,
      },
      visibility: { ...DEFAULT_DISPLAY_SETTINGS.visibility, ...(parsed.visibility || {}) },
      warnings: { ...DEFAULT_DISPLAY_SETTINGS.warnings, ...(parsed.warnings || {}) },
      clock: { ...DEFAULT_DISPLAY_SETTINGS.clock, ...(parsed.clock || {}) },
    };
  } catch (error) {
    console.error('Failed to load display settings:', error);
    return DEFAULT_DISPLAY_SETTINGS;
  }
}

export function saveStoredDisplaySettings(settings: DisplaySettings): void {
  if (!isLocalStorageAvailable()) return;
  try {
    window.localStorage.setItem(KEYS.DISPLAY_SETTINGS, JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save display settings:', error);
  }
}

export function loadStoredMessage(): AudienceMessage | null {
  if (!isLocalStorageAvailable()) return null;
  try {
    const raw = window.localStorage.getItem(KEYS.MESSAGE);
    if (!raw) return null;
    return JSON.parse(raw) as AudienceMessage;
  } catch {
    return null;
  }
}

export function saveStoredMessage(message: AudienceMessage | null): void {
  if (!isLocalStorageAvailable()) return;
  try {
    if (message) {
      window.localStorage.setItem(KEYS.MESSAGE, JSON.stringify(message));
    } else {
      window.localStorage.removeItem(KEYS.MESSAGE);
    }
  } catch (error) {
    console.error('Failed to save message:', error);
  }
}
