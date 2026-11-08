export type DisplayMode =
  | 'timer-only'
  | 'timer-title'
  | 'timer-message'
  | 'clock-only'
  | 'timer-clock'
  | 'custom';

export type DisplayFontSize = 'normal' | 'large' | 'huge';
export type DisplayFontFamily = 'mono' | 'sans' | 'serif';
export type ClockFormat = '12h' | '24h';
export type MessageVariant = 'banner' | 'overlay';

export interface AudienceMessage {
  id: string;
  content: string;
  visible: boolean;
  variant: MessageVariant;
  updatedAt: number;
}

export interface ClockSettings {
  enabled: boolean;
  format: ClockFormat;
  showSeconds: boolean;
  showDate: boolean;
}

export interface WarningSettings {
  warningThresholdSeconds: number; // e.g. 300 (5 minutes)
  urgentThresholdSeconds: number; // e.g. 60 (1 minute)
  warningColor: string; // e.g. #F59E0B
  urgentColor: string; // e.g. #EF4444
  completionColor: string; // e.g. #DC2626
  flashOnUrgent: boolean;
  flashOnCompletion: boolean;
}

export interface DisplayAppearanceSettings {
  bgColor: string;
  timerColor: string;
  messageColor: string;
  accentColor: string;
  fontSize: DisplayFontSize;
  fontFamily: DisplayFontFamily;
  timerScale: number; // Scale percentage for stage display font (default 100%, can be set to any size e.g. 50% to 400%)
}

export interface DisplayVisibilitySettings {
  showTitle: boolean;
  showClock: boolean;
  showMessage: boolean;
  showProgress: boolean;
  showStatus: boolean;
}

export interface DisplaySettings {
  mode: DisplayMode;
  appearance: DisplayAppearanceSettings;
  visibility: DisplayVisibilitySettings;
  warnings: WarningSettings;
  clock: ClockSettings;
}
