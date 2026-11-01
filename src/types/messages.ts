import { TimerModel } from './timer';
import { AudienceMessage, DisplaySettings } from './display';

export type BroadcastMessageType =
  | 'TIMER_STATE_UPDATED'
  | 'ACTIVE_TIMER_CHANGED'
  | 'DISPLAY_SETTINGS_UPDATED'
  | 'MESSAGE_UPDATED'
  | 'MESSAGE_CLEARED'
  | 'CLOCK_SETTINGS_UPDATED'
  | 'DISPLAY_CONNECTED'
  | 'REQUEST_CURRENT_STATE'
  | 'SYNC_FULL_STATE';

export interface FullSyncPayload {
  activeTimer: TimerModel | null;
  displaySettings: DisplaySettings;
  message: AudienceMessage | null;
  timestamp: number;
}

export type BroadcastPayload =
  | { type: 'TIMER_STATE_UPDATED'; timer: TimerModel }
  | { type: 'ACTIVE_TIMER_CHANGED'; timer: TimerModel | null }
  | { type: 'DISPLAY_SETTINGS_UPDATED'; settings: DisplaySettings }
  | { type: 'MESSAGE_UPDATED'; message: AudienceMessage }
  | { type: 'MESSAGE_CLEARED' }
  | { type: 'CLOCK_SETTINGS_UPDATED'; clock: DisplaySettings['clock'] }
  | { type: 'DISPLAY_CONNECTED'; displayId: string; timestamp: number }
  | { type: 'REQUEST_CURRENT_STATE'; displayId: string }
  | { type: 'SYNC_FULL_STATE'; state: FullSyncPayload };
