import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

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

  const quickDeltas = [
    { label: '+10s', seconds: 10 },
    { label: '+30s', seconds: 30 },
    { label: '+1m', seconds: 60 },
    { label: '+5m', seconds: 300 },
    { label: '-10s', seconds: -10 },
    { label: '-30s', seconds: -30 },
    { label: '-1m', seconds: -60 },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500">
        <span className="uppercase tracking-wider">Live Adjustment</span>
        <span>Keyboard: ▲ +1m / ▼ -1m</span>
      </div>

      {/* Quick Buttons Row */}
      <div className="flex flex-wrap items-center gap-1.5">
        {quickDeltas.map((item) => (
          <button
            key={item.label}
            disabled={disabled}
            onClick={() => onAdjust(item.seconds)}
            className="px-2.5 py-1.5 rounded-md bg-tempo-surface hover:bg-tempo-hover text-zinc-300 hover:text-white font-mono text-xs transition-colors disabled:opacity-40"
          >
            {item.label}
          </button>
        ))}

        {/* Minimal custom input */}
        <div className="flex items-center gap-1.5 ml-auto">
          <input
            type="number"
            min="1"
            value={customValue}
            onChange={(e) => setCustomValue(e.target.value)}
            disabled={disabled}
            className="w-14 bg-tempo-surface rounded px-2 py-1 text-xs text-white font-mono focus:outline-none"
          />
          <select
            value={customUnit}
            onChange={(e) => setCustomUnit(e.target.value as 'minutes' | 'seconds')}
            disabled={disabled}
            className="bg-tempo-surface rounded px-1.5 py-1 text-xs text-zinc-400 focus:outline-none"
          >
            <option value="minutes">min</option>
            <option value="seconds">sec</option>
          </select>
          <button
            disabled={disabled}
            onClick={() => handleCustomApply(1)}
            className="p-1 rounded bg-tempo-surface hover:bg-tempo-hover text-zinc-300 transition-colors"
            title="Add custom"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button
            disabled={disabled}
            onClick={() => handleCustomApply(-1)}
            className="p-1 rounded bg-tempo-surface hover:bg-tempo-hover text-zinc-300 transition-colors"
            title="Subtract custom"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
