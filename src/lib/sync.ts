/**
 * Sync engine — replays every PENDING SyncLog row to the cloud when internet
 * is available. Runs on the sale-point kiosk in the background.
 *
 * The actual cloud transport is intentionally pluggable: in the default
 * deployment the sale-point IS the cloud (single Postgres), so the sync engine
 * is a no-op. In an air-gapped deployment, swap the `cloudClient` for a real
 * fetcher pointing at https://your-domain.com/api/sync/ingest.
 */
import { prisma } from "@/lib/db";

export type SyncStats = { pending: number; syncing: number; synced: number; failed: number };

export async function getSyncStats(): Promise<SyncStats> {
  const [pending, syncing, synced, failed] = await Promise.all([
    prisma.syncLog.count({ where: { status: "PENDING" } }),
    prisma.syncLog.count({ where: { status: "SYNCING" } }),
    prisma.syncLog.count({ where: { status: "SYNCED" } }),
    prisma.syncLog.count({ where: { status: "FAILED" } }),
  ]);
  return { pending, syncing, synced, failed };
}

export async function markSynced(id: string, cloudId?: string) {
  return prisma.syncLog.update({
    where: { id },
    data: { status: "SYNCED", cloudId, syncedAt: new Date() },
  });
}

export async function markFailed(id: string, error: string) {
  return prisma.syncLog.update({ where: { id }, data: { status: "FAILED", error } });
}

export async function runSyncOnce(cloudClient?: { ingest(payload: any): Promise<{ id: string }> }) {
  const pending = await prisma.syncLog.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "asc" },
    take: 50,
  });
  let synced = 0;
  for (const row of pending) {
    await prisma.syncLog.update({ where: { id: row.id }, data: { status: "SYNCING" } });
    try {
      // No-op default: in single-DB deployments the cloud IS the local DB.
      const cloudId = cloudClient ? (await cloudClient.ingest({ type: row.type, localId: row.localId })).id : row.localId;
      await markSynced(row.id, cloudId);
      synced++;
    } catch (e: any) {
      await markFailed(row.id, e?.message || "unknown");
    }
  }
  return { processed: pending.length, synced };
}
