import React, { useState } from 'react';
import { Plus, Minus, Clock } from 'lucide-react';

interface TimeAdjustmentProps {
  onAdjust: (seconds: number) => void;
  disabled?: boolean;
}

export const TimeAdjustment: React.FC<TimeAdjustmentProps> = ({ onAdjust, disabled = false }) => {
  const [customValue, setCustomValue] = useState<string>('2');
  const [customUnit, setCustomUnit] = useState<'minutes' | 'seconds'>('minutes');

  const handleCustomApply = (multiplier: 1 | -1) => {
    const val = parseFloat(customValue);
    if (isNaN(val) || val <= 0) return;

    const seconds = customUnit === 'minutes' ? Math.round(val * 60) : Math.round(val);
    onAdjust(seconds * multiplier);
  };

  const quickAdds = [
    { label: '+10s', seconds: 10 },
    { label: '+30s', seconds: 30 },
    { label: '+1m', seconds: 60 },
    { label: '+5m', seconds: 300 },
  ];

  const quickSubtracts = [
    { label: '-10s', seconds: -10 },
    { label: '-30s', seconds: -30 },
    { label: '-1m', seconds: -60 },
  ];

  return (
    <div className="bg-tempo-card/60 border border-tempo-border/70 rounded-2xl p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-400" />
          <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Live Time Adjustment
          </h3>
        </div>
        <span className="text-[11px] text-slate-400">Works while running</span>
      </div>

      {/* Quick Add Buttons */}
      <div className="space-y-2">
        <span className="text-[11px] font-medium text-slate-400">Add Time:</span>
        <div className="grid grid-cols-4 gap-2">
          {quickAdds.map((item) => (
            <button
              key={item.label}
              disabled={disabled}
              onClick={() => onAdjust(item.seconds)}
              className="px-2.5 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-xs font-mono font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1 active:scale-95"
            >
              <Plus className="w-3 h-3" />
              {item.label.replace('+', '')}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Subtract Buttons */}
      <div className="space-y-2">
        <span className="text-[11px] font-medium text-slate-400">Subtract Time:</span>
        <div className="grid grid-cols-3 gap-2">
          {quickSubtracts.map((item) => (
            <button
              key={item.label}
              disabled={disabled}
              onClick={() => onAdjust(item.seconds)}
              className="px-2.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-mono font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1 active:scale-95"
            >
              <Minus className="w-3 h-3" />
              {item.label.replace('-', '')}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Adjustment Input */}
      <div className="pt-2 border-t border-tempo-border/50">
        <span className="text-[11px] font-medium text-slate-400 block mb-2">Custom Delta:</span>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="1"
            value={customValue}
            onChange={(e) => setCustomValue(e.target.value)}
            disabled={disabled}
            className="w-20 bg-tempo-surface border border-tempo-border rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-blue-500"
          />
          <select
            value={customUnit}
            onChange={(e) => setCustomUnit(e.target.value as 'minutes' | 'seconds')}
            disabled={disabled}
            className="bg-tempo-surface border border-tempo-border rounded-lg px-2 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
          >
            <option value="minutes">min</option>
            <option value="seconds">sec</option>
          </select>

          <button
            disabled={disabled}
            onClick={() => handleCustomApply(1)}
            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1 transition-colors disabled:opacity-50"
            title="Add custom amount"
          >
            <Plus className="w-3 h-3" /> Add
          </button>
          <button
            disabled={disabled}
            onClick={() => handleCustomApply(-1)}
            className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center gap-1 transition-colors disabled:opacity-50"
            title="Subtract custom amount"
          >
            <Minus className="w-3 h-3" /> Sub
          </button>
        </div>
      </div>
    </div>
  );
};
