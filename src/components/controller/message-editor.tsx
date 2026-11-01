import React, { useState } from 'react';
import { AudienceMessage, MessageVariant } from '@/types/display';
import { MessageSquare, Send, EyeOff, Eye, Trash2, Check } from 'lucide-react';

interface MessageEditorProps {
  message: AudienceMessage | null;
  onSetMessage: (content: string, variant: MessageVariant) => void;
  onToggleVisibility: () => void;
  onClearMessage: () => void;
}

const PRESET_MESSAGES = [
  'Please return to your seats.',
  'The next session begins shortly.',
  'Refreshments will be served after this session.',
  'Thank you for your participation.',
  'Q&A will begin in 2 minutes.',
  'Please silence all mobile devices.',
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
    setTimeout(() => setJustPublished(false), 2000);
  };

  const selectPreset = (preset: string) => {
    setInputText(preset);
  };

  return (
    <div className="bg-tempo-card/60 border border-tempo-border/70 rounded-2xl p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-blue-400" />
          <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Audience Messages
          </h3>
        </div>
        {message && (
          <div className="flex items-center gap-2">
            <span
              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                message.visible
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {message.visible ? 'Visible on Display' : 'Hidden'}
            </span>
          </div>
        )}
      </div>

      {/* Preset Chips */}
      <div>
        <span className="text-[11px] font-medium text-slate-400 block mb-1.5">Quick Presets:</span>
        <div className="flex flex-wrap gap-1.5">
          {PRESET_MESSAGES.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => selectPreset(preset)}
              className="px-2 py-1 rounded-md bg-tempo-surface hover:bg-tempo-border/80 border border-tempo-border/50 text-[11px] text-slate-300 hover:text-white transition-colors"
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      {/* Message Input Form */}
      <form onSubmit={handlePublish} className="space-y-3">
        <textarea
          rows={2}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type message to broadcast to the stage/audience display..."
          className="w-full bg-tempo-surface border border-tempo-border rounded-xl p-3 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
        />

        <div className="flex items-center justify-between gap-2 pt-1">
          {/* Variant Selector */}
          <div className="flex items-center gap-2">
            <label className="text-[11px] text-slate-400">Position:</label>
            <select
              value={variant}
              onChange={(e) => setVariant(e.target.value as MessageVariant)}
              className="bg-tempo-surface border border-tempo-border rounded-lg px-2 py-1 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
            >
              <option value="banner">Bottom Banner</option>
              <option value="overlay">Full Overlay</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {message && (
              <>
                <button
                  type="button"
                  onClick={onToggleVisibility}
                  className="px-2.5 py-1.5 rounded-lg bg-tempo-surface hover:bg-tempo-border/80 border border-tempo-border text-xs text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors"
                  title={message.visible ? 'Hide from display' : 'Show on display'}
                >
                  {message.visible ? (
                    <>
                      <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                      <span>Hide</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-3.5 h-3.5 text-slate-400" />
                      <span>Show</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={onClearMessage}
                  className="p-1.5 rounded-lg bg-tempo-surface hover:bg-rose-500/10 border border-tempo-border text-slate-400 hover:text-rose-400 transition-colors"
                  title="Clear message"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </>
            )}

            <button
              type="submit"
              disabled={!inputText.trim()}
              className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
            >
              {justPublished ? (
                <>
                  <Check className="w-3.5 h-3.5 text-white" />
                  <span>Broadcasted!</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Publish</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
