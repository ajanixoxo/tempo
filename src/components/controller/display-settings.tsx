import React, { useState } from 'react';
import { DisplayMode, DisplaySettings } from '@/types/display';
import { ExternalLink, HelpCircle } from 'lucide-react';

interface DisplaySettingsProps {
  settings: DisplaySettings;
  onUpdateSettings: (partial: Partial<DisplaySettings>) => void;
  onSetDisplayMode: (mode: DisplayMode) => void;
  onOpenDisplayWindow: () => void;
}

export const DisplaySettingsPanel: React.FC<DisplaySettingsProps> = ({
  settings,
  onUpdateSettings,
  onSetDisplayMode,
  onOpenDisplayWindow,
}) => {
  const [activeTab, setActiveTab] = useState<'modes' | 'visibility' | 'clock' | 'alerts' | 'appearance'>('modes');
  const [showHdmiGuide, setShowHdmiGuide] = useState(false);

  const displayModes: { id: DisplayMode; label: string; desc: string }[] = [
    { id: 'timer-only', label: 'Timer Only', desc: 'Maximized digital timer' },
    { id: 'timer-title', label: 'Timer + Title', desc: 'Session name above' },
    { id: 'timer-message', label: 'Timer + Message', desc: 'Timer with announcement' },
    { id: 'clock-only', label: 'Clock Only', desc: 'Local real-world time' },
    { id: 'timer-clock', label: 'Timer & Clock', desc: 'Timer with corner clock' },
    { id: 'custom', label: 'Custom', desc: 'Custom element visibility' },
  ];

  return (
    <div className="space-y-4">
      {/* Header and Open Display Action */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono uppercase tracking-widest text-zinc-400">
          Display
        </span>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowHdmiGuide(!showHdmiGuide)}
            className="text-zinc-500 hover:text-zinc-300 p-1 rounded transition-colors"
            title="HDMI Setup Guide"
          >
            <HelpCircle className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={onOpenDisplayWindow}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-medium transition-colors"
          >
            <span>Open Display</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* HDMI Guide Callout (Minimal) */}
      {showHdmiGuide && (
        <div className="p-3 rounded-lg bg-tempo-surface text-[11px] text-zinc-400 space-y-1">
          <span className="font-medium text-zinc-200 block">External Screen Setup:</span>
          <p>1. Connect HDMI cable to TV / Projector.</p>
          <p>2. Select Extended Display (Win + P).</p>
          <p>3. Click Open Display above and move window to TV.</p>
          <p>4. Press F on the display window to toggle fullscreen.</p>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex border-b border-tempo-hairline text-xs font-mono">
        {(['modes', 'visibility', 'clock', 'alerts', 'appearance'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-2.5 py-1.5 capitalize transition-colors ${
              activeTab === tab
                ? 'text-white border-b border-white -mb-px'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab: Modes */}
      {activeTab === 'modes' && (
        <div className="grid grid-cols-2 gap-1.5">
          {displayModes.map((mode) => (
            <button
              key={mode.id}
              onClick={() => onSetDisplayMode(mode.id)}
              className={`p-2 rounded-md text-left transition-colors ${
                settings.mode === mode.id
                  ? 'bg-tempo-surface text-white'
                  : 'text-zinc-400 hover:bg-tempo-surface/50 hover:text-zinc-200'
              }`}
            >
              <div className="text-xs font-medium">{mode.label}</div>
              <div className="text-[10px] text-zinc-500">{mode.desc}</div>
            </button>
          ))}
        </div>
      )}

      {/* Tab: Visibility */}
      {activeTab === 'visibility' && (
        <div className="space-y-1.5 text-xs text-zinc-300">
          {[
            { key: 'showTitle', label: 'Session Title' },
            { key: 'showClock', label: 'Corner Real-World Clock' },
            { key: 'showMessage', label: 'Stage Announcements' },
            { key: 'showProgress', label: 'Progress Line' },
            { key: 'showStatus', label: 'Status Indicator' },
          ].map((item) => (
            <label
              key={item.key}
              className="flex items-center gap-2 p-1.5 rounded hover:bg-tempo-surface cursor-pointer"
            >
              <input
                type="checkbox"
                checked={settings.visibility[item.key as keyof typeof settings.visibility]}
                onChange={(e) =>
                  onUpdateSettings({
                    visibility: {
                      ...settings.visibility,
                      [item.key]: e.target.checked,
                    },
                  })
                }
                className="rounded bg-tempo-surface border-0 text-zinc-200 focus:ring-0"
              />
              <span>{item.label}</span>
            </label>
          ))}
        </div>
      )}

      {/* Tab: Clock */}
      {activeTab === 'clock' && (
        <div className="space-y-3 text-xs text-zinc-300">
          <div className="flex items-center justify-between p-2 rounded bg-tempo-surface">
            <span>Clock Format</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() =>
                  onUpdateSettings({ clock: { ...settings.clock, format: '12h' } })
                }
                className={`px-2 py-0.5 rounded text-xs font-mono ${
                  settings.clock.format === '12h' ? 'bg-zinc-200 text-zinc-950 font-medium' : 'text-zinc-400'
                }`}
              >
                12h
              </button>
              <button
                type="button"
                onClick={() =>
                  onUpdateSettings({ clock: { ...settings.clock, format: '24h' } })
                }
                className={`px-2 py-0.5 rounded text-xs font-mono ${
                  settings.clock.format === '24h' ? 'bg-zinc-200 text-zinc-950 font-medium' : 'text-zinc-400'
                }`}
              >
                24h
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4 px-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.clock.showSeconds}
                onChange={(e) =>
                  onUpdateSettings({
                    clock: { ...settings.clock, showSeconds: e.target.checked },
                  })
                }
                className="rounded bg-tempo-surface border-0 text-zinc-200 focus:ring-0"
              />
              <span>Show Seconds</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.clock.showDate}
                onChange={(e) =>
                  onUpdateSettings({
                    clock: { ...settings.clock, showDate: e.target.checked },
                  })
                }
                className="rounded bg-tempo-surface border-0 text-zinc-200 focus:ring-0"
              />
              <span>Show Date</span>
            </label>
          </div>
        </div>
      )}

      {/* Tab: Alerts */}
      {activeTab === 'alerts' && (
        <div className="space-y-3 text-xs text-zinc-300">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-[11px] text-zinc-500 block mb-1">Warning (minutes):</span>
              <input
                type="number"
                min="1"
                max="60"
                value={Math.round(settings.warnings.warningThresholdSeconds / 60)}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 5;
                  onUpdateSettings({
                    warnings: {
                      ...settings.warnings,
                      warningThresholdSeconds: val * 60,
                    },
                  });
                }}
                className="w-full bg-tempo-surface rounded px-2.5 py-1.5 text-xs text-white focus:outline-none"
              />
            </div>

            <div>
              <span className="text-[11px] text-zinc-500 block mb-1">Urgent (minutes):</span>
              <input
                type="number"
                min="1"
                max="30"
                value={Math.round(settings.warnings.urgentThresholdSeconds / 60)}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 1;
                  onUpdateSettings({
                    warnings: {
                      ...settings.warnings,
                      urgentThresholdSeconds: val * 60,
                    },
                  });
                }}
                className="w-full bg-tempo-surface rounded px-2.5 py-1.5 text-xs text-white focus:outline-none"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer px-1">
            <input
              type="checkbox"
              checked={settings.warnings.flashOnUrgent}
              onChange={(e) =>
                onUpdateSettings({
                  warnings: { ...settings.warnings, flashOnUrgent: e.target.checked },
                })
              }
              className="rounded bg-tempo-surface border-0 text-zinc-200 focus:ring-0"
            />
            <span>Pulse urgent countdown</span>
          </label>
        </div>
      )}

      {/* Tab: Appearance */}
      {activeTab === 'appearance' && (
        <div className="space-y-3 text-xs text-zinc-300">
          <div>
            <span className="text-[11px] text-zinc-500 block mb-1">Typography:</span>
            <select
              value={settings.appearance.fontFamily}
              onChange={(e) =>
                onUpdateSettings({
                  appearance: {
                    ...settings.appearance,
                    fontFamily: e.target.value as 'mono' | 'sans' | 'serif',
                  },
                })
              }
              className="w-full bg-tempo-surface rounded px-2 py-1.5 text-xs text-white focus:outline-none"
            >
              <option value="mono">Monospace (Instrumental)</option>
              <option value="sans">Sans-serif (Modern)</option>
              <option value="serif">Serif (Classic)</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
};
