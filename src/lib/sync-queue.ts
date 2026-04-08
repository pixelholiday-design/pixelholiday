import { prisma } from "@/lib/db";

/**
 * Sync queue helper. Every mutation that happens in LOCAL mode on the sale
 * kiosk goes through this so that the night-sync engine can replay it
 * against the cloud Postgres + R2 + Cloudinary when internet is available.
 *
 * Priority: 1=highest (orders, payments) → 5=normal (photos, view logs).
 */

export type SyncEntry = {
  type: "gallery" | "photo" | "order" | "commission" | "cash" | "favorite";
  action: "create" | "update" | "delete";
  localId: string;
  payload: unknown;
  priority?: number;
};

export async function enqueueSync(entry: SyncEntry) {
  return prisma.syncQueue.create({
    data: {
      type: entry.type,
      action: entry.action,
      localId: entry.localId,
      payload: JSON.stringify(entry.payload),
      priority: entry.priority ?? (entry.type === "order" || entry.type === "cash" ? 1 : 5),
      status: "pending",
    },
  });
}

export async function pendingSyncCount() {
  return prisma.syncQueue.count({ where: { status: "pending" } });
}

export async function listPending(limit = 50) {
  return prisma.syncQueue.findMany({
    where: { status: "pending" },
    orderBy: [{ priority: "asc" }, { createdAt: "asc" }],
    take: limit,
  });
}

export async function markSynced(id: string, cloudId?: string) {
  return prisma.syncQueue.update({
    where: { id },
    data: { status: "synced", cloudId, syncedAt: new Date() },
  });
}

export async function markFailed(id: string, error: string) {
  return prisma.syncQueue.update({
    where: { id },
    data: { status: "failed", lastError: error, attempts: { increment: 1 } },
  });
}

export async function syncStats() {
  const [pending, syncing, synced, failed] = await Promise.all([
    prisma.syncQueue.count({ where: { status: "pending" } }),
    prisma.syncQueue.count({ where: { status: "syncing" } }),
    prisma.syncQueue.count({ where: { status: "synced" } }),
    prisma.syncQueue.count({ where: { status: "failed" } }),
  ]);
  const last = await prisma.syncQueue.findFirst({
    where: { status: "synced" },
    orderBy: { syncedAt: "desc" },
    select: { syncedAt: true },
  });
  return { pending, syncing, synced, failed, lastSyncedAt: last?.syncedAt || null };
}
