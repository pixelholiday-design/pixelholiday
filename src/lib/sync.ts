/**
 * Sync engine — replays every PENDING SyncLog + SyncQueue row to the cloud when
 * internet is available. Runs on the sale-point kiosk in the background.
 *
 * The actual cloud transport is intentionally pluggable: in the default
 * deployment the sale-point IS the cloud (single Postgres), so the sync engine
 * is a no-op. In an air-gapped deployment, swap the `cloudClient` for a real
 * fetcher pointing at https://your-domain.com/api/sync/ingest.
 */
import { prisma } from "@/lib/db";

export type SyncStats = {
  pending: number;
  syncing: number;
  synced: number;
  failed: number;
  // SyncQueue stats (from /api/local/* mutations)
  queuePending: number;
  queueSynced: number;
  queueFailed: number;
  lastSyncedAt: Date | null;
};

export async function getSyncStats(): Promise<SyncStats> {
  const [pending, syncing, synced, failed, qPending, qSynced, qFailed, lastQ] =
    await Promise.all([
      prisma.syncLog.count({ where: { status: "PENDING" } }).catch(() => 0),
      prisma.syncLog.count({ where: { status: "SYNCING" } }).catch(() => 0),
      prisma.syncLog.count({ where: { status: "SYNCED" } }).catch(() => 0),
      prisma.syncLog.count({ where: { status: "FAILED" } }).catch(() => 0),
      prisma.syncQueue.count({ where: { status: "pending" } }).catch(() => 0),
      prisma.syncQueue.count({ where: { status: "synced" } }).catch(() => 0),
      prisma.syncQueue.count({ where: { status: "failed" } }).catch(() => 0),
      prisma.syncQueue
        .findFirst({
          where: { status: "synced" },
          orderBy: { syncedAt: "desc" },
          select: { syncedAt: true },
        })
        .catch(() => null),
    ]);
  return {
    pending: pending + qPending,
    syncing,
    synced: synced + qSynced,
    failed: failed + qFailed,
    queuePending: qPending,
    queueSynced: qSynced,
    queueFailed: qFailed,
    lastSyncedAt: lastQ?.syncedAt || null,
  };
}

export async function markSynced(id: string, cloudId?: string) {
  return prisma.syncLog.update({
    where: { id },
    data: { status: "SYNCED", cloudId, syncedAt: new Date() },
  });
}

export async function markFailed(id: string, error: string) {
  return prisma.syncLog.update({
    where: { id },
    data: { status: "FAILED", error },
  });
}

export async function runSyncOnce(cloudClient?: {
  ingest(payload: any): Promise<{ id: string }>;
}) {
  let synced = 0;
  let processed = 0;

  // ── Process SyncLog rows (legacy/primary) ──
  const logPending = await prisma.syncLog
    .findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "asc" },
      take: 50,
    })
    .catch(() => []);

  for (const row of logPending) {
    processed++;
    await prisma.syncLog.update({
      where: { id: row.id },
      data: { status: "SYNCING" },
    });
    try {
      const cloudId = cloudClient
        ? (await cloudClient.ingest({ type: row.type, localId: row.localId }))
            .id
        : row.localId;
      await markSynced(row.id, cloudId);
      synced++;
    } catch (e: any) {
      await markFailed(row.id, e?.message || "unknown");
    }
  }

  // ── Process SyncQueue rows (from /api/local/* mutations) ──
  const queuePending = await prisma.syncQueue
    .findMany({
      where: { status: "pending" },
      orderBy: [{ priority: "asc" }, { createdAt: "asc" }],
      take: 50,
    })
    .catch(() => []);

  for (const row of queuePending) {
    processed++;
    await prisma.syncQueue.update({
      where: { id: row.id },
      data: { status: "syncing" },
    });
    try {
      // In single-DB mode, data is already in the DB — just mark as synced
      const cloudId = cloudClient
        ? (
            await cloudClient.ingest({
              type: row.type,
              action: row.action,
              localId: row.localId,
              payload: row.payload,
            })
          ).id
        : row.localId;
      await prisma.syncQueue.update({
        where: { id: row.id },
        data: { status: "synced", cloudId, syncedAt: new Date() },
      });
      synced++;
    } catch (e: any) {
      await prisma.syncQueue.update({
        where: { id: row.id },
        data: {
          status: "failed",
          lastError: e?.message || "unknown",
          attempts: { increment: 1 },
        },
      });
    }
  }

  return { processed, synced };
}
