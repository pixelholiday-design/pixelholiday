/**
 * Prodigi print-lab API client.
 *
 * - If PRODIGI_API_KEY is set and PRODIGI_ENVIRONMENT=live → real live API.
 * - If PRODIGI_API_KEY is set without env → sandbox.
 * - If no key → mock mode (logs, returns fake IDs, safe for dev/staging).
 *
 * Rate-limit: retries once on HTTP 429 after 2 s.
 */

import prodigiSkus from "@/config/prodigi-skus.json";

const API_KEY = process.env.PRODIGI_API_KEY || "";
const ENV = process.env.PRODIGI_ENVIRONMENT || "sandbox";
const BASE_URL =
  ENV === "live"
    ? "https://api.prodigi.com/v4.0"
    : "https://api.sandbox.prodigi.com/v4.0";
const IS_MOCK = !API_KEY;

// ── Types ─────────────────────────────────────────────────────────────────────

export type ProdigiOrderItem = {
  sku: string;
  copies: number;
  assets: { url: string; printArea?: string }[];
  sizing?: string;
  attributes?: Record<string, string>;
};

export type ProdigiRecipient = {
  name: string;
  address: {
    line1: string;
    line2?: string;
    postalOrZipCode: string;
    countryCode: string;
    townOrCity: string;
    stateOrCounty?: string;
  };
  email?: string;
  phoneNumber?: string;
};

export type LabSubmissionResult = {
  labOrderId: string;
  status: string;
  estimatedDelivery: string | null;
  mock: boolean;
  raw?: unknown;
};

export type ShopOrderForLab = {
  id: string;
  shippingName: string | null;
  shippingAddress: string | null;
  shippingCity: string | null;
  shippingCountry: string | null;
  shippingPostal: string | null;
  shippingPhone: string | null;
  shippingMethod: string | null;
};

export type ShopOrderItemForLab = {
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

/**
 * Resolve a Prodigi SKU from the product. Prefers the stored labProductId,
 * then falls back to a key lookup in prodigi-skus.json.
 */
function resolveSku(item: ShopOrderItemForLab): string | null {
  if (item.product.labProductId) return item.product.labProductId;
  const key = item.product.productKey as keyof typeof prodigiSkus | undefined;
  if (key && key in prodigiSkus) return prodigiSkus[key];
  return null;
}

function buildPhotoUrl(photoId: string): string {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "";
  return `${base}/api/photos/${photoId}/download`;
}

function placeholderUrl(): string {
  return `${process.env.R2_PUBLIC_URL ?? ""}/placeholder.jpg`;
}

/** Fetch wrapper with one retry on 429. */
async function prodigiFetch(
  path: string,
  init: RequestInit,
  attempt = 1,
): Promise<Response> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": API_KEY,
      ...(init.headers as Record<string, string>),
    },
  });

  if (res.status === 429 && attempt === 1) {
    await new Promise((r) => setTimeout(r, 2000));
    return prodigiFetch(path, init, 2);
  }

  return res;
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Submit an order to Prodigi.
 * photoUrls: map of shopOrderItemId → already-resolved URL (optional override).
 */
export async function createProdigiOrder(
  order: ShopOrderForLab,
  items: ShopOrderItemForLab[],
  photoUrls: Record<string, string> = {},
): Promise<LabSubmissionResult> {
  const recipient: ProdigiRecipient = {
    name: order.shippingName || "Customer",
    address: {
      line1: order.shippingAddress || "Address unknown",
      postalOrZipCode: order.shippingPostal || "00000",
      countryCode: order.shippingCountry || "FR",
      townOrCity: order.shippingCity || "Unknown",
    },
    phoneNumber: order.shippingPhone || undefined,
  };

  const orderItems: ProdigiOrderItem[] = items
    .map((item) => {
      const sku = resolveSku(item);
      if (!sku) return null;
      const imageUrl =
        photoUrls[item.id] ||
        (item.photoId ? buildPhotoUrl(item.photoId) : placeholderUrl());
      return {
        sku,
        copies: item.quantity,
        sizing: "fillPrintArea",
        assets: [{ url: imageUrl, printArea: "default" }],
        ...(item.option ? { attributes: { finish: item.option } } : {}),
      } as ProdigiOrderItem;
    })
    .filter((i): i is ProdigiOrderItem => i !== null);

  if (orderItems.length === 0) {
    return {
      labOrderId: `MOCK-NOSKU-${order.id.slice(-6)}`,
      status: "SKIPPED",
      estimatedDelivery: null,
      mock: true,
    };
  }

  const payload = {
    merchantReference: order.id,
    shippingMethod: order.shippingMethod === "EXPRESS" ? "Express" : "Standard",
    recipient,
    items: orderItems,
  };

  // ── Mock mode ──────────────────────────────────────────────────────────────
  if (IS_MOCK) {
    const mockId = `MOCK-PRODIGI-${Date.now()}-${order.id.slice(-6)}`;
    console.log("[Prodigi MOCK] Would submit:", JSON.stringify(payload, null, 2));
    return {
      labOrderId: mockId,
      status: "SUBMITTED",
      estimatedDelivery: new Date(Date.now() + 5 * 86400_000)
        .toISOString()
        .split("T")[0],
      mock: true,
    };
  }

  // ── Real API call ──────────────────────────────────────────────────────────
  try {
    const res = await prodigiFetch("/Orders", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      console.error("[Prodigi] API error", res.status, json);
      throw new Error((json as any)?.message || `Prodigi HTTP ${res.status}`);
    }
    const labOrderId =
      (json as any)?.order?.id || (json as any)?.id || `PRODIGI-${Date.now()}`;
    const estimatedDelivery =
      (json as any)?.order?.status?.details?.estimatedDeliveryDate ?? null;
    return {
      labOrderId,
      status: "SUBMITTED",
      estimatedDelivery,
      mock: false,
      raw: json,
    };
  } catch (err: any) {
    console.error("[Prodigi] Submission failed:", err.message);
    throw err;
  }
}

/** Get order status from Prodigi. */
export async function getProdigiOrderStatus(labOrderId: string): Promise<{
  stage: string;
  tracking?: string;
  shipments?: unknown[];
  raw?: unknown;
}> {
  if (IS_MOCK) {
    console.log(`[Prodigi MOCK] getStatus(${labOrderId})`);
    return { stage: "InProgress", tracking: undefined, shipments: [] };
  }

  try {
    const res = await prodigiFetch(`/Orders/${labOrderId}`, { method: "GET" });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      console.error("[Prodigi] getStatus error", res.status, json);
      throw new Error((json as any)?.message || `Prodigi HTTP ${res.status}`);
    }
    const stage =
      (json as any)?.order?.status?.stage || (json as any)?.status || "Unknown";
    const shipments = (json as any)?.order?.shipments ?? [];
    const tracking =
      shipments?.[0]?.tracking?.number ?? undefined;
    return { stage, tracking, shipments, raw: json };
  } catch (err: any) {
    console.error("[Prodigi] getStatus failed:", err.message);
    throw err;
  }
}

/** Cancel a Prodigi order. */
export async function cancelProdigiOrder(labOrderId: string): Promise<{ success: boolean; raw?: unknown }> {
  if (IS_MOCK) {
    console.log(`[Prodigi MOCK] cancelOrder(${labOrderId})`);
    return { success: true };
  }

  try {
    const res = await prodigiFetch(`/Orders/${labOrderId}/Actions/cancel`, {
      method: "POST",
      body: JSON.stringify({}),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      console.error("[Prodigi] cancelOrder error", res.status, json);
      return { success: false, raw: json };
    }
    return { success: true, raw: json };
  } catch (err: any) {
    console.error("[Prodigi] cancelOrder failed:", err.message);
    return { success: false };
  }
}

/** Get a shipping cost quote from Prodigi. */
export async function getProdigiQuote(
  items: Array<{ sku: string; copies: number }>,
  shippingCountry: string,
): Promise<{ shippingCost: number; currency: string; raw?: unknown }> {
  if (IS_MOCK) {
    console.log(`[Prodigi MOCK] getQuote(country=${shippingCountry})`);
    return { shippingCost: 5.99, currency: "EUR" };
  }

  const payload = {
    shippingMethod: "Standard",
    destinationCountryCode: shippingCountry,
    currencyCode: "EUR",
    items: items.map((i) => ({ sku: i.sku, copies: i.copies, assets: [] })),
  };

  try {
    const res = await prodigiFetch("/Quotes", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      console.error("[Prodigi] getQuote error", res.status, json);
      throw new Error((json as any)?.message || `Prodigi HTTP ${res.status}`);
    }
    const shipping =
      (json as any)?.quotes?.[0]?.shipments?.[0]?.cost?.amount ?? 0;
    const currency =
      (json as any)?.quotes?.[0]?.shipments?.[0]?.cost?.currency ?? "EUR";
    return { shippingCost: Number(shipping), currency, raw: json };
  } catch (err: any) {
    console.error("[Prodigi] getQuote failed:", err.message);
    throw err;
  }
}

// Legacy export kept for backward compatibility with existing callers
export const submitToLab = createProdigiOrder;
