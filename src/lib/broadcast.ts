import { BroadcastPayload } from '@/types/messages';

const CHANNEL_NAME = 'tempo_event_bus';

export type MessageHandler = (payload: BroadcastPayload) => void;

class TempoBroadcastChannel {
  private channel: BroadcastChannel | null = null;
  private listeners: Set<MessageHandler> = new Set();
  private isSupported: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      if ('BroadcastChannel' in window) {
        try {
          this.channel = new BroadcastChannel(CHANNEL_NAME);
          this.isSupported = true;
          this.channel.onmessage = (event: MessageEvent<BroadcastPayload>) => {
            this.notifyListeners(event.data);
          };
        } catch (e) {
          console.warn('BroadcastChannel initialization failed, falling back to storage events:', e);
          this.setupStorageFallback();
        }
      } else {
        this.setupStorageFallback();
      }
    }
  }

  private setupStorageFallback(): void {
    if (typeof window === 'undefined') return;
    window.addEventListener('storage', (event) => {
      if (event.key === '__tempo_broadcast_fallback__' && event.newValue) {
        try {
          const payload = JSON.parse(event.newValue) as BroadcastPayload;
          this.notifyListeners(payload);
        } catch (e) {
          console.error('Storage fallback message parse error:', e);
        }
      }
    });
  }

  private notifyListeners(payload: BroadcastPayload): void {
    this.listeners.forEach((listener) => {
      try {
        listener(payload);
      } catch (err) {
        console.error('Error in broadcast listener callback:', err);
      }
    });
  }

  public publish(payload: BroadcastPayload): void {
    if (this.channel && this.isSupported) {
      try {
        this.channel.postMessage(payload);
      } catch (e) {
        console.error('Failed to postMessage on BroadcastChannel:', e);
      }
    } else if (typeof window !== 'undefined') {
      try {
        // Fallback using LocalStorage event
        window.localStorage.setItem('__tempo_broadcast_fallback__', JSON.stringify(payload));
      } catch (e) {
        console.error('Failed to publish fallback message:', e);
      }
    }
  }

  public subscribe(handler: MessageHandler): () => void {
    this.listeners.add(handler);
    return () => {
      this.listeners.delete(handler);
    };
  }

  public close(): void {
    if (this.channel) {
      this.channel.close();
      this.channel = null;
    }
    this.listeners.clear();
  }
}

// Singleton instance
export const broadcastBus = new TempoBroadcastChannel();
