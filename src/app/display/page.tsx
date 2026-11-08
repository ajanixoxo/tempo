'use client';

import React, { useEffect, useState } from 'react';
import { AudienceDisplay } from '@/components/display/audience-display';

export default function DisplayPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-tempo-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="w-5 h-5 border border-zinc-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-zinc-500 font-mono">Syncing display...</span>
        </div>
      </div>
    );
  }

  return <AudienceDisplay />;
}
