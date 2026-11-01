'use client';

import dynamic from 'next/dynamic';

const AudienceDisplay = dynamic(
  () => import('@/components/display/audience-display').then((mod) => mod.AudienceDisplay),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-tempo-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="w-5 h-5 border border-zinc-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-zinc-500 font-mono">Syncing display...</span>
        </div>
      </div>
    ),
  }
);

export default function DisplayPage() {
  return <AudienceDisplay />;
}
