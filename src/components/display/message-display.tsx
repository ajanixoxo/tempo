import React from 'react';
import { AudienceMessage } from '@/types/display';
import { Bell } from 'lucide-react';

interface MessageDisplayProps {
  message: AudienceMessage | null;
  textColor?: string;
}

export const MessageDisplay: React.FC<MessageDisplayProps> = ({ message, textColor = '#FFFFFF' }) => {
  if (!message || !message.visible || !message.content.trim()) {
    return null;
  }

  if (message.variant === 'overlay') {
    return (
      <div className="fixed inset-0 z-40 flex items-center justify-center p-8 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
        <div className="max-w-4xl text-center space-y-6 p-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-sm font-semibold uppercase tracking-wider">
            <Bell className="w-4 h-4 animate-bounce" />
            <span>Important Announcement</span>
          </div>
          <p
            style={{ color: textColor }}
            className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-tight drop-shadow-lg"
          >
            {message.content}
          </p>
        </div>
      </div>
    );
  }

  // Bottom Banner
  return (
    <div className="w-full max-w-5xl mx-auto px-6 mb-8 animate-in slide-in-from-bottom duration-300 z-30">
      <div className="p-4 sm:p-5 rounded-2xl bg-blue-950/70 border border-blue-500/40 backdrop-blur-md shadow-2xl flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center flex-shrink-0 border border-blue-500/30">
          <Bell className="w-5 h-5 animate-pulse" />
        </div>
        <p
          style={{ color: textColor }}
          className="text-lg sm:text-2xl md:text-3xl font-bold tracking-tight text-white line-clamp-2"
        >
          {message.content}
        </p>
      </div>
    </div>
  );
};
