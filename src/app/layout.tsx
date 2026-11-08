import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Tempo — Event Timer',
  description: 'Minimalist offline presentation and event timer with external screen sync',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/icon.svg',
  },
};

export const viewport: Viewport = {
  themeColor: '#080809',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-tempo-bg text-zinc-100 antialiased selection:bg-zinc-800 selection:text-white">
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (
                typeof window !== 'undefined' &&
                'serviceWorker' in navigator &&
                window.location.hostname !== 'localhost' &&
                window.location.hostname !== '127.0.0.1' &&
                window.location.protocol.startsWith('http')
              ) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js').catch((err) => {
                    console.log('SW registration skipped:', err);
                  });
                });
              } else if (
                typeof window !== 'undefined' &&
                'serviceWorker' in navigator &&
                (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
              ) {
                // Clear any service workers and caches on localhost to ensure clean dev server rendering
                navigator.serviceWorker.getRegistrations().then((registrations) => {
                  for (const registration of registrations) {
                    registration.unregister();
                  }
                });
                if ('caches' in window) {
                  caches.keys().then((names) => {
                    for (const name of names) {
                      caches.delete(name);
                    }
                  });
                }
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
