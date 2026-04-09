import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

// ── types ─────────────────────────────────────────────────────────────────────

type FulfillmentGroup = "DIGITAL" | "AUTO" | "MANUAL";

type ItemSummary = {
  itemId: string;
  productKey: string;
  productName: string;
  fulfillmentType: string;
  photoId: string | null;
  size: string | null;
  option: string | null;
  quantity: number;
  unitPrice: number;
  bookPhotoIds: string[] | null;
};

type FulfillResult = {
  group: FulfillmentGroup;
  itemCount: number;
  status: string;
  detail: string;
  downloadLinks?: Record<string, string>;
  prodigiPayload?: unknown;
};

// ── helpers ───────────────────────────────────────────────────────────────────

function parseBookPhotoIds(raw: string | null | undefined): string[] | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as string[];
  } catch {
    return null;
  }
}

/**
 * Build a mock download link for a digital item.
 * In production this would generate a signed Cloudflare R2 / Cloudinary URL.
 */
function buildDownloadLink(photoId: string | null, productKey: string, orderId: string): string {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "https://app.pixelholiday.com";
  const ref = photoId ? `photo_${photoId}` : `product_${productKey}`;
  return `${base}/download/${orderId}/${ref}`;
}

/**
 * Build a mock Prodigi API order payload.
 * Reference: https://www.prodigi.com/print-api/docs/reference/#orders-create-order
 */
function buildProdigiPayload(
  orderId: string,
  items: ItemSummary[],
  shippingName: string | null,
  shippingAddress: string | null,
  shippingCity: string | null,
  shippingCountry: string | null,
  shippingPostal: string | null,
  shippingPhone: string | null,
) {
  return {
    merchantReference: orderId,
    shippingMethod: "Standard",
    recipient: {
      name: shippingName ?? "PixelHoliday Guest",
      address: {
        line1: shippingAddress ?? "",
        townOrCity: shippingCity ?? "",
        countryCode: (shippingCountry ?? "TN").toUpperCase(),
        postalOrZipCode: shippingPostal ?? "",
        phoneNumber: shippingPhone ?? undefined,
      },
    },
    items: items.map((item) => ({
      merchantReference: item.itemId,
      sku: item.productKey.toUpperCase(),
      copies: item.quantity,
      sizing: "fillPrintArea",
      attributes: {
        ...(item.size ? { size: item.size } : {}),
        ...(item.option ? { finish: item.option } : {}),
      },
      assets: item.photoId
        ? [{ printArea: "default", url: `PHOTO_ASSET_URL_FOR_${item.photoId}` }]
        : [],
    })),
  };
}

// ── POST /api/shop/fulfill ────────────────────────────────────────────────────
//
// Called after a successful Stripe payment (or manually by admin).
// Accepts: { orderId: string }

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const orderId = body?.orderId as string | undefined;

    if (!orderId) {
      return NextResponse.json({ error: "orderId is required" }, { status: 400 });
    }

    const order = await prisma.shopOrder.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: {
              select: {
                productKey: true,
                name: true,
                fulfillmentType: true,
                labName: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Map items into a flat summary
    const itemSummaries: ItemSummary[] = order.items.map((item) => ({
      itemId: item.id,
      productKey: item.product.productKey,
      productName: item.product.name,
      fulfillmentType: item.product.fulfillmentType,
      photoId: item.photoId,
      size: item.size,
      option: item.option,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      bookPhotoIds: parseBookPhotoIds(item.bookPhotoIds),
    }));

    // Group items by fulfillment type
    const groups: Record<FulfillmentGroup, ItemSummary[]> = {
      DIGITAL: itemSummaries.filter((i) => i.fulfillmentType === "DIGITAL"),
      AUTO: itemSummaries.filter((i) => i.fulfillmentType === "AUTO"),
      MANUAL: itemSummaries.filter((i) => i.fulfillmentType === "MANUAL"),
    };

    const results: FulfillResult[] = [];

    // ── 1. DIGITAL: mark delivered immediately, generate download links ────────
    if (groups.DIGITAL.length > 0) {
      const downloadLinks: Record<string, string> = {};

      for (const item of groups.DIGITAL) {
        const link = buildDownloadLink(item.photoId, item.productKey, orderId);
        downloadLinks[item.itemId] = link;

        await prisma.shopOrderItem.update({
          where: { id: item.itemId },
          data: { status: "DELIVERED" },
        }).catch(() => null);
      }

      results.push({
        group: "DIGITAL",
        itemCount: groups.DIGITAL.length,
        status: "DELIVERED",
        detail: "Digital items marked as delivered. Download links generated.",
        downloadLinks,
      });
    }

    // ── 2. AUTO: build Prodigi API payload (mock — log and mark PROCESSING) ───
    if (groups.AUTO.length > 0) {
      const prodigiPayload = buildProdigiPayload(
        orderId,
        groups.AUTO,
        order.shippingName,
        order.shippingAddress,
        order.shippingCity,
        order.shippingCountry,
        order.shippingPostal,
        order.shippingPhone,
      );

      // Mock mode: log payload to console, do not call Prodigi
      console.log("[fulfill] Prodigi mock payload for order", orderId, JSON.stringify(prodigiPayload, null, 2));

      for (const item of groups.AUTO) {
        await prisma.shopOrderItem.update({
          where: { id: item.itemId },
          data: { status: "PROCESSING" },
        }).catch(() => null);
      }

      results.push({
        group: "AUTO",
        itemCount: groups.AUTO.length,
        status: "PROCESSING",
        detail: "AUTO fulfillment items submitted to Prodigi (mock mode — payload logged, lab API not called).",
        prodigiPayload,
      });
    }

    // ── 3. MANUAL: mark PENDING, send admin notification ──────────────────────
    if (groups.MANUAL.length > 0) {
      for (const item of groups.MANUAL) {
        await prisma.shopOrderItem.update({
          where: { id: item.itemId },
          data: { status: "PENDING" },
        }).catch(() => null);
      }

      // In production, send an email/WhatsApp alert to operations team here.
      console.log(
        `[fulfill] MANUAL fulfillment required for order ${orderId}: ${groups.MANUAL.map((i) => i.productName).join(", ")}`,
      );

      results.push({
        group: "MANUAL",
        itemCount: groups.MANUAL.length,
        status: "PENDING",
        detail: "MANUAL fulfillment items marked PENDING. Admin notification sent (mock).",
      });
    }

    // Update order status to PROCESSING if any physical items, otherwise PAID
    const hasPhysical = groups.AUTO.length > 0 || groups.MANUAL.length > 0;
    const newOrderStatus = hasPhysical ? "PROCESSING" : "PAID";

    await prisma.shopOrder.update({
      where: { id: orderId },
      data: { status: newOrderStatus },
    }).catch(() => null);

    return NextResponse.json({
      orderId,
      orderStatus: newOrderStatus,
      fulfillment: results,
      summary: {
        digital: groups.DIGITAL.length,
        auto: groups.AUTO.length,
        manual: groups.MANUAL.length,
        total: itemSummaries.length,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
