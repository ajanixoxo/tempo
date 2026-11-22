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
import { ExternalLink, Keyboard, X } from 'lucide-react';
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
    <div className="min-h-screen flex flex-col bg-tempo-bg text-zinc-100 select-none">
      {/* Top Controller Header */}
      <header className="h-14 px-6 border-b border-tempo-hairline bg-tempo-panel flex items-center justify-between flex-shrink-0 z-30">
        <div className="flex items-center gap-4">
          {/* Pure Typographic Wordmark (No Logo) */}
          <span className="text-sm font-mono tracking-widest uppercase text-zinc-300">
            tempo
          </span>
          <span className="text-zinc-600 font-mono text-xs">/</span>
          <span className="text-xs font-mono text-zinc-500">controller</span>
        </div>

        {/* Center Live Real-world Clock */}
        <div className="hidden md:flex items-center gap-2 text-xs font-mono text-zinc-400">
          <span className="tabular-nums text-zinc-200">{timeStr}</span>
          {period && <span>{period}</span>}
        </div>

        {/* Right Header Actions */}
        <div className="flex items-center gap-3">
          {/* Subtle Audience Screen Connection indicator */}
          <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-mono text-zinc-500">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isAudienceConnected ? 'bg-emerald-400' : 'bg-zinc-600'
              }`}
            />
            <span>{isAudienceConnected ? 'screen linked' : 'screen standby'}</span>
          </div>

          {/* Keyboard Shortcuts Button */}
          <button
            onClick={() => setShowKeyboardHelp(true)}
            className="p-1.5 rounded text-zinc-500 hover:text-zinc-200 hover:bg-tempo-surface transition-colors"
            title="Keyboard Shortcuts"
          >
            <Keyboard className="w-4 h-4" />
          </button>

          {/* Open Display Window Button */}
          <button
            onClick={handleOpenDisplay}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-medium transition-colors"
          >
            <span>Display</span>
            <ExternalLink className="w-3 h-3" />
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

        {/* Right Sidebar: Display Settings & Messages */}
        <div className="w-80 xl:w-88 bg-tempo-panel border-l border-tempo-hairline flex flex-col h-full overflow-y-auto overflow-x-hidden p-4 space-y-4 flex-shrink-0">
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
        title="Reset Timer"
        description="This timer is currently running. Reset back to the start?"
        confirmLabel="Reset"
        variant="warning"
        onConfirm={() => {
          resetActiveTimer();
          setResetConfirmOpen(false);
        }}
        onCancel={() => setResetConfirmOpen(false)}
      />

      {/* Keyboard Shortcuts Sheet */}
      {showKeyboardHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-xl bg-tempo-panel border border-tempo-hairline p-5 shadow-2xl">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-tempo-hairline">
              <span className="text-xs font-mono uppercase tracking-widest text-zinc-300">Shortcuts</span>
              <button
                onClick={() => setShowKeyboardHelp(false)}
                className="p-1 rounded text-zinc-500 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between py-1 text-zinc-300">
                <span>Start / Pause</span>
                <span className="text-zinc-500">Space</span>
              </div>
              <div className="flex items-center justify-between py-1 text-zinc-300">
                <span>Reset Timer</span>
                <span className="text-zinc-500">R</span>
              </div>
              <div className="flex items-center justify-between py-1 text-zinc-300">
                <span>Add 1 Minute</span>
                <span className="text-zinc-500">▲ Up Arrow</span>
              </div>
              <div className="flex items-center justify-between py-1 text-zinc-300">
                <span>Subtract 1 Minute</span>
                <span className="text-zinc-500">▼ Down Arrow</span>
              </div>
              <div className="flex items-center justify-between py-1 text-zinc-300">
                <span>Fullscreen (Display)</span>
                <span className="text-zinc-500">F</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
