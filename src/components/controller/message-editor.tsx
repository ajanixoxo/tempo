import React, { useState } from 'react';
import { AudienceMessage, MessageVariant } from '@/types/display';
import { EyeOff, Eye, Trash2 } from 'lucide-react';

interface MessageEditorProps {
  message: AudienceMessage | null;
  onSetMessage: (content: string, variant: MessageVariant) => void;
  onToggleVisibility: () => void;
  onClearMessage: () => void;
}

const PRESET_MESSAGES = [
  { label: 'Return to Seats', text: 'Please return to your seats.' },
  { label: 'Next Session', text: 'The next session begins shortly.' },
  { label: 'Refreshments', text: 'Refreshments will be served outside.' },
  { label: 'Q&A in 2m', text: 'Q&A will begin in 2 minutes.' },
  { label: 'Silence Phones', text: 'Please silence mobile devices.' },
];

export const MessageEditor: React.FC<MessageEditorProps> = ({
  message,
  onSetMessage,
  onToggleVisibility,
  onClearMessage,
}) => {
  const [inputText, setInputText] = useState(message?.content || '');
  const [variant, setVariant] = useState<MessageVariant>(message?.variant || 'banner');
  const [justPublished, setJustPublished] = useState(false);

  const handlePublish = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    onSetMessage(inputText.trim(), variant);
    setJustPublished(true);
    setTimeout(() => setJustPublished(false), 1500);
  };

  return (
    <div className="space-y-3 pt-3 border-t border-tempo-hairline">
      <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
        <span className="uppercase tracking-widest">Stage Message</span>
        {message && (
          <span className={message.visible ? 'text-emerald-400' : 'text-zinc-500'}>
            {message.visible ? 'Live on Screen' : 'Hidden'}
          </span>
        )}
      </div>

      {/* Preset Chips */}
      <div className="flex flex-wrap gap-1">
        {PRESET_MESSAGES.map((preset) => (
          <button
            key={preset.label}
            type="button"
            onClick={() => setInputText(preset.text)}
            className="px-2 py-0.5 rounded bg-tempo-surface hover:bg-tempo-hover text-[10px] text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Textarea Form */}
      <form onSubmit={handlePublish} className="space-y-2">
        <textarea
          rows={2}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Message to display on external screen..."
          className="w-full bg-tempo-surface rounded-lg p-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:bg-tempo-hover transition-colors resize-none"
        />

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs text-zinc-400">
            <span className="text-[11px] font-mono">Format:</span>
            <select
              value={variant}
              onChange={(e) => setVariant(e.target.value as MessageVariant)}
              className="bg-tempo-surface rounded px-2 py-1 text-xs text-zinc-300 focus:outline-none"
            >
              <option value="banner">Banner (Bottom)</option>
              <option value="overlay">Overlay (Center)</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            {message && (
              <>
                <button
                  type="button"
                  onClick={onToggleVisibility}
                  className="px-2.5 py-1 rounded-md bg-tempo-surface hover:bg-tempo-hover text-xs text-zinc-300 hover:text-white transition-colors"
                  title={message.visible ? 'Hide from display' : 'Show on display'}
                >
                  {message.visible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
                <button
                  type="button"
                  onClick={onClearMessage}
                  className="p-1 rounded-md bg-tempo-surface hover:bg-tempo-hover text-zinc-500 hover:text-red-400 transition-colors"
                  title="Clear message"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </>
            )}

            <button
              type="submit"
              disabled={!inputText.trim()}
              className="px-3.5 py-1 rounded-md bg-zinc-100 hover:bg-white disabled:bg-tempo-surface disabled:text-zinc-600 text-zinc-950 text-xs font-medium transition-colors"
            >
              {justPublished ? 'Sent' : 'Publish'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
