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
  saveStoredDisplaySettings,
} from '@/lib/storage';
import { Maximize, Minimize } from 'lucide-react';

export const AudienceDisplay: React.FC = () => {
  const [activeTimer, setActiveTimer] = useState<TimerModel | null>(null);
  const [settings, setSettings] = useState<DisplaySettings>(DEFAULT_DISPLAY_SETTINGS);
  const [message, setMessage] = useState<AudienceMessage | null>(null);
  const [renderTimestamp, setRenderTimestamp] = useState<number>(Date.now());
  const [isFullscreen, setIsFullscreen] = useState(false);
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

  // Font size adjustment handler
  const updateTimerScale = useCallback((delta: number | 'reset') => {
    setSettings((prev) => {
      const currentScale = prev.appearance.timerScale ?? 100;
      let newScale = 100;
      if (delta === 'reset') {
        newScale = 100;
      } else {
        newScale = Math.max(40, Math.min(450, currentScale + delta));
      }

      const updated: DisplaySettings = {
        ...prev,
        appearance: {
          ...prev.appearance,
          timerScale: newScale,
        },
      };

      saveStoredDisplaySettings(updated);
      broadcastBus.publish({ type: 'DISPLAY_SETTINGS_UPDATED', settings: updated });
      return updated;
    });
  }, []);

  // Fullscreen change listener & keyboard shortcuts (+, -, 0, F)
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      } else if (e.key === '+' || e.key === '=') {
        updateTimerScale(15);
      } else if (e.key === '-' || e.key === '_') {
        updateTimerScale(-15);
      } else if (e.key === '0') {
        updateTimerScale('reset');
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [toggleFullscreen, updateTimerScale]);

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
        overtimeSeconds: 0,
        formattedTime: '00:00',
        hours: 0,
        minutes: 0,
        seconds: 0,
        sign: '' as const,
      };

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

  const currentScale = settings.appearance.timerScale ?? 100;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      style={{ backgroundColor: settings.appearance.bgColor || '#080809' }}
      className={`relative min-h-screen w-screen flex flex-col justify-between overflow-hidden transition-colors duration-500 ${
        !showControlsOverlay ? 'cursor-none' : ''
      }`}
    >
      {/* Top Header Bar */}
      <header className="w-full flex items-center justify-between p-6 sm:p-10 z-20">
        <div className="flex items-center gap-3">
          {shouldShowClockCorner && <ClockDisplay settings={settings.clock} />}
        </div>

        {/* Minimal Controls Overlay (Fades out when inactive) */}
        <div
          className={`flex items-center gap-2 transition-opacity duration-300 ${
            showControlsOverlay ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          {/* Quick Font Size Controls on Stage Display */}
          <div className="flex items-center gap-1 bg-zinc-900/60 rounded-md p-1 font-mono text-xs text-zinc-400">
            <button
              onClick={() => updateTimerScale(-15)}
              className="px-2 py-1 rounded hover:bg-zinc-800 hover:text-white transition-colors"
              title="Decrease Font Size (-)"
            >
              A-
            </button>
            <button
              onClick={() => updateTimerScale('reset')}
              className="px-1.5 py-1 rounded hover:bg-zinc-800 text-[11px] text-zinc-300 hover:text-white"
              title="Reset Font Size to 100% (0)"
            >
              {currentScale}%
            </button>
            <button
              onClick={() => updateTimerScale(15)}
              className="px-2 py-1 rounded hover:bg-zinc-800 hover:text-white transition-colors"
              title="Increase Font Size (+)"
            >
              A+
            </button>
          </div>

          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-md bg-zinc-900/60 hover:bg-zinc-850 text-zinc-400 hover:text-white transition-colors"
            title="Fullscreen (F)"
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="my-auto w-full flex flex-col items-center justify-center z-10 overflow-hidden">
        {isClockOnly ? (
          <ClockDisplay
            settings={settings.clock}
            size="hero"
            scale={currentScale}
            fontFamily={settings.appearance.fontFamily}
            fontWeight={settings.appearance.fontWeight || 'bold'}
          />
        ) : (
          <TimerDisplay
            calculated={calculated}
            settings={settings}
            title={shouldShowTitle ? activeTimer?.name : undefined}
            isCountup={activeTimer?.type === 'countup'}
          />
        )}
      </main>

      {/* Messages */}
      <footer className="w-full z-20 pb-6 sm:pb-8">
        {shouldShowMessage && (
          <MessageDisplay message={message} textColor={settings.appearance.messageColor} />
        )}
      </footer>

      {/* Bottom Progress Bar - Docked at the bottom of the screen with prominent height */}
      {settings.visibility.showProgress && !isClockOnly && activeTimer && (
        <div className="w-full h-4 sm:h-5 bg-zinc-900/90 overflow-hidden z-30 fixed bottom-0 left-0 right-0">
          <div
            className={`h-full transition-all duration-300 ease-out ${
              calculated.isUrgent
                ? 'bg-red-500'
                : calculated.isWarning || calculated.isOverTarget
                ? 'bg-amber-400'
                : 'bg-zinc-200'
            } ${calculated.isNegative ? 'bg-red-500 animate-pulse' : ''}`}
            style={{
              width: calculated.isNegative
                ? '100%'
                : `${Math.min(100, Math.max(0, Math.round(calculated.progress * 100)))}%`,
            }}
          />
        </div>
      )}
    </div>
  );
};
