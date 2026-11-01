import React, { useState } from 'react';
import { TimerModel } from '@/types/timer';
import { TimerCard } from './timer-card';
import { Plus, Search, Layers } from 'lucide-react';

interface TimerLibraryProps {
  timers: TimerModel[];
  activeTimerId: string | null;
  onSelect: (id: string) => void;
  onCreateNew: () => void;
  onEdit: (timer: TimerModel) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
}

export const TimerLibrary: React.FC<TimerLibraryProps> = ({
  timers,
  activeTimerId,
  onSelect,
  onCreateNew,
  onEdit,
  onDuplicate,
  onDelete,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTimers = timers.filter((t) => {
    const matchName = t.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchDesc = (t.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchName || matchDesc;
  });

  return (
    <div className="flex flex-col h-full bg-tempo-card/70 border-r border-tempo-border/70 w-80 lg:w-96 flex-shrink-0">
      {/* Header */}
      <div className="p-4 border-b border-tempo-border/70 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-400" />
            <h2 className="text-sm font-semibold text-white tracking-wide uppercase text-[12px]">
              Timers Library
            </h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-tempo-surface border border-tempo-border text-slate-400">
              {timers.length}
            </span>
          </div>

          <button
            onClick={onCreateNew}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Timer</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search timers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-tempo-surface/80 border border-tempo-border rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
          />
        </div>
      </div>

      {/* Timer List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {filteredTimers.length === 0 ? (
          <div className="text-center py-12 px-4">
            <p className="text-xs text-slate-400">No timers found</p>
            {searchQuery ? (
              <button
                onClick={() => setSearchQuery('')}
                className="mt-2 text-xs text-blue-400 hover:underline"
              >
                Clear search filter
              </button>
            ) : (
              <button
                onClick={onCreateNew}
                className="mt-2 text-xs text-blue-400 hover:underline"
              >
                Create your first timer
              </button>
            )}
          </div>
        ) : (
          filteredTimers.map((timer) => (
            <TimerCard
              key={timer.id}
              timer={timer}
              isActive={timer.id === activeTimerId}
              onSelect={onSelect}
              onEdit={onEdit}
              onDuplicate={onDuplicate}
              onDelete={onDelete}
            />
          ))
        )}
      </div>
    </div>
  );
};
