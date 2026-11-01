'use client';

import dynamic from 'next/dynamic';

const AudienceDisplay = dynamic(
  () => import('@/components/display/audience-display').then((mod) => mod.AudienceDisplay),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-[#0A0C10] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-slate-400 font-mono">Connecting Audience Display...</span>
        </div>
      </div>
    ),
  }
);

export default function DisplayPage() {
  return <AudienceDisplay />;
}
