/**
 * IndexedDB-based photo cache for offline kiosk operation.
 * Photos are pre-cached when synced from the cloud/local server.
 * Gallery kiosk reads from IndexedDB for instant display.
 */

const DB_NAME = "ph-kiosk-cache";
const DB_VERSION = 1;
const STORE_PHOTOS = "photos";
const STORE_META = "meta";

let _db: IDBDatabase | null = null;

export async function initPhotoCache(): Promise<IDBDatabase> {
  if (_db) return _db;
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_PHOTOS)) {
        const store = db.createObjectStore(STORE_PHOTOS, { keyPath: "photoId" });
        store.createIndex("cachedAt", "cachedAt", { unique: false });
        store.createIndex("galleryId", "galleryId", { unique: false });
      }
      if (!db.objectStoreNames.contains(STORE_META)) {
        db.createObjectStore(STORE_META, { keyPath: "key" });
      }
    };
    req.onsuccess = (e) => {
      _db = (e.target as IDBOpenDBRequest).result;
      resolve(_db);
    };
    req.onerror = () => reject(req.error);
  });
}

export async function cachePhoto(
  photoId: string,
  blob: Blob,
  galleryId?: string
): Promise<void> {
  const db = await initPhotoCache();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_PHOTOS, "readwrite");
    tx.objectStore(STORE_PHOTOS).put({
      photoId,
      galleryId: galleryId ?? null,
      blob,
      sizeBytes: blob.size,
      cachedAt: Date.now(),
    });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getCachedPhoto(photoId: string): Promise<Blob | null> {
  const db = await initPhotoCache();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_PHOTOS, "readonly");
    const req = tx.objectStore(STORE_PHOTOS).get(photoId);
    req.onsuccess = () => resolve(req.result?.blob ?? null);
    req.onerror = () => reject(req.error);
  });
}

/**
 * Pre-fetches all photos for a gallery and stores them in IndexedDB.
 * Skips photos that are already cached.
 */
export async function cacheGalleryPhotos(
  galleryId: string,
  photos: { id: string; url: string }[],
  onProgress?: (done: number, total: number) => void
): Promise<void> {
  const db = await initPhotoCache();

  // Determine which photos are not yet cached
  const uncached: { id: string; url: string }[] = [];
  await Promise.all(
    photos.map(
      (p) =>
        new Promise<void>((res) => {
          const req = db
            .transaction(STORE_PHOTOS, "readonly")
            .objectStore(STORE_PHOTOS)
            .get(p.id);
          req.onsuccess = () => {
            if (!req.result) uncached.push(p);
            res();
          };
          req.onerror = () => {
            uncached.push(p);
            res();
          };
        })
    )
  );

  let done = photos.length - uncached.length;
  onProgress?.(done, photos.length);

  for (const p of uncached) {
    try {
      const resp = await fetch(p.url);
      if (!resp.ok) continue;
      const blob = await resp.blob();
      await cachePhoto(p.id, blob, galleryId);
    } catch {
      // Non-fatal — skip this photo
    }
    done++;
    onProgress?.(done, photos.length);
  }
}

export async function getCacheStats(): Promise<{
  count: number;
  sizeBytes: number;
}> {
  const db = await initPhotoCache();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_PHOTOS, "readonly");
    const req = tx.objectStore(STORE_PHOTOS).getAll();
    req.onsuccess = () => {
      const rows: any[] = req.result ?? [];
      resolve({
        count: rows.length,
        sizeBytes: rows.reduce((s, r) => s + (r.sizeBytes ?? 0), 0),
      });
    };
    req.onerror = () => reject(req.error);
  });
}

/**
 * Deletes cached photos older than maxAgeDays.
 * Returns the number of entries removed.
 */
export async function clearExpiredCache(maxAgeDays: number): Promise<number> {
  const db = await initPhotoCache();
  const cutoff = Date.now() - maxAgeDays * 24 * 60 * 60 * 1000;
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_PHOTOS, "readwrite");
    const store = tx.objectStore(STORE_PHOTOS);
    const index = store.index("cachedAt");
    const range = IDBKeyRange.upperBound(cutoff);
    const req = index.openCursor(range);
    let removed = 0;
    req.onsuccess = (e) => {
      const cursor = (e.target as IDBRequest<IDBCursorWithValue>).result;
      if (cursor) {
        store.delete(cursor.primaryKey);
        removed++;
        cursor.continue();
      }
    };
    tx.oncomplete = () => resolve(removed);
    tx.onerror = () => reject(tx.error);
  });
}

/** Clears the entire photo cache. Returns removed count. */
export async function clearAllCache(): Promise<number> {
  const db = await initPhotoCache();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_PHOTOS, "readwrite");
    const store = tx.objectStore(STORE_PHOTOS);
    const countReq = store.count();
    countReq.onsuccess = () => {
      const n = countReq.result;
      store.clear();
      tx.oncomplete = () => resolve(n);
    };
    tx.onerror = () => reject(tx.error);
  });
}

/** Returns a blob: URL for a cached photo, or null if not cached. */
export async function getCachedPhotoUrl(photoId: string): Promise<string | null> {
  const blob = await getCachedPhoto(photoId);
  if (!blob) return null;
  return URL.createObjectURL(blob);
}
