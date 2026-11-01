import Link from 'next/link';
import { ArrowRight, Monitor, Sliders, Clock, Sparkles } from 'lucide-react';

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col justify-between p-6 sm:p-12 max-w-6xl mx-auto">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-tempo-border/40 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">
            <Clock className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              Tempo
              <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                PRO
              </span>
            </h1>
            <p className="text-xs text-slate-400">Presentation & Event Timing System</p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Offline Ready
          </span>
        </div>
      </header>

      {/* Hero section */}
      <div className="my-auto py-12 flex flex-col items-center text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-tempo-surface border border-tempo-border text-xs text-slate-300 mb-6">
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          <span>Professional HDMI & Stage Multi-Screen Control</span>
        </div>

        <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">
          Time every session with confidence and precision.
        </h2>
        <p className="text-slate-400 text-base sm:text-lg mb-8 leading-relaxed">
          Manage countdowns, count-ups, stage cues, real-time clock and audience messages from your laptop while projecting seamlessly onto external TVs and screens.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <Link
            href="/controller"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm transition-all shadow-xl shadow-blue-600/25 group"
          >
            <Sliders className="w-4 h-4" />
            <span>Open Controller Dashboard</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>

          <Link
            href="/display"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-tempo-card hover:bg-tempo-surface border border-tempo-border text-slate-300 hover:text-white font-medium text-sm transition-colors"
          >
            <Monitor className="w-4 h-4 text-slate-400" />
            <span>Launch Audience Display</span>
          </Link>
        </div>
      </div>

      {/* Feature cards footer */}
      <footer className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-8 border-t border-tempo-border/40 text-left">
        <div className="p-4 rounded-xl bg-tempo-card/60 border border-tempo-border/50">
          <h3 className="text-sm font-semibold text-white mb-1 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-400" />
            Dual-Screen HDMI Sync
          </h3>
          <p className="text-xs text-slate-400 leading-normal">
            Independent stage display syncs via BroadcastChannel with zero lag and instant state recovery on reconnect.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-tempo-card/60 border border-tempo-border/50">
          <h3 className="text-sm font-semibold text-white mb-1 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            Timestamp-Based Engine
          </h3>
          <p className="text-xs text-slate-400 leading-normal">
            Drift-free elapsed and remaining time calculations. Zero drift even if the operator tab is minimized.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-tempo-card/60 border border-tempo-border/50">
          <h3 className="text-sm font-semibold text-white mb-1 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            Live Adjustments & Messages
          </h3>
          <p className="text-xs text-slate-400 leading-normal">
            Add or subtract time live without interrupting presenters. Broadcast custom messages and stage alerts instantly.
          </p>
        </div>
      </footer>
    </main>
  );
}
