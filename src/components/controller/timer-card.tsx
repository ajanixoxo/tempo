import React from 'react';
import { TimerModel } from '@/types/timer';
import { formatSecondsToTime } from '@/lib/time-format';
import { Copy, Edit3, Trash2, ArrowUpRight, Play, Pause, CheckCircle2 } from 'lucide-react';

interface TimerCardProps {
  timer: TimerModel;
  isActive: boolean;
  onSelect: (id: string) => void;
  onEdit: (timer: TimerModel) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
}

export const TimerCard: React.FC<TimerCardProps> = ({
  timer,
  isActive,
  onSelect,
  onEdit,
  onDuplicate,
  onDelete,
}) => {
  const formattedDuration =
    timer.type === 'countdown'
      ? formatSecondsToTime(timer.initialDuration).formatted
      : timer.targetDuration
      ? `Target: ${formatSecondsToTime(timer.targetDuration).formatted}`
      : 'No target';

  const getStatusBadge = () => {
    switch (timer.status) {
      case 'running':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Running
          </span>
        );
      case 'paused':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
            <Pause className="w-2.5 h-2.5" />
            Paused
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-full">
            <CheckCircle2 className="w-2.5 h-2.5" />
            Done
          </span>
        );
      case 'idle':
      default:
        return (
          <span className="text-[11px] font-medium text-slate-400 bg-slate-800/60 border border-slate-700/50 px-2 py-0.5 rounded-full">
            Idle
          </span>
        );
    }
  };

  return (
    <div
      onClick={() => onSelect(timer.id)}
      className={`group relative p-3.5 rounded-xl border transition-all cursor-pointer ${
        isActive
          ? 'bg-blue-600/10 border-blue-500/50 shadow-lg shadow-blue-500/5'
          : 'bg-tempo-card hover:bg-tempo-surface border-tempo-border/70 hover:border-tempo-border'
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h4
              className={`text-sm font-semibold truncate ${
                isActive ? 'text-blue-400' : 'text-slate-200 group-hover:text-white'
              }`}
            >
              {timer.name}
            </h4>
          </div>
          {timer.description && (
            <p className="text-xs text-slate-400 truncate mt-0.5">{timer.description}</p>
          )}
        </div>
        {getStatusBadge()}
      </div>

      <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
        <div className="flex items-center gap-2">
          <span className="capitalize px-1.5 py-0.5 rounded bg-tempo-surface border border-tempo-border/50 text-[10px] text-slate-300 font-mono">
            {timer.type}
          </span>
          <span className="font-mono text-slate-300">{formattedDuration}</span>
        </div>

        {/* Action icons */}
        <div
          className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            title="Edit Timer"
            onClick={() => onEdit(timer)}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-tempo-border/50 transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button
            title="Duplicate Timer"
            onClick={() => onDuplicate(timer.id)}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-tempo-border/50 transition-colors"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button
            title="Delete Timer"
            onClick={() => onDelete(timer.id)}
            className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
