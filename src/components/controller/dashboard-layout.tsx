import React, { useEffect, useState, useCallback } from 'react';
import { useTimerStore } from '@/stores/timer-store';
import { useDisplayStore } from '@/stores/display-store';
import { TimerLibrary } from './timer-library';
import { TimerWorkspace } from './timer-workspace';
import { MessageEditor } from './message-editor';
import { DisplaySettingsPanel } from './display-settings';
import { TimerCreationDialog } from './timer-creation-dialog';
import { TimerEditDialog } from './timer-edit-dialog';
import { ConfirmationDialog } from '../shared/confirmation-dialog';
import { TimerModel } from '@/types/timer';
import { broadcastBus } from '@/lib/broadcast';
import {
  Clock,
  ExternalLink,
  Tv,
  Keyboard,
  Sliders,
  CheckCircle2,
  X,
  Volume2,
} from 'lucide-react';
import { formatRealWorldClock } from '@/lib/time-format';

export const DashboardLayout: React.FC = () => {
  // Timer Store
  const timers = useTimerStore((s) => s.timers);
  const activeTimerId = useTimerStore((s) => s.activeTimerId);
  const initializeTimers = useTimerStore((s) => s.initialize);
  const setActiveTimer = useTimerStore((s) => s.setActiveTimer);
  const createTimer = useTimerStore((s) => s.createTimer);
  const updateTimer = useTimerStore((s) => s.updateTimer);
  const deleteTimer = useTimerStore((s) => s.deleteTimer);
  const duplicateTimer = useTimerStore((s) => s.duplicateTimer);
  const startActiveTimer = useTimerStore((s) => s.startActiveTimer);
  const pauseActiveTimer = useTimerStore((s) => s.pauseActiveTimer);
  const resetActiveTimer = useTimerStore((s) => s.resetActiveTimer);
  const adjustActiveTimer = useTimerStore((s) => s.adjustActiveTimer);
  const tick = useTimerStore((s) => s.tick);
  const getActiveTimer = useTimerStore((s) => s.getActiveTimer);

  // Display Store
  const settings = useDisplayStore((s) => s.settings);
  const message = useDisplayStore((s) => s.message);
  const initializeDisplay = useDisplayStore((s) => s.initialize);
  const setDisplayMode = useDisplayStore((s) => s.setDisplayMode);
  const updateSettings = useDisplayStore((s) => s.updateSettings);
  const setMessage = useDisplayStore((s) => s.setMessage);
  const toggleMessageVisibility = useDisplayStore((s) => s.toggleMessageVisibility);
  const clearMessage = useDisplayStore((s) => s.clearMessage);

  // Local UI State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingTimer, setEditingTimer] = useState<TimerModel | null>(null);
  const [deletingTimerId, setDeletingTimerId] = useState<string | null>(null);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
  const [isAudienceConnected, setIsAudienceConnected] = useState(false);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  // Initialize stores on client mount
  useEffect(() => {
    initializeTimers();
    initializeDisplay();
  }, [initializeTimers, initializeDisplay]);

  // Real-world clock tick
  useEffect(() => {
    const clockInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(clockInterval);
  }, []);

  // Broadcast sync responder: when audience display asks for state or connects
  useEffect(() => {
    const unsubscribe = broadcastBus.subscribe((payload) => {
      if (payload.type === 'DISPLAY_CONNECTED' || payload.type === 'REQUEST_CURRENT_STATE') {
        setIsAudienceConnected(true);
        // Reply with full state sync
        broadcastBus.publish({
          type: 'SYNC_FULL_STATE',
          state: {
            activeTimer: getActiveTimer(),
            displaySettings: settings,
            message: message,
            timestamp: Date.now(),
          },
        });
      }
    });

    return () => {
      unsubscribe();
    };
  }, [getActiveTimer, settings, message]);

  // Open Audience Display window
  const handleOpenDisplay = useCallback(() => {
    const displayWindow = window.open(
      '/display',
      'tempo_audience_display',
      'width=1280,height=720,menubar=no,toolbar=no,location=no,status=no'
    );
    if (displayWindow) {
      displayWindow.focus();
    }
  }, []);

  // Keyboard shortcuts handler (Space, R, ArrowUp, ArrowDown)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in form controls
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        const active = getActiveTimer();
        if (!active) return;
        if (active.status === 'running') {
          pauseActiveTimer();
        } else {
          startActiveTimer();
        }
      } else if (e.code === 'KeyR') {
        e.preventDefault();
        const active = getActiveTimer();
        if (active && active.status === 'running') {
          setResetConfirmOpen(true);
        } else {
          resetActiveTimer();
        }
      } else if (e.code === 'ArrowUp') {
        e.preventDefault();
        adjustActiveTimer(60); // +1 minute
      } else if (e.code === 'ArrowDown') {
        e.preventDefault();
        adjustActiveTimer(-60); // -1 minute
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    getActiveTimer,
    pauseActiveTimer,
    startActiveTimer,
    resetActiveTimer,
    adjustActiveTimer,
  ]);

  const activeTimer = getActiveTimer();
  const { time: timeStr, period } = formatRealWorldClock(currentTime, '12h', true);

  return (
    <div className="min-h-screen flex flex-col bg-tempo-bg text-slate-100 select-none">
      {/* Top Navigation / Controller Header */}
      <header className="h-16 px-6 border-b border-tempo-border/70 bg-tempo-card/80 flex items-center justify-between flex-shrink-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white shadow-md shadow-blue-600/30">
            <Clock className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
              Tempo Controller
              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                Studio
              </span>
            </h1>
          </div>
        </div>

        {/* Center Live Real-world Clock */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-tempo-surface border border-tempo-border text-xs font-mono">
          <span className="text-slate-400">Local Time:</span>
          <span className="font-bold text-white tabular-nums">{timeStr}</span>
          {period && <span className="text-slate-400">{period}</span>}
        </div>

        {/* Right Header Actions */}
        <div className="flex items-center gap-3">
          {/* Audience Display Connection Badge */}
          <div
            className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs ${
              isAudienceConnected
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                : 'bg-tempo-surface border-tempo-border text-slate-400'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isAudienceConnected ? 'bg-emerald-400' : 'bg-slate-500'
              }`}
            />
            <span>{isAudienceConnected ? 'Audience Screen Connected' : 'Screen Standby'}</span>
          </div>

          {/* Keyboard Shortcuts Button */}
          <button
            onClick={() => setShowKeyboardHelp(true)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-tempo-surface border border-transparent hover:border-tempo-border transition-colors"
            title="Keyboard Shortcuts"
          >
            <Keyboard className="w-4 h-4" />
          </button>

          {/* Open Display Window Button */}
          <button
            onClick={handleOpenDisplay}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/20 transition-all active:scale-95"
          >
            <Tv className="w-4 h-4" />
            <span>Open Display</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-80" />
          </button>
        </div>
      </header>

      {/* Main 3-Column Dashboard Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar: Timers Library */}
        <TimerLibrary
          timers={timers}
          activeTimerId={activeTimerId}
          onSelect={(id) => setActiveTimer(id)}
          onCreateNew={() => setIsCreateOpen(true)}
          onEdit={(t) => setEditingTimer(t)}
          onDuplicate={(id) => duplicateTimer(id)}
          onDelete={(id) => setDeletingTimerId(id)}
        />

        {/* Center: Main Timer Workspace */}
        <div className="flex-1 flex flex-col overflow-y-auto">
          <TimerWorkspace
            timer={activeTimer}
            onStart={startActiveTimer}
            onPause={pauseActiveTimer}
            onResume={startActiveTimer}
            onReset={() => {
              if (activeTimer && activeTimer.status === 'running') {
                setResetConfirmOpen(true);
              } else {
                resetActiveTimer();
              }
            }}
            onAdjust={adjustActiveTimer}
            onTick={tick}
          />
        </div>

        {/* Right Sidebar: Messages & Display Customization */}
        <div className="w-80 lg:w-[420px] bg-tempo-card/70 border-l border-tempo-border/70 flex flex-col h-full overflow-y-auto p-4 space-y-4 flex-shrink-0">
          <DisplaySettingsPanel
            settings={settings}
            onUpdateSettings={updateSettings}
            onSetDisplayMode={setDisplayMode}
            onOpenDisplayWindow={handleOpenDisplay}
          />

          <MessageEditor
            message={message}
            onSetMessage={setMessage}
            onToggleVisibility={toggleMessageVisibility}
            onClearMessage={clearMessage}
          />
        </div>
      </div>

      {/* Modals & Dialogs */}
      <TimerCreationDialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={createTimer}
      />

      <TimerEditDialog
        isOpen={Boolean(editingTimer)}
        timer={editingTimer}
        onClose={() => setEditingTimer(null)}
        onSubmit={updateTimer}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={Boolean(deletingTimerId)}
        title="Delete Timer"
        description="Are you sure you want to delete this timer? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={() => {
          if (deletingTimerId) {
            deleteTimer(deletingTimerId);
            setDeletingTimerId(null);
          }
        }}
        onCancel={() => setDeletingTimerId(null)}
      />

      {/* Reset Running Timer Confirmation */}
      <ConfirmationDialog
        isOpen={resetConfirmOpen}
        title="Reset Active Timer"
        description="This timer is currently running. Are you sure you want to reset it back to the beginning?"
        confirmLabel="Reset Timer"
        variant="warning"
        onConfirm={() => {
          resetActiveTimer();
          setResetConfirmOpen(false);
        }}
        onCancel={() => setResetConfirmOpen(false)}
      />

      {/* Keyboard Shortcuts Cheat Sheet */}
      {showKeyboardHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-tempo-card border border-tempo-border p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-tempo-border">
              <div className="flex items-center gap-2">
                <Keyboard className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-semibold text-white">Keyboard Shortcuts</h3>
              </div>
              <button
                onClick={() => setShowKeyboardHelp(false)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-tempo-surface">
                <span className="text-slate-300">Start / Pause Active Timer</span>
                <kbd className="px-2 py-1 rounded bg-tempo-card border border-tempo-border font-mono text-[11px] text-slate-200">
                  Space
                </kbd>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-tempo-surface">
                <span className="text-slate-300">Reset Active Timer</span>
                <kbd className="px-2 py-1 rounded bg-tempo-card border border-tempo-border font-mono text-[11px] text-slate-200">
                  R
                </kbd>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-tempo-surface">
                <span className="text-slate-300">Add 1 Minute (+60s)</span>
                <kbd className="px-2 py-1 rounded bg-tempo-card border border-tempo-border font-mono text-[11px] text-slate-200">
                  ▲ Up Arrow
                </kbd>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-tempo-surface">
                <span className="text-slate-300">Subtract 1 Minute (-60s)</span>
                <kbd className="px-2 py-1 rounded bg-tempo-card border border-tempo-border font-mono text-[11px] text-slate-200">
                  ▼ Down Arrow
                </kbd>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-tempo-surface">
                <span className="text-slate-300">Toggle Fullscreen on Audience Screen</span>
                <kbd className="px-2 py-1 rounded bg-tempo-card border border-tempo-border font-mono text-[11px] text-slate-200">
                  F
                </kbd>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 mt-4 leading-relaxed">
              Shortcuts work everywhere on the controller unless you are typing into a text field.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
