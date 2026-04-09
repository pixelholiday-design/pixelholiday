/**
 * Printful API client.
 *
 * - Bearer token auth (PRINTFUL_API_KEY).
 * - No key → mock mode.
 */

import printfulSkus from "@/config/printful-skus.json";

const API_KEY = process.env.PRINTFUL_API_KEY || "";
const BASE_URL = "https://api.printful.com";
const IS_MOCK = !API_KEY;

// ── Types ─────────────────────────────────────────────────────────────────────

export type PrintfulOrderItem = {
  variant_id: number;
  quantity: number;
  files: Array<{ url: string; type?: string }>;
};

export type PrintfulRecipient = {
  name: string;
  address1: string;
  city: string;
  country_code: string;
  zip: string;
  phone?: string;
  email?: string;
};

export type PrintfulLabResult = {
  labOrderId: string;
  status: string;
  estimatedDelivery: string | null;
  mock: boolean;
  raw?: unknown;
};

export type ShopOrderForPrintful = {
  id: string;
  shippingName: string | null;
  shippingAddress: string | null;
  shippingCity: string | null;
  shippingCountry: string | null;
  shippingPostal: string | null;
  shippingPhone: string | null;
  shippingMethod: string | null;
};

export type ShopOrderItemForPrintful = {
  id: string;
  quantity: number;
  size: string | null;
  option: string | null;
  photoId: string | null;
  product: {
    labProductId: string | null;
    labName: string | null;
    name: string;
    productKey?: string;
  };
};

// ── Helpers ───────────────────────────────────────────────────────────────────

type PrintfulSkuKey = keyof typeof printfulSkus;

function resolveVariantId(item: ShopOrderItemForPrintful): number | null {
  // Prefer stored labProductId parsed as number
  if (item.product.labProductId) {
    const n = parseInt(item.product.labProductId, 10);
    if (!isNaN(n)) return n;
  }
  const key = item.product.productKey as PrintfulSkuKey | undefined;
  if (key && key in printfulSkus) {
    return (printfulSkus[key] as { variant_id: number }).variant_id;
  }
  return null;
}

function buildPhotoUrl(photoId: string): string {
  return `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/api/photos/${photoId}/download`;
}

async function printfulFetch(path: string, init: RequestInit): Promise<Response> {
  return fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
      ...(init.headers as Record<string, string>),
    },
  });
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Submit an order to Printful.
 * photoUrls: optional map of shopOrderItemId → resolved URL.
 */
export async function createPrintfulOrder(
  order: ShopOrderForPrintful,
  items: ShopOrderItemForPrintful[],
  photoUrls: Record<string, string> = {},
): Promise<PrintfulLabResult> {
  const recipient: PrintfulRecipient = {
    name: order.shippingName || "Customer",
    address1: order.shippingAddress || "Address unknown",
    city: order.shippingCity || "Unknown",
    country_code: order.shippingCountry || "FR",
    zip: order.shippingPostal || "00000",
    phone: order.shippingPhone || undefined,
  };

  const orderItems: PrintfulOrderItem[] = items
    .map((item) => {
      const variantId = resolveVariantId(item);
      if (!variantId) return null;
      const imageUrl =
        photoUrls[item.id] ||
        (item.photoId ? buildPhotoUrl(item.photoId) : "");
      if (!imageUrl) return null;
      return {
        variant_id: variantId,
        quantity: item.quantity,
        files: [{ url: imageUrl, type: "default" }],
      } as PrintfulOrderItem;
    })
    .filter((i): i is PrintfulOrderItem => i !== null);

  if (orderItems.length === 0) {
    return {
      labOrderId: `MOCK-PF-NOSKU-${order.id.slice(-6)}`,
      status: "SKIPPED",
      estimatedDelivery: null,
      mock: true,
    };
  }

  const payload = {
    external_id: order.id,
    shipping: order.shippingMethod === "EXPRESS" ? "PRINTFUL_FAST" : "STANDARD",
    recipient,
    items: orderItems,
  };

  // ── Mock mode ──────────────────────────────────────────────────────────────
  if (IS_MOCK) {
    const mockId = `MOCK-PRINTFUL-${Date.now()}-${order.id.slice(-6)}`;
    console.log("[Printful MOCK] Would submit:", JSON.stringify(payload, null, 2));
    return {
      labOrderId: mockId,
      status: "SUBMITTED",
      estimatedDelivery: new Date(Date.now() + 7 * 86400_000)
        .toISOString()
        .split("T")[0],
      mock: true,
    };
  }

  // ── Real API call ──────────────────────────────────────────────────────────
  try {
    const res = await printfulFetch("/orders", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    const json = await res.json().catch(() => ({})) as any;
    if (!res.ok) {
      console.error("[Printful] API error", res.status, json);
      throw new Error(json?.error?.message || json?.message || `Printful HTTP ${res.status}`);
    }
    const labOrderId =
      String(json?.result?.id ?? json?.id ?? `PRINTFUL-${Date.now()}`);
    const estimatedDelivery =
      json?.result?.ship_date ?? json?.ship_date ?? null;
    return {
      labOrderId,
      status: "SUBMITTED",
      estimatedDelivery,
      mock: false,
      raw: json,
    };
  } catch (err: any) {
    console.error("[Printful] Submission failed:", err.message);
    throw err;
  }
}

/** Get status of a Printful order. */
export async function getPrintfulOrderStatus(labOrderId: string): Promise<{
  status: string;
  trackingNumber?: string;
  trackingUrl?: string;
  raw?: unknown;
}> {
  if (IS_MOCK) {
    console.log(`[Printful MOCK] getStatus(${labOrderId})`);
    return { status: "pending" };
  }

  try {
    const res = await printfulFetch(`/orders/${labOrderId}`, { method: "GET" });
    const json = await res.json().catch(() => ({})) as any;
    if (!res.ok) {
      console.error("[Printful] getStatus error", res.status, json);
      throw new Error(json?.error?.message || `Printful HTTP ${res.status}`);
    }
    const result = json?.result ?? json;
    return {
      status: result?.status ?? "unknown",
      trackingNumber: result?.shipments?.[0]?.tracking_number ?? undefined,
      trackingUrl: result?.shipments?.[0]?.tracking_url ?? undefined,
      raw: json,
    };
  } catch (err: any) {
    console.error("[Printful] getStatus failed:", err.message);
    throw err;
  }
}

/** Cancel a Printful order. */
export async function cancelPrintfulOrder(labOrderId: string): Promise<{ success: boolean; raw?: unknown }> {
  if (IS_MOCK) {
    console.log(`[Printful MOCK] cancelOrder(${labOrderId})`);
    return { success: true };
  }

  try {
    const res = await printfulFetch(`/orders/${labOrderId}`, { method: "DELETE" });
    const json = await res.json().catch(() => ({})) as any;
    if (!res.ok) {
      console.error("[Printful] cancelOrder error", res.status, json);
      return { success: false, raw: json };
    }
    return { success: true, raw: json };
  } catch (err: any) {
    console.error("[Printful] cancelOrder failed:", err.message);
    return { success: false };
  }
}
