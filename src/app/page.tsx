import Link from 'next/link';
import { ArrowRight, ArrowUpRight } from 'lucide-react';

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col justify-between p-8 sm:p-16 max-w-5xl mx-auto selection:bg-zinc-800 selection:text-white">
      {/* Quiet Minimal Header */}
      <header className="flex items-center justify-between pb-8">
        <span className="text-sm font-mono tracking-widest uppercase text-zinc-400">
          tempo
        </span>

        <span className="text-xs font-mono text-zinc-400">
          offline / hdmi sync
        </span>
      </header>

      {/* Main Focus */}
      <div className="my-auto py-16 sm:py-24 max-w-xl">
        <h1 className="text-4xl sm:text-6xl font-medium tracking-tight text-white mb-6 leading-[1.1]">
          Event timer &amp; stage display.
        </h1>
        <p className="text-zinc-400 text-base sm:text-lg mb-10 leading-relaxed font-normal">
          Manage session countdowns, live stage announcements, and real-time cues from your laptop while projecting onto external screens.
        </p>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <Link
            href="/controller"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 font-medium text-sm transition-colors"
          >
            <span>Open Controller</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/display"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-tempo-surface hover:bg-tempo-hover text-zinc-300 hover:text-white text-sm transition-colors"
          >
            <span>Launch Display Window</span>
            <ArrowUpRight className="w-4 h-4 text-zinc-400" />
          </Link>
        </div>
      </div>

      {/* Understated Minimal Specs Footer */}
      <footer className="pt-8 border-t border-tempo-hairline flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 text-xs font-mono text-zinc-400">
        <div className="flex flex-wrap items-center gap-6">
          <span>Timestamp drift-free engine</span>
          <span>•</span>
          <span>BroadcastChannel local sync</span>
          <span>•</span>
          <span>Live time adjustments</span>
        </div>

        <div>
          <span>Press Space to toggle • F for fullscreen</span>
        </div>
      </footer>
    </main>
  );
}
