/**
 * Local-network server adapter.
 *
 * When a sale-point kiosk runs in NetworkMode=LOCAL it acts as a lightweight
 * data source for any GALLERY_DISPLAY kiosks on the same Wi-Fi router. The
 * helpers here are framework-agnostic so they can be reused by either:
 *   - the on-prem Next.js process (default), or
 *   - a tiny standalone Express adapter for offline-only deployments.
 *
 * Endpoints exposed under /api/local/* mirror the cloud APIs but with two
 * differences:
 *   1. They never call Stripe / Cloudinary / Resend (no internet required).
 *   2. They write through the SyncLog so the night-sync engine can replay
 *      every mutation when the cloud comes back.
 */
import { prisma } from "@/lib/db";
import type { SyncStatus } from "@prisma/client";

export async function listLocalGalleries(locationId: string) {
  return prisma.gallery.findMany({
    where: { locationId },
    include: { customer: true, photographer: true, photos: { orderBy: { sortOrder: "asc" } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
}

export async function getLocalGallery(galleryId: string) {
  return prisma.gallery.findUnique({
    where: { id: galleryId },
    include: { customer: true, photographer: true, photos: { orderBy: { sortOrder: "asc" } } },
  });
}

export async function recordSyncIntent(opts: {
  type: "gallery" | "order" | "photo" | "cash" | "commission";
  localId: string;
  status?: SyncStatus;
}) {
  return prisma.syncLog.create({
    data: { type: opts.type, localId: opts.localId, status: opts.status || "PENDING" },
  });
}
