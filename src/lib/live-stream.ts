/**
 * In-memory event bus for real-time photo streaming (SSE).
 *
 * Photographers push events when photos are uploaded. Connected customers
 * and kiosk displays receive them instantly via Server-Sent Events.
 *
 * This is a process-level singleton — works perfectly on a single Vercel
 * serverless instance. For multi-instance scaling, swap with Redis pub/sub.
 */

export type LivePhotoEvent = {
  type: "new_photos";
  galleryId: string;
  locationId: string;
  photos: {
    id: string;
    thumbnailUrl: string;
    fullUrl: string;
    isHookImage: boolean;
    createdAt: string;
  }[];
  totalCount: number;
  photographerName?: string;
};

export type LiveEvent =
  | LivePhotoEvent
  | { type: "connected"; galleryToken: string }
  | { type: "heartbeat" };

type Listener = (event: LiveEvent) => void;

class LiveStreamBus {
  /** gallery magicLinkToken → Set of SSE listeners */
  private galleryListeners = new Map<string, Set<Listener>>();
  /** locationId → Set of SSE listeners (for TV display / location-wide stream) */
  private locationListeners = new Map<string, Set<Listener>>();

  // ── Gallery-scoped listeners ──────────────────────────────────────────

  subscribeGallery(token: string, listener: Listener): () => void {
    if (!this.galleryListeners.has(token)) {
      this.galleryListeners.set(token, new Set());
    }
    this.galleryListeners.get(token)!.add(listener);
    return () => {
      this.galleryListeners.get(token)?.delete(listener);
      if (this.galleryListeners.get(token)?.size === 0) {
        this.galleryListeners.delete(token);
      }
    };
  }

  notifyGallery(token: string, event: LiveEvent): void {
    const listeners = this.galleryListeners.get(token);
    if (listeners) {
      listeners.forEach((fn) => {
        try { fn(event); } catch {}
      });
    }
  }

  getGalleryViewerCount(token: string): number {
    return this.galleryListeners.get(token)?.size ?? 0;
  }

  // ── Location-scoped listeners (TV display, kiosk) ─────────────────────

  subscribeLocation(locationId: string, listener: Listener): () => void {
    if (!this.locationListeners.has(locationId)) {
      this.locationListeners.set(locationId, new Set());
    }
    this.locationListeners.get(locationId)!.add(listener);
    return () => {
      this.locationListeners.get(locationId)?.delete(listener);
      if (this.locationListeners.get(locationId)?.size === 0) {
        this.locationListeners.delete(locationId);
      }
    };
  }

  notifyLocation(locationId: string, event: LiveEvent): void {
    const listeners = this.locationListeners.get(locationId);
    if (listeners) {
      listeners.forEach((fn) => {
        try { fn(event); } catch {}
      });
    }
  }

  // ── Broadcast to both gallery + location listeners ────────────────────

  broadcast(token: string, locationId: string, event: LiveEvent): void {
    this.notifyGallery(token, event);
    this.notifyLocation(locationId, event);
  }

  // ── Stats ─────────────────────────────────────────────────────────────

  getStats() {
    let galleryConnections = 0;
    this.galleryListeners.forEach((s) => { galleryConnections += s.size; });
    let locationConnections = 0;
    this.locationListeners.forEach((s) => { locationConnections += s.size; });
    return {
      galleries: this.galleryListeners.size,
      galleryConnections,
      locations: this.locationListeners.size,
      locationConnections,
    };
  }
}

/** Singleton — survives across API route invocations within the same process */
const globalBus = globalThis as unknown as { __liveStreamBus?: LiveStreamBus };
export const liveStream: LiveStreamBus = globalBus.__liveStreamBus ??= new LiveStreamBus();
