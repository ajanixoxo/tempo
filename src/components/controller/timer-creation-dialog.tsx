import React, { useState } from 'react';
import { CreateTimerInput, TimerType } from '@/types/timer';
import { X, Clock, AlertCircle } from 'lucide-react';

interface TimerCreationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (input: CreateTimerInput) => { success: boolean; error?: string };
}

export const TimerCreationDialog: React.FC<TimerCreationDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<TimerType>('countdown');
  const [hours, setHours] = useState('0');
  const [minutes, setMinutes] = useState('15');
  const [seconds, setSeconds] = useState('0');
  const [allowNegative, setAllowNegative] = useState(false);

  // Target duration for countup
  const [targetHours, setTargetHours] = useState('0');
  const [targetMinutes, setTargetMinutes] = useState('30');
  const [targetSeconds, setSecondsTarget] = useState('0');

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const input: CreateTimerInput = {
      name,
      description,
      type,
      hours: parseInt(hours) || 0,
      minutes: parseInt(minutes) || 0,
      seconds: parseInt(seconds) || 0,
      allowNegative,
      targetHours: parseInt(targetHours) || 0,
      targetMinutes: parseInt(targetMinutes) || 0,
      targetSeconds: parseInt(targetSeconds) || 0,
    };

    const res = onSubmit(input);
    if (!res.success) {
      setErrorMessage(res.error || 'Failed to create timer. Please check inputs.');
    } else {
      onClose();
      // Reset form
      setName('');
      setDescription('');
      setType('countdown');
      setHours('0');
      setMinutes('15');
      setSeconds('0');
      setAllowNegative(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-2xl bg-tempo-card border border-tempo-border shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-tempo-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <h3 className="text-base font-semibold text-white">Create New Timer</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-tempo-surface transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Name */}
          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1">
              Timer Name <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Keynote Address, Welcome Session"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-tempo-surface border border-tempo-border rounded-xl px-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1">
              Description (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Dr. John Doe - AI in Modern Times"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-tempo-surface border border-tempo-border rounded-xl px-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Timer Type Selector */}
          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1.5">Timer Type</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setType('countdown')}
                className={`py-2 px-3 rounded-xl border text-xs font-medium flex items-center justify-center gap-2 transition-all ${
                  type === 'countdown'
                    ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                    : 'bg-tempo-surface text-slate-300 border-tempo-border hover:bg-tempo-border/50'
                }`}
              >
                <span>Countdown (From duration to 0)</span>
              </button>
              <button
                type="button"
                onClick={() => setType('countup')}
                className={`py-2 px-3 rounded-xl border text-xs font-medium flex items-center justify-center gap-2 transition-all ${
                  type === 'countup'
                    ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                    : 'bg-tempo-surface text-slate-300 border-tempo-border hover:bg-tempo-border/50'
                }`}
              >
                <span>Count-up (From 0 upwards)</span>
              </button>
            </div>
          </div>

          {/* Countdown Duration Inputs */}
          {type === 'countdown' && (
            <div className="p-4 rounded-xl bg-tempo-surface/60 border border-tempo-border/70 space-y-3">
              <label className="text-xs font-medium text-slate-200 block">
                Countdown Duration (Hours : Minutes : Seconds)
              </label>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1 uppercase font-mono">
                    Hours
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="99"
                    value={hours}
                    onChange={(e) => setHours(e.target.value)}
                    className="w-full bg-tempo-card border border-tempo-border rounded-lg p-2 text-sm text-center font-mono font-bold text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1 uppercase font-mono">
                    Minutes
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={minutes}
                    onChange={(e) => setMinutes(e.target.value)}
                    className="w-full bg-tempo-card border border-tempo-border rounded-lg p-2 text-sm text-center font-mono font-bold text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1 uppercase font-mono">
                    Seconds
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={seconds}
                    onChange={(e) => setSeconds(e.target.value)}
                    className="w-full bg-tempo-card border border-tempo-border rounded-lg p-2 text-sm text-center font-mono font-bold text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Allow Negative Overtime */}
              <label className="flex items-center gap-2 pt-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={allowNegative}
                  onChange={(e) => setAllowNegative(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 bg-tempo-card border-tempo-border"
                />
                <span className="text-xs text-slate-300">
                  Allow timer to continue running into overtime (negative time) past zero
                </span>
              </label>
            </div>
          )}

          {/* Countup Target Duration Inputs */}
          {type === 'countup' && (
            <div className="p-4 rounded-xl bg-tempo-surface/60 border border-tempo-border/70 space-y-3">
              <label className="text-xs font-medium text-slate-200 block">
                Target Warning Duration (Optional)
              </label>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1 uppercase font-mono">
                    Target Hours
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="99"
                    value={targetHours}
                    onChange={(e) => setTargetHours(e.target.value)}
                    className="w-full bg-tempo-card border border-tempo-border rounded-lg p-2 text-sm text-center font-mono font-bold text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1 uppercase font-mono">
                    Target Minutes
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={targetMinutes}
                    onChange={(e) => setTargetMinutes(e.target.value)}
                    className="w-full bg-tempo-card border border-tempo-border rounded-lg p-2 text-sm text-center font-mono font-bold text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1 uppercase font-mono">
                    Target Seconds
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={targetSeconds}
                    onChange={(e) => setSecondsTarget(e.target.value)}
                    className="w-full bg-tempo-card border border-tempo-border rounded-lg p-2 text-sm text-center font-mono font-bold text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              <p className="text-[11px] text-slate-400">
                Count-up will start from 00:00 and display a gentle warning when this target is reached.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-tempo-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-tempo-surface border border-tempo-border transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-colors shadow-lg shadow-blue-600/20"
            >
              Save Timer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
