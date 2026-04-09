/**
 * Unified Fotiqo / Fotiqo fulfillment engine.
 *
 * Called after a ShopOrder is marked PAID (Stripe webhook or manual trigger).
 *
 * Groups order items by lab routing:
 *   DIGITAL   → generate download URLs, email + WhatsApp delivery
 *   PRODIGI   → createProdigiOrder()
 *   PRINTFUL  → createPrintfulOrder()
 *   LOCAL     → createLocalPrintJob()
 *   MANUAL    → mark PENDING_MANUAL, alert staff
 *
 * Routing logic (in order of priority):
 *   1. product.labName === "PRODIGI"  → PRODIGI
 *   2. product.labName === "PRINTFUL" → PRINTFUL
 *   3. product.labName === "LOCAL"    → LOCAL
 *   4. product.fulfillmentType === "DIGITAL" → DIGITAL
 *   5. product.fulfillmentType === "AUTO"    → PRODIGI (default print lab)
 *   6. everything else               → MANUAL
 */

import { prisma } from "@/lib/db";
import { calculateCommission } from "./commission";
import { createProdigiOrder } from "./prodigi";
import { createPrintfulOrder } from "./printful";
import { createLocalPrintJob } from "./local";
import { emailGalleryLink } from "@/lib/email";
import { sendWhatsAppGalleryDelivery } from "@/lib/whatsapp";

// ── Types ─────────────────────────────────────────────────────────────────────

type LabGroup = "DIGITAL" | "PRODIGI" | "PRINTFUL" | "LOCAL" | "MANUAL";

export type FulfillmentResult = {
  orderId: string;
  status: "PROCESSING" | "PARTIAL" | "ERROR";
  digital: number;
  prodigi: number;
  printful: number;
  local: number;
  manual: number;
  /** Legacy alias for prodigi (backward-compat with existing callers) */
  physical: number;
  labOrderId?: string;
  printfulOrderId?: string;
  localJobIds?: string[];
  commission: number;
  error?: string;
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function routeItem(item: {
  product: { labName: string | null; fulfillmentType: string };
}): LabGroup {
  const lab = item.product.labName?.toUpperCase();
  if (lab === "PRODIGI") return "PRODIGI";
  if (lab === "PRINTFUL") return "PRINTFUL";
  if (lab === "LOCAL") return "LOCAL";
  if (item.product.fulfillmentType === "DIGITAL") return "DIGITAL";
  if (item.product.fulfillmentType === "AUTO") return "PRODIGI";
  return "MANUAL";
}

function buildDownloadUrl(photoId: string): string {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "";
  return `${base}/api/photos/${photoId}/download`;
}

function buildGalleryUrl(token: string): string {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "";
  return `${base}/gallery/${token}`;
}

// ── Main engine ───────────────────────────────────────────────────────────────

export async function fulfillOrder(shopOrderId: string): Promise<FulfillmentResult> {
  // ── Load order ─────────────────────────────────────────────────────────────
  let order: any;
  try {
    order = await prisma.shopOrder.findUnique({
      where: { id: shopOrderId },
      include: {
        items: { include: { product: true } },
        customer: true,
      },
    });
  } catch (err: any) {
    return {
      orderId: shopOrderId,
      status: "ERROR",
      digital: 0, prodigi: 0, printful: 0, local: 0, manual: 0, physical: 0,
      commission: 0,
      error: err.message,
    };
  }

  if (!order) {
    return {
      orderId: shopOrderId,
      status: "ERROR",
      digital: 0, prodigi: 0, printful: 0, local: 0, manual: 0, physical: 0,
      commission: 0,
      error: "Order not found",
    };
  }

  // ── Group items by lab ─────────────────────────────────────────────────────
  const groups: Record<LabGroup, typeof order.items> = {
    DIGITAL: [],
    PRODIGI: [],
    PRINTFUL: [],
    LOCAL: [],
    MANUAL: [],
  };
  for (const item of order.items) {
    groups[routeItem(item)].push(item);
  }

  const updates: Promise<unknown>[] = [];
  let labOrderId: string | undefined;
  let printfulOrderId: string | undefined;
  let localJobIds: string[] | undefined;

  // ── 1. DIGITAL – generate download URLs, deliver via email + WhatsApp ──────
  if (groups.DIGITAL.length > 0) {
    updates.push(
      prisma.shopOrderItem
        .updateMany({
          where: { id: { in: groups.DIGITAL.map((i: any) => i.id) } },
          data: { status: "DELIVERED" },
        })
        .catch(() => null),
    );

    // Build download links
    const downloadLinks = groups.DIGITAL
      .map((i: any) => i.photoId ? buildDownloadUrl(i.photoId) : null)
      .filter(Boolean) as string[];

    // Fall back to gallery link if available
    let deliveryUrl =
      downloadLinks.length === 1
        ? downloadLinks[0]
        : downloadLinks[0] ?? null;

    if (!deliveryUrl && order.galleryId) {
      try {
        const gallery = await prisma.gallery.findUnique({
          where: { id: order.galleryId },
          select: { magicLinkToken: true },
        });
        if (gallery?.magicLinkToken) {
          deliveryUrl = buildGalleryUrl(gallery.magicLinkToken);
        }
      } catch {
        // non-critical
      }
    }

    if (deliveryUrl) {
      const customer = order.customer;
      // Email
      if (customer?.email) {
        emailGalleryLink(customer.email, deliveryUrl).catch((e: any) =>
          console.error("[fulfillOrder] email failed:", e.message),
        );
      }
      // WhatsApp
      if (customer?.whatsapp) {
        sendWhatsAppGalleryDelivery(customer.whatsapp, deliveryUrl).catch(
          (e: any) =>
            console.error("[fulfillOrder] whatsapp failed:", e.message),
        );
      }
    }
  }

  // ── 2. PRODIGI ─────────────────────────────────────────────────────────────
  if (groups.PRODIGI.length > 0) {
    try {
      const result = await createProdigiOrder(order, groups.PRODIGI, {});
      labOrderId = result.labOrderId;
      updates.push(
        prisma.shopOrder
          .update({
            where: { id: shopOrderId },
            data: {
              labOrderId: result.labOrderId,
              labName: result.mock ? "MOCK" : "PRODIGI",
            },
          })
          .catch(() => null),
      );
      updates.push(
        prisma.shopOrderItem
          .updateMany({
            where: { id: { in: groups.PRODIGI.map((i: any) => i.id) } },
            data: { status: "IN_PRODUCTION", labItemId: result.labOrderId },
          })
          .catch(() => null),
      );
    } catch (err: any) {
      console.error("[fulfillOrder] Prodigi submission failed:", err.message);
      // Leave items as PENDING — don't block rest of order
    }
  }

  // ── 3. PRINTFUL ────────────────────────────────────────────────────────────
  if (groups.PRINTFUL.length > 0) {
    try {
      const result = await createPrintfulOrder(order, groups.PRINTFUL, {});
      printfulOrderId = result.labOrderId;
      // Store alongside any Prodigi job (append to labName if both present)
      updates.push(
        prisma.shopOrder
          .update({
            where: { id: shopOrderId },
            data: {
              labOrderId: labOrderId ?? result.labOrderId,
              labName: labOrderId
                ? `PRODIGI+PRINTFUL`
                : result.mock
                ? "MOCK"
                : "PRINTFUL",
            },
          })
          .catch(() => null),
      );
      updates.push(
        prisma.shopOrderItem
          .updateMany({
            where: { id: { in: groups.PRINTFUL.map((i: any) => i.id) } },
            data: { status: "IN_PRODUCTION", labItemId: result.labOrderId },
          })
          .catch(() => null),
      );
    } catch (err: any) {
      console.error("[fulfillOrder] Printful submission failed:", err.message);
    }
  }

  // ── 4. LOCAL ───────────────────────────────────────────────────────────────
  if (groups.LOCAL.length > 0) {
    try {
      const result = await createLocalPrintJob(order, groups.LOCAL, {});
      localJobIds = result.printJobIds;
      updates.push(
        prisma.shopOrderItem
          .updateMany({
            where: { id: { in: groups.LOCAL.map((i: any) => i.id) } },
            data: { status: "IN_PRODUCTION" },
          })
          .catch(() => null),
      );
    } catch (err: any) {
      console.error("[fulfillOrder] Local job creation failed:", err.message);
    }
  }

  // ── 5. MANUAL ──────────────────────────────────────────────────────────────
  if (groups.MANUAL.length > 0) {
    updates.push(
      prisma.shopOrderItem
        .updateMany({
          where: { id: { in: groups.MANUAL.map((i: any) => i.id) } },
          data: { status: "PENDING_MANUAL" },
        })
        .catch(() => null),
    );
  }

  // ── Commission ─────────────────────────────────────────────────────────────
  const commissionBreakdown = calculateCommission(
    order.items.map((i: any) => ({
      unitPrice: i.unitPrice,
      quantity: i.quantity,
      fulfillmentType: i.product.fulfillmentType,
      costPrice: i.product.costPrice,
      isAutomated: false,
    })),
  );

  // ── Persist commission + mark order PROCESSING ────────────────────────────
  updates.push(
    prisma.shopOrder
      .update({
        where: { id: shopOrderId },
        data: {
          status: "PROCESSING",
          fotiqoCommission: commissionBreakdown.fotiqoCommission,
        },
      })
      .catch(() => null),
  );

  await Promise.all(updates);

  const hasPhysical =
    groups.PRODIGI.length + groups.PRINTFUL.length + groups.LOCAL.length;
  const totalFulfilled =
    groups.DIGITAL.length +
    hasPhysical +
    groups.MANUAL.length;

  return {
    orderId: shopOrderId,
    status: totalFulfilled > 0 ? "PROCESSING" : "PARTIAL",
    digital: groups.DIGITAL.length,
    prodigi: groups.PRODIGI.length,
    printful: groups.PRINTFUL.length,
    local: groups.LOCAL.length,
    manual: groups.MANUAL.length,
    // Legacy alias
    physical: groups.PRODIGI.length,
    labOrderId,
    printfulOrderId,
    localJobIds,
    commission: commissionBreakdown.fotiqoCommission,
  };
}
