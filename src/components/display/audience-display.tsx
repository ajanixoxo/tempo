import React, { useEffect, useState, useCallback, useRef } from 'react';
import { TimerModel } from '@/types/timer';
import { AudienceMessage, DisplaySettings } from '@/types/display';
import { calculateTimerState } from '@/lib/timer-engine';
import { TimerDisplay } from './timer-display';
import { ClockDisplay } from './clock-display';
import { MessageDisplay } from './message-display';
import { broadcastBus } from '@/lib/broadcast';
import {
  DEFAULT_DISPLAY_SETTINGS,
  loadStoredDisplaySettings,
  loadStoredMessage,
  loadStoredTimers,
} from '@/lib/storage';
import { Maximize, Minimize, Tv, Wifi } from 'lucide-react';

export const AudienceDisplay: React.FC = () => {
  const [activeTimer, setActiveTimer] = useState<TimerModel | null>(null);
  const [settings, setSettings] = useState<DisplaySettings>(DEFAULT_DISPLAY_SETTINGS);
  const [message, setMessage] = useState<AudienceMessage | null>(null);
  const [renderTimestamp, setRenderTimestamp] = useState<number>(Date.now());
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [showControlsOverlay, setShowControlsOverlay] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const mouseTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize from LocalStorage fallback immediately so screen is never blank
  useEffect(() => {
    const { timers, activeTimerId } = loadStoredTimers();
    const storedSettings = loadStoredDisplaySettings();
    const storedMsg = loadStoredMessage();

    const initialActive = timers.find((t) => t.id === activeTimerId) || timers[0] || null;
    setActiveTimer(initialActive);
    setSettings(storedSettings);
    setMessage(storedMsg);
  }, []);

  // BroadcastChannel communication subscription
  useEffect(() => {
    const unsubscribe = broadcastBus.subscribe((payload) => {
      setIsConnected(true);

      switch (payload.type) {
        case 'TIMER_STATE_UPDATED':
          setActiveTimer(payload.timer);
          break;
        case 'ACTIVE_TIMER_CHANGED':
          setActiveTimer(payload.timer);
          break;
        case 'DISPLAY_SETTINGS_UPDATED':
          setSettings(payload.settings);
          break;
        case 'MESSAGE_UPDATED':
          setMessage(payload.message);
          break;
        case 'MESSAGE_CLEARED':
          setMessage(null);
          break;
        case 'CLOCK_SETTINGS_UPDATED':
          setSettings((prev) => ({ ...prev, clock: payload.clock }));
          break;
        case 'SYNC_FULL_STATE':
          setActiveTimer(payload.state.activeTimer);
          setSettings(payload.state.displaySettings);
          setMessage(payload.state.message);
          break;
      }
    });

    // Announce connection & request sync from controller
    const displayId = `display-${Date.now()}`;
    broadcastBus.publish({
      type: 'DISPLAY_CONNECTED',
      displayId,
      timestamp: Date.now(),
    });

    broadcastBus.publish({
      type: 'REQUEST_CURRENT_STATE',
      displayId,
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Render loop for smooth timer ticks
  useEffect(() => {
    const interval = setInterval(() => {
      setRenderTimestamp(Date.now());
    }, 100);

    return () => clearInterval(interval);
  }, []);

  // Fullscreen toggle handler
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error('Failed to enter fullscreen:', err);
      });
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  }, []);

  // Fullscreen change listener & keyboard shortcut 'F'
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [toggleFullscreen]);

  // Hide cursor and controls after 3 seconds of mouse inactivity
  const handleMouseMove = () => {
    setShowControlsOverlay(true);
    if (mouseTimerRef.current) clearTimeout(mouseTimerRef.current);
    mouseTimerRef.current = setTimeout(() => {
      setShowControlsOverlay(false);
    }, 3000);
  };

  const calculated = activeTimer
    ? calculateTimerState(activeTimer, renderTimestamp, settings.warnings)
    : {
        currentSeconds: 0,
        rawSeconds: 0,
        progress: 0,
        isNegative: false,
        isWarning: false,
        isUrgent: false,
        isCompleted: false,
        isOverTarget: false,
        formattedTime: '00:00',
        hours: 0,
        minutes: 0,
        seconds: 0,
        sign: '' as const,
      };

  // Determine what to display based on mode
  const mode = settings.mode;
  const isClockOnly = mode === 'clock-only';
  const shouldShowClockCorner =
    (mode === 'timer-clock' || (mode === 'custom' && settings.visibility.showClock)) &&
    settings.clock.enabled;
  const shouldShowTitle =
    mode === 'timer-title' || (mode === 'custom' && settings.visibility.showTitle);
  const shouldShowMessage =
    mode === 'timer-message' ||
    (mode === 'custom' && settings.visibility.showMessage) ||
    (message && message.variant === 'overlay');

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      style={{ backgroundColor: settings.appearance.bgColor }}
      className={`relative min-h-screen w-screen flex flex-col justify-between overflow-hidden transition-colors duration-500 ${
        !showControlsOverlay ? 'cursor-none' : ''
      }`}
    >
      {/* Top Header Bar: Corner Clock & Status */}
      <header className="w-full flex items-center justify-between p-6 sm:p-10 z-20">
        <div className="flex items-center gap-3">
          {shouldShowClockCorner && <ClockDisplay settings={settings.clock} />}
        </div>

        {/* Floating Controls Overlay (Visible on hover/mouse movement) */}
        <div
          className={`flex items-center gap-3 transition-opacity duration-300 ${
            showControlsOverlay ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/60 border border-slate-700/60 text-xs text-slate-300 backdrop-blur-md">
            <span
              className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'
              }`}
            />
            <span>{isConnected ? 'Controller Synced' : 'Syncing...'}</span>
          </div>

          <button
            onClick={toggleFullscreen}
            className="p-2.5 rounded-xl bg-slate-900/70 hover:bg-slate-800 text-white border border-slate-700/60 backdrop-blur-md transition-all shadow-lg hover:scale-105 active:scale-95"
            title="Toggle Fullscreen (F)"
          >
            {isFullscreen ? (
              <Minimize className="w-5 h-5 text-white" />
            ) : (
              <Maximize className="w-5 h-5 text-white" />
            )}
          </button>
        </div>
      </header>

      {/* Main Center Content */}
      <main className="my-auto w-full flex flex-col items-center justify-center z-10">
        {isClockOnly ? (
          <ClockDisplay settings={settings.clock} size="hero" />
        ) : (
          <TimerDisplay
            calculated={calculated}
            settings={settings}
            title={shouldShowTitle ? activeTimer?.name : undefined}
            isCountup={activeTimer?.type === 'countup'}
          />
        )}
      </main>

      {/* Bottom Area: Messages */}
      <footer className="w-full z-20">
        {shouldShowMessage && (
          <MessageDisplay message={message} textColor={settings.appearance.messageColor} />
        )}
      </footer>
    </div>
  );
};
