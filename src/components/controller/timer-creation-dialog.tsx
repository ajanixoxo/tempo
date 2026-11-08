import React, { useState } from 'react';
import { CreateTimerInput, TimerType } from '@/types/timer';
import { X, AlertCircle } from 'lucide-react';

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
  const [allowNegative, setAllowNegative] = useState(true);

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
      setName('');
      setDescription('');
      setType('countdown');
      setHours('0');
      setMinutes('15');
      setSeconds('0');
      setAllowNegative(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl bg-tempo-panel border border-tempo-hairline shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-tempo-hairline">
          <h3 className="text-sm font-medium text-white">New Timer</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-zinc-500 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {errorMessage && (
            <div className="p-2.5 rounded bg-red-950/40 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div>
            <label className="text-xs text-zinc-400 block mb-1">Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Session 1, Keynote"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-tempo-surface rounded px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs text-zinc-400 block mb-1">Description (Optional)</label>
            <input
              type="text"
              placeholder="Speaker or remarks"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-tempo-surface rounded px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs text-zinc-400 block mb-1">Type</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setType('countdown')}
                className={`py-1.5 px-3 rounded text-xs font-medium transition-colors ${
                  type === 'countdown'
                    ? 'bg-zinc-100 text-zinc-950 font-semibold'
                    : 'bg-tempo-surface text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Countdown
              </button>
              <button
                type="button"
                onClick={() => setType('countup')}
                className={`py-1.5 px-3 rounded text-xs font-medium transition-colors ${
                  type === 'countup'
                    ? 'bg-zinc-100 text-zinc-950 font-semibold'
                    : 'bg-tempo-surface text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Count-up
              </button>
            </div>
          </div>

          {type === 'countdown' && (
            <div className="p-3 rounded bg-tempo-surface/50 space-y-3">
              <label className="text-xs text-zinc-400 block">Duration (HH : MM : SS)</label>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase block mb-1 font-mono">Hr</span>
                  <input
                    type="number"
                    min="0"
                    max="99"
                    value={hours}
                    onChange={(e) => setHours(e.target.value)}
                    className="w-full bg-tempo-surface rounded p-1.5 text-center font-mono text-sm text-white focus:outline-none"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase block mb-1 font-mono">Min</span>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={minutes}
                    onChange={(e) => setMinutes(e.target.value)}
                    className="w-full bg-tempo-surface rounded p-1.5 text-center font-mono text-sm text-white focus:outline-none"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase block mb-1 font-mono">Sec</span>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={seconds}
                    onChange={(e) => setSeconds(e.target.value)}
                    className="w-full bg-tempo-surface rounded p-1.5 text-center font-mono text-sm text-white focus:outline-none"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={allowNegative}
                  onChange={(e) => setAllowNegative(e.target.checked)}
                  className="rounded bg-tempo-surface border-0 text-zinc-200 focus:ring-0"
                />
                <span className="text-xs text-zinc-300">Count up additional time when zero is reached (Overtime)</span>
              </label>
            </div>
          )}

          {type === 'countup' && (
            <div className="p-3 rounded bg-tempo-surface/50 space-y-2">
              <label className="text-xs text-zinc-400 block">Target Warning Duration (Optional)</label>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase block mb-1 font-mono">Hr</span>
                  <input
                    type="number"
                    min="0"
                    max="99"
                    value={targetHours}
                    onChange={(e) => setTargetHours(e.target.value)}
                    className="w-full bg-tempo-surface rounded p-1.5 text-center font-mono text-sm text-white focus:outline-none"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase block mb-1 font-mono">Min</span>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={targetMinutes}
                    onChange={(e) => setTargetMinutes(e.target.value)}
                    className="w-full bg-tempo-surface rounded p-1.5 text-center font-mono text-sm text-white focus:outline-none"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase block mb-1 font-mono">Sec</span>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={targetSeconds}
                    onChange={(e) => setSecondsTarget(e.target.value)}
                    className="w-full bg-tempo-surface rounded p-1.5 text-center font-mono text-sm text-white focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-tempo-hairline">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded text-xs text-zinc-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded bg-zinc-100 hover:bg-white text-zinc-950 font-medium text-xs transition-colors"
            >
              Save Timer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
