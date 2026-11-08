import React, { useState } from 'react';
import { TimerModel } from '@/types/timer';
import { TimerCard } from './timer-card';
import { Plus, Search } from 'lucide-react';

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
    <div className="flex flex-col h-full bg-tempo-panel border-r border-tempo-hairline w-64 lg:w-72 flex-shrink-0 min-h-0 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-tempo-hairline space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-widest text-zinc-400">
              Timers
            </span>
            <span className="text-[11px] font-mono text-zinc-500">
              {timers.length}
            </span>
          </div>

          <button
            onClick={onCreateNew}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-tempo-surface hover:bg-tempo-hover text-zinc-300 hover:text-white text-xs font-medium transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Filter..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-tempo-surface rounded-md pl-8 pr-2.5 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:bg-tempo-hover transition-colors"
          />
        </div>
      </div>

      {/* Timer List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {filteredTimers.length === 0 ? (
          <div className="text-center py-12 px-4">
            <p className="text-xs text-zinc-500">No timers found</p>
            {searchQuery ? (
              <button
                onClick={() => setSearchQuery('')}
                className="mt-2 text-xs text-zinc-400 hover:text-white underline"
              >
                Clear filter
              </button>
            ) : (
              <button
                onClick={onCreateNew}
                className="mt-2 text-xs text-zinc-400 hover:text-white underline"
              >
                Create a timer
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
