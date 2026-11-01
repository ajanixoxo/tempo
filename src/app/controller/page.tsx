'use client';

import dynamic from 'next/dynamic';

// Dynamic import with ssr: false to prevent hydration mismatch with LocalStorage
const DashboardLayout = dynamic(
  () =>
    import('@/components/controller/dashboard-layout').then((mod) => mod.DashboardLayout),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-tempo-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-slate-400 font-mono">Loading Tempo Controller...</span>
        </div>
      </div>
    ),
  }
);

export default function ControllerPage() {
  return <DashboardLayout />;
}
