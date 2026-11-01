import React, { useState } from 'react';
import { DisplayMode, DisplaySettings } from '@/types/display';
import {
  Monitor,
  Tv,
  Settings,
  Eye,
  Clock,
  Palette,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  HelpCircle,
} from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState<'modes' | 'appearance' | 'visibility' | 'warnings' | 'clock'>(
    'modes'
  );
  const [showHdmiGuide, setShowHdmiGuide] = useState(false);

  const displayModes: { id: DisplayMode; label: string; desc: string }[] = [
    { id: 'timer-only', label: 'Timer Only', desc: 'Large digital timer for maximum visibility' },
    { id: 'timer-title', label: 'Timer + Title', desc: 'Session name displayed above the timer' },
    { id: 'timer-message', label: 'Timer + Message', desc: 'Timer with active operator broadcast' },
    { id: 'clock-only', label: 'Clock Only', desc: 'Real-world current local time' },
    { id: 'timer-clock', label: 'Timer & Clock', desc: 'Both timer countdown and current clock' },
    { id: 'custom', label: 'Custom Layout', desc: 'Choose exactly what elements appear' },
  ];

  return (
    <div className="bg-tempo-card/60 border border-tempo-border/70 rounded-2xl p-4 space-y-4">
      {/* Header and Open Display Action */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Tv className="w-4 h-4 text-blue-400" />
          <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Audience Display Controls
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowHdmiGuide(!showHdmiGuide)}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-tempo-surface transition-colors"
            title="HDMI Setup Instructions"
          >
            <HelpCircle className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={onOpenDisplayWindow}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/20 transition-all active:scale-95"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Open Display Window</span>
          </button>
        </div>
      </div>

      {/* HDMI Guide Callout */}
      {showHdmiGuide && (
        <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-500/30 text-xs text-blue-200 space-y-1.5">
          <div className="font-semibold text-white flex items-center gap-1.5">
            <Monitor className="w-3.5 h-3.5 text-blue-400" />
            HDMI External Display Setup Guide:
          </div>
          <ol className="list-decimal list-inside space-y-1 text-slate-300 text-[11px] leading-relaxed">
            <li>Connect HDMI cable from laptop to TV/Projector.</li>
            <li>Press <strong>Win + P</strong> and select <strong>Extend</strong>.</li>
            <li>Click <strong>Open Display Window</strong> above.</li>
            <li>Drag the newly opened window over to your TV screen.</li>
            <li>Click Fullscreen (or press <strong>F</strong>) on the display window.</li>
          </ol>
        </div>
      )}

      {/* Settings Navigation Tabs */}
      <div className="flex border-b border-tempo-border/60 text-xs font-medium">
        <button
          onClick={() => setActiveTab('modes')}
          className={`px-3 py-2 border-b-2 -mb-px transition-colors ${
            activeTab === 'modes'
              ? 'border-blue-500 text-blue-400 font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Modes
        </button>
        <button
          onClick={() => setActiveTab('visibility')}
          className={`px-3 py-2 border-b-2 -mb-px transition-colors ${
            activeTab === 'visibility'
              ? 'border-blue-500 text-blue-400 font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Visibility
        </button>
        <button
          onClick={() => setActiveTab('clock')}
          className={`px-3 py-2 border-b-2 -mb-px transition-colors ${
            activeTab === 'clock'
              ? 'border-blue-500 text-blue-400 font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Clock
        </button>
        <button
          onClick={() => setActiveTab('warnings')}
          className={`px-3 py-2 border-b-2 -mb-px transition-colors ${
            activeTab === 'warnings'
              ? 'border-blue-500 text-blue-400 font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Alerts
        </button>
        <button
          onClick={() => setActiveTab('appearance')}
          className={`px-3 py-2 border-b-2 -mb-px transition-colors ${
            activeTab === 'appearance'
              ? 'border-blue-500 text-blue-400 font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Styles
        </button>
      </div>

      {/* Tab 1: Modes */}
      {activeTab === 'modes' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {displayModes.map((mode) => (
            <button
              key={mode.id}
              onClick={() => onSetDisplayMode(mode.id)}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                settings.mode === mode.id
                  ? 'bg-blue-600/15 border-blue-500 text-white'
                  : 'bg-tempo-surface/80 border-tempo-border/70 text-slate-300 hover:border-tempo-border'
              }`}
            >
              <div className="font-semibold text-xs mb-0.5">{mode.label}</div>
              <div className="text-[10px] text-slate-400 leading-tight">{mode.desc}</div>
            </button>
          ))}
        </div>
      )}

      {/* Tab 2: Visibility */}
      {activeTab === 'visibility' && (
        <div className="grid grid-cols-2 gap-2 text-xs">
          {[
            { key: 'showTitle', label: 'Session Title' },
            { key: 'showClock', label: 'Real-World Clock' },
            { key: 'showMessage', label: 'Audience Messages' },
            { key: 'showProgress', label: 'Progress Bar' },
            { key: 'showStatus', label: 'Status Indicator' },
          ].map((item) => (
            <label
              key={item.key}
              className="flex items-center gap-2 p-2 rounded-lg bg-tempo-surface border border-tempo-border/60 cursor-pointer hover:bg-tempo-border/30"
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
                className="w-4 h-4 rounded text-blue-600 focus:ring-0 bg-tempo-card border-tempo-border"
              />
              <span className="text-slate-200">{item.label}</span>
            </label>
          ))}
        </div>
      )}

      {/* Tab 3: Clock */}
      {activeTab === 'clock' && (
        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between p-2 rounded-lg bg-tempo-surface border border-tempo-border">
            <span className="text-slate-200">Clock Format</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  onUpdateSettings({ clock: { ...settings.clock, format: '12h' } })
                }
                className={`px-2 py-1 rounded text-xs font-mono ${
                  settings.clock.format === '12h'
                    ? 'bg-blue-600 text-white'
                    : 'bg-tempo-card text-slate-400'
                }`}
              >
                12 Hour (AM/PM)
              </button>
              <button
                type="button"
                onClick={() =>
                  onUpdateSettings({ clock: { ...settings.clock, format: '24h' } })
                }
                className={`px-2 py-1 rounded text-xs font-mono ${
                  settings.clock.format === '24h'
                    ? 'bg-blue-600 text-white'
                    : 'bg-tempo-card text-slate-400'
                }`}
              >
                24 Hour
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <label className="flex items-center gap-2 p-2 rounded-lg bg-tempo-surface border border-tempo-border/60 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.clock.showSeconds}
                onChange={(e) =>
                  onUpdateSettings({
                    clock: { ...settings.clock, showSeconds: e.target.checked },
                  })
                }
                className="w-4 h-4 rounded text-blue-600 bg-tempo-card border-tempo-border"
              />
              <span className="text-slate-200">Show Seconds</span>
            </label>

            <label className="flex items-center gap-2 p-2 rounded-lg bg-tempo-surface border border-tempo-border/60 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.clock.showDate}
                onChange={(e) =>
                  onUpdateSettings({
                    clock: { ...settings.clock, showDate: e.target.checked },
                  })
                }
                className="w-4 h-4 rounded text-blue-600 bg-tempo-card border-tempo-border"
              />
              <span className="text-slate-200">Show Date</span>
            </label>
          </div>
        </div>
      )}

      {/* Tab 4: Warnings & Alerts */}
      {activeTab === 'warnings' && (
        <div className="space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">
                Warning Threshold (minutes):
              </label>
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
                className="w-full bg-tempo-surface border border-tempo-border rounded-lg px-2.5 py-1.5 text-xs text-white"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">
                Urgent Threshold (minutes):
              </label>
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
                className="w-full bg-tempo-surface border border-tempo-border rounded-lg px-2.5 py-1.5 text-xs text-white"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 pt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.warnings.flashOnUrgent}
                onChange={(e) =>
                  onUpdateSettings({
                    warnings: { ...settings.warnings, flashOnUrgent: e.target.checked },
                  })
                }
                className="w-4 h-4 rounded text-blue-600 bg-tempo-card border-tempo-border"
              />
              <span className="text-slate-300">Flash urgent alerts</span>
            </label>
          </div>
        </div>
      )}

      {/* Tab 5: Appearance */}
      {activeTab === 'appearance' && (
        <div className="space-y-3 text-xs">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Background:</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={settings.appearance.bgColor}
                  onChange={(e) =>
                    onUpdateSettings({
                      appearance: { ...settings.appearance, bgColor: e.target.value },
                    })
                  }
                  className="w-8 h-8 rounded-lg bg-transparent cursor-pointer border-0"
                />
                <span className="font-mono text-[11px] text-slate-300">
                  {settings.appearance.bgColor}
                </span>
              </div>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Timer Color:</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={settings.appearance.timerColor}
                  onChange={(e) =>
                    onUpdateSettings({
                      appearance: { ...settings.appearance, timerColor: e.target.value },
                    })
                  }
                  className="w-8 h-8 rounded-lg bg-transparent cursor-pointer border-0"
                />
                <span className="font-mono text-[11px] text-slate-300">
                  {settings.appearance.timerColor}
                </span>
              </div>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Font Family:</label>
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
                className="w-full bg-tempo-surface border border-tempo-border rounded-lg px-2 py-1.5 text-xs text-white"
              >
                <option value="mono">Monospace</option>
                <option value="sans">Sans-serif</option>
                <option value="serif">Serif</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
