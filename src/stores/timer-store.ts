import { create } from 'zustand';
import { CreateTimerInput, TimerModel, UpdateTimerInput } from '@/types/timer';
import {
  adjustTimerTime,
  checkTimerCompletion,
  pauseTimer,
  resetTimer,
  startTimer,
} from '@/lib/timer-engine';
import { loadStoredTimers, saveStoredTimers } from '@/lib/storage';
import { broadcastBus } from '@/lib/broadcast';
import { validateTimerInput } from '@/lib/validation';

export interface TimerStoreState {
  timers: TimerModel[];
  activeTimerId: string | null;
  isInitialized: boolean;

  // Actions
  initialize: () => void;
  setActiveTimer: (id: string) => void;
  createTimer: (input: CreateTimerInput) => { success: boolean; error?: string };
  updateTimer: (id: string, input: UpdateTimerInput) => { success: boolean; error?: string };
  deleteTimer: (id: string) => void;
  duplicateTimer: (id: string) => void;
  startActiveTimer: () => void;
  pauseActiveTimer: () => void;
  resetActiveTimer: () => void;
  adjustActiveTimer: (deltaSeconds: number) => void;
  tick: () => void;
  syncTimerStateFromRemote: (timer: TimerModel) => void;
  getActiveTimer: () => TimerModel | null;
}

export const useTimerStore = create<TimerStoreState>((set, get) => ({
  timers: [],
  activeTimerId: null,
  isInitialized: false,

  initialize: () => {
    if (get().isInitialized) return;
    const { timers, activeTimerId } = loadStoredTimers();
    set({ timers, activeTimerId, isInitialized: true });
  },

  getActiveTimer: () => {
    const { timers, activeTimerId } = get();
    return timers.find((t) => t.id === activeTimerId) || null;
  },

  setActiveTimer: (id: string) => {
    const { timers, activeTimerId } = get();
    if (activeTimerId === id) return;

    // Pause currently running timer if switching
    const now = Date.now();
    const updatedTimers = timers.map((t) => {
      if (t.status === 'running') {
        return pauseTimer(t, now);
      }
      return t;
    });

    const targetTimer = updatedTimers.find((t) => t.id === id) || null;

    set({ timers: updatedTimers, activeTimerId: id });
    saveStoredTimers(updatedTimers, id);

    broadcastBus.publish({
      type: 'ACTIVE_TIMER_CHANGED',
      timer: targetTimer,
    });
  },

  createTimer: (input: CreateTimerInput) => {
    const validation = validateTimerInput(input);
    if (!validation.isValid || !validation.data) {
      return {
        success: false,
        error: Object.values(validation.errors).join(', '),
      };
    }

    const now = Date.now();
    const newTimer: TimerModel = {
      id: `timer-${now}-${Math.random().toString(36).substring(2, 7)}`,
      name: validation.data.name,
      description: validation.data.description,
      type: validation.data.type,
      initialDuration: validation.data.initialDuration,
      allowNegative: validation.data.allowNegative,
      targetDuration: validation.data.targetDuration,
      status: 'idle',
      startedAt: null,
      accumulatedElapsed: 0,
      timeAdjustment: 0,
      completedAt: null,
      createdAt: now,
      updatedAt: now,
    };

    const newTimers = [...get().timers, newTimer];
    const newActiveId = get().activeTimerId || newTimer.id;

    set({ timers: newTimers, activeTimerId: newActiveId });
    saveStoredTimers(newTimers, newActiveId);

    return { success: true };
  },

  updateTimer: (id: string, input: UpdateTimerInput) => {
    const existing = get().timers.find((t) => t.id === id);
    if (!existing) {
      return { success: false, error: 'Timer not found' };
    }

    // Merge for validation
    const mergedInput: CreateTimerInput = {
      name: input.name ?? existing.name,
      description: input.description ?? existing.description,
      type: input.type ?? existing.type,
      hours: input.hours ?? Math.floor(existing.initialDuration / 3600),
      minutes: input.minutes ?? Math.floor((existing.initialDuration % 3600) / 60),
      seconds: input.seconds ?? existing.initialDuration % 60,
      allowNegative: input.allowNegative ?? existing.allowNegative,
      targetHours:
        input.targetHours ??
        (existing.targetDuration ? Math.floor(existing.targetDuration / 3600) : 0),
      targetMinutes:
        input.targetMinutes ??
        (existing.targetDuration ? Math.floor((existing.targetDuration % 3600) / 60) : 0),
      targetSeconds:
        input.targetSeconds ??
        (existing.targetDuration ? existing.targetDuration % 60 : 0),
    };

    const validation = validateTimerInput(mergedInput);
    if (!validation.isValid || !validation.data) {
      return {
        success: false,
        error: Object.values(validation.errors).join(', '),
      };
    }

    const now = Date.now();
    const updatedTimers = get().timers.map((t) => {
      if (t.id !== id) return t;
      return {
        ...t,
        name: validation.data!.name,
        description: validation.data!.description,
        type: validation.data!.type,
        initialDuration: validation.data!.initialDuration,
        allowNegative: validation.data!.allowNegative,
        targetDuration: validation.data!.targetDuration,
        updatedAt: now,
      };
    });

    set({ timers: updatedTimers });
    saveStoredTimers(updatedTimers, get().activeTimerId);

    const active = updatedTimers.find((t) => t.id === get().activeTimerId) || null;
    if (active && active.id === id) {
      broadcastBus.publish({ type: 'TIMER_STATE_UPDATED', timer: active });
    }

    return { success: true };
  },

  deleteTimer: (id: string) => {
    const { timers, activeTimerId } = get();
    if (timers.length <= 1) {
      return; // Keep at least one timer
    }

    const updatedTimers = timers.filter((t) => t.id !== id);
    let nextActiveId = activeTimerId;
    if (activeTimerId === id) {
      nextActiveId = updatedTimers[0]?.id || null;
    }

    set({ timers: updatedTimers, activeTimerId: nextActiveId });
    saveStoredTimers(updatedTimers, nextActiveId);

    const nextActive = updatedTimers.find((t) => t.id === nextActiveId) || null;
    broadcastBus.publish({ type: 'ACTIVE_TIMER_CHANGED', timer: nextActive });
  },

  duplicateTimer: (id: string) => {
    const source = get().timers.find((t) => t.id === id);
    if (!source) return;

    const now = Date.now();
    const duplicated: TimerModel = {
      ...source,
      id: `timer-${now}-${Math.random().toString(36).substring(2, 7)}`,
      name: `${source.name} (Copy)`,
      status: 'idle',
      startedAt: null,
      accumulatedElapsed: 0,
      timeAdjustment: 0,
      completedAt: null,
      createdAt: now,
      updatedAt: now,
    };

    const updatedTimers = [...get().timers, duplicated];
    set({ timers: updatedTimers });
    saveStoredTimers(updatedTimers, get().activeTimerId);
  },

  startActiveTimer: () => {
    const { timers, activeTimerId } = get();
    if (!activeTimerId) return;

    const now = Date.now();
    let updatedActive: TimerModel | null = null;

    const updatedTimers = timers.map((t) => {
      // Pause any other timer that might be running
      if (t.id !== activeTimerId) {
        if (t.status === 'running') return pauseTimer(t, now);
        return t;
      }
      const started = startTimer(t, now);
      updatedActive = started;
      return started;
    });

    set({ timers: updatedTimers });
    saveStoredTimers(updatedTimers, activeTimerId);

    if (updatedActive) {
      broadcastBus.publish({ type: 'TIMER_STATE_UPDATED', timer: updatedActive });
    }
  },

  pauseActiveTimer: () => {
    const { timers, activeTimerId } = get();
    if (!activeTimerId) return;

    const now = Date.now();
    let updatedActive: TimerModel | null = null;

    const updatedTimers = timers.map((t) => {
      if (t.id === activeTimerId) {
        const paused = pauseTimer(t, now);
        updatedActive = paused;
        return paused;
      }
      return t;
    });

    set({ timers: updatedTimers });
    saveStoredTimers(updatedTimers, activeTimerId);

    if (updatedActive) {
      broadcastBus.publish({ type: 'TIMER_STATE_UPDATED', timer: updatedActive });
    }
  },

  resetActiveTimer: () => {
    const { timers, activeTimerId } = get();
    if (!activeTimerId) return;

    const now = Date.now();
    let updatedActive: TimerModel | null = null;

    const updatedTimers = timers.map((t) => {
      if (t.id === activeTimerId) {
        const reset = resetTimer(t, now);
        updatedActive = reset;
        return reset;
      }
      return t;
    });

    set({ timers: updatedTimers });
    saveStoredTimers(updatedTimers, activeTimerId);

    if (updatedActive) {
      broadcastBus.publish({ type: 'TIMER_STATE_UPDATED', timer: updatedActive });
    }
  },

  adjustActiveTimer: (deltaSeconds: number) => {
    const { timers, activeTimerId } = get();
    if (!activeTimerId) return;

    const now = Date.now();
    let updatedActive: TimerModel | null = null;

    const updatedTimers = timers.map((t) => {
      if (t.id === activeTimerId) {
        const adjusted = adjustTimerTime(t, deltaSeconds, now);
        updatedActive = adjusted;
        return adjusted;
      }
      return t;
    });

    set({ timers: updatedTimers });
    saveStoredTimers(updatedTimers, activeTimerId);

    if (updatedActive) {
      broadcastBus.publish({ type: 'TIMER_STATE_UPDATED', timer: updatedActive });
    }
  },

  tick: () => {
    const { timers, activeTimerId } = get();
    if (!activeTimerId) return;

    const active = timers.find((t) => t.id === activeTimerId);
    if (!active || active.status !== 'running') return;

    const now = Date.now();
    const checked = checkTimerCompletion(active, now);

    if (checked.status !== active.status) {
      // Status changed to completed
      const updatedTimers = timers.map((t) => (t.id === activeTimerId ? checked : t));
      set({ timers: updatedTimers });
      saveStoredTimers(updatedTimers, activeTimerId);
      broadcastBus.publish({ type: 'TIMER_STATE_UPDATED', timer: checked });
    }
  },

  syncTimerStateFromRemote: (timer: TimerModel) => {
    const { timers } = get();
    const index = timers.findIndex((t) => t.id === timer.id);
    let updatedTimers: TimerModel[];

    if (index >= 0) {
      updatedTimers = timers.map((t) => (t.id === timer.id ? timer : t));
    } else {
      updatedTimers = [...timers, timer];
    }

    set({ timers: updatedTimers, activeTimerId: timer.id });
  },
}));
