import React from 'react';
import { AudienceMessage } from '@/types/display';

interface MessageDisplayProps {
  message: AudienceMessage | null;
  textColor?: string;
}

export const MessageDisplay: React.FC<MessageDisplayProps> = ({ message, textColor = '#F4F4F5' }) => {
  if (!message || !message.visible || !message.content.trim()) {
    return null;
  }

  if (message.variant === 'overlay') {
    return (
      <div className="fixed inset-0 z-40 flex items-center justify-center p-8 bg-black/95 backdrop-blur-md animate-digit-fade">
        <div className="max-w-4xl text-center space-y-4 p-8">
          <p
            style={{ color: textColor }}
            className="text-4xl sm:text-6xl md:text-7xl font-light tracking-tight leading-tight"
          >
            {message.content}
          </p>
        </div>
      </div>
    );
  }

  // Bottom Banner
  return (
    <div className="w-full max-w-4xl mx-auto px-6 mb-8 z-30 animate-digit-morph">
      <div className="p-4 sm:p-5 rounded-lg bg-zinc-900/80 backdrop-blur-md text-center shadow-2xl">
        <p
          style={{ color: textColor }}
          className="text-lg sm:text-2xl md:text-3xl font-normal tracking-tight line-clamp-2"
        >
          {message.content}
        </p>
      </div>
    </div>
  );
};
