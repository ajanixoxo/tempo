import { create } from 'zustand';
import { AudienceMessage, DisplayMode, DisplaySettings, MessageVariant } from '@/types/display';
import {
  DEFAULT_DISPLAY_SETTINGS,
  loadStoredDisplaySettings,
  loadStoredMessage,
  saveStoredDisplaySettings,
  saveStoredMessage,
} from '@/lib/storage';
import { broadcastBus } from '@/lib/broadcast';

export interface DisplayStoreState {
  settings: DisplaySettings;
  message: AudienceMessage | null;
  isInitialized: boolean;

  // Actions
  initialize: () => void;
  setDisplayMode: (mode: DisplayMode) => void;
  updateSettings: (partial: Partial<DisplaySettings>) => void;
  setMessage: (content: string, variant?: MessageVariant) => void;
  updateMessageContent: (content: string) => void;
  setMessageVisibility: (visible: boolean) => void;
  toggleMessageVisibility: () => void;
  clearMessage: () => void;
  syncFromRemote: (settings: DisplaySettings, message: AudienceMessage | null) => void;
}

export const useDisplayStore = create<DisplayStoreState>((set, get) => ({
  settings: DEFAULT_DISPLAY_SETTINGS,
  message: null,
  isInitialized: false,

  initialize: () => {
    if (get().isInitialized) return;
    const settings = loadStoredDisplaySettings();
    const message = loadStoredMessage();
    set({ settings, message, isInitialized: true });
  },

  setDisplayMode: (mode: DisplayMode) => {
    const current = get().settings;
    const updated: DisplaySettings = {
      ...current,
      mode,
    };
    set({ settings: updated });
    saveStoredDisplaySettings(updated);
    broadcastBus.publish({ type: 'DISPLAY_SETTINGS_UPDATED', settings: updated });
  },

  updateSettings: (partial: Partial<DisplaySettings>) => {
    const current = get().settings;
    const updated: DisplaySettings = {
      ...current,
      ...partial,
      appearance: {
        ...current.appearance,
        ...(partial.appearance || {}),
      },
      visibility: {
        ...current.visibility,
        ...(partial.visibility || {}),
      },
      warnings: {
        ...current.warnings,
        ...(partial.warnings || {}),
      },
      clock: {
        ...current.clock,
        ...(partial.clock || {}),
      },
    };

    set({ settings: updated });
    saveStoredDisplaySettings(updated);
    broadcastBus.publish({ type: 'DISPLAY_SETTINGS_UPDATED', settings: updated });
  },

  setMessage: (content: string, variant: MessageVariant = 'banner') => {
    const trimmed = content.trim();
    if (!trimmed) return;

    const newMessage: AudienceMessage = {
      id: `msg-${Date.now()}`,
      content: trimmed,
      visible: true,
      variant,
      updatedAt: Date.now(),
    };

    set({ message: newMessage });
    saveStoredMessage(newMessage);
    broadcastBus.publish({ type: 'MESSAGE_UPDATED', message: newMessage });
  },

  updateMessageContent: (content: string) => {
    const { message } = get();
    if (!message) return;

    const updated: AudienceMessage = {
      ...message,
      content: content.trim(),
      updatedAt: Date.now(),
    };

    set({ message: updated });
    saveStoredMessage(updated);
    broadcastBus.publish({ type: 'MESSAGE_UPDATED', message: updated });
  },

  setMessageVisibility: (visible: boolean) => {
    const { message } = get();
    if (!message) return;

    const updated: AudienceMessage = {
      ...message,
      visible,
      updatedAt: Date.now(),
    };

    set({ message: updated });
    saveStoredMessage(updated);
    broadcastBus.publish({ type: 'MESSAGE_UPDATED', message: updated });
  },

  toggleMessageVisibility: () => {
    const { message } = get();
    if (!message) return;
    get().setMessageVisibility(!message.visible);
  },

  clearMessage: () => {
    set({ message: null });
    saveStoredMessage(null);
    broadcastBus.publish({ type: 'MESSAGE_CLEARED' });
  },

  syncFromRemote: (settings: DisplaySettings, message: AudienceMessage | null) => {
    set({ settings, message });
  },
}));
