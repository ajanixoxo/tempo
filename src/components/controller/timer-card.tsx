import React from 'react';
import { TimerModel } from '@/types/timer';
import { formatSecondsToTime } from '@/lib/time-format';
import { Copy, Edit3, Trash2 } from 'lucide-react';

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
      ? `Target ${formatSecondsToTime(timer.targetDuration).formatted}`
      : 'Count-up';

  const getStatusLabel = () => {
    const currentElapsed =
      timer.accumulatedElapsed +
      (timer.status === 'running' && timer.startedAt ? (Date.now() - timer.startedAt) / 1000 : 0);
    const isOvertime =
      timer.type === 'countdown' &&
      timer.allowNegative &&
      timer.initialDuration + timer.timeAdjustment - currentElapsed < 0;

    if (isOvertime) {
      return (
        <span className="text-red-400 font-mono text-[11px]">
          {timer.status === 'running' ? 'overtime' : 'overtime (paused)'}
        </span>
      );
    }

    switch (timer.status) {
      case 'running':
        return <span className="text-emerald-400 font-mono text-[11px]">running</span>;
      case 'paused':
        return <span className="text-amber-400 font-mono text-[11px]">paused</span>;
      case 'completed':
        return <span className="text-zinc-500 font-mono text-[11px]">ended</span>;
      case 'idle':
      default:
        return <span className="text-zinc-600 font-mono text-[11px]">ready</span>;
    }
  };

  return (
    <div
      onClick={() => onSelect(timer.id)}
      className={`group relative p-3 rounded-lg transition-colors cursor-pointer ${
        isActive
          ? 'bg-tempo-surface text-white'
          : 'hover:bg-tempo-hover/60 text-zinc-400 hover:text-zinc-200'
      }`}
    >
      <div className="flex items-center justify-between gap-2 mb-1">
        <h4
          className={`text-xs font-medium truncate ${
            isActive ? 'text-white' : 'text-zinc-300 group-hover:text-white'
          }`}
        >
          {timer.name}
        </h4>
        {getStatusLabel()}
      </div>

      <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500">
        <div className="flex items-center gap-2">
          <span>{formattedDuration}</span>
          <span>•</span>
          <span className="capitalize">{timer.type}</span>
        </div>

        {/* Action icons on hover */}
        <div
          className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            title="Edit"
            onClick={() => onEdit(timer)}
            className="p-1 rounded text-zinc-500 hover:text-zinc-200 hover:bg-tempo-surface transition-colors"
          >
            <Edit3 className="w-3 h-3" />
          </button>
          <button
            title="Duplicate"
            onClick={() => onDuplicate(timer.id)}
            className="p-1 rounded text-zinc-500 hover:text-zinc-200 hover:bg-tempo-surface transition-colors"
          >
            <Copy className="w-3 h-3" />
          </button>
          <button
            title="Delete"
            onClick={() => onDelete(timer.id)}
            className="p-1 rounded text-zinc-500 hover:text-red-400 hover:bg-tempo-surface transition-colors"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
