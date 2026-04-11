/**
 * Mpix / Miller's Professional Imaging print-lab API client.
 *
 * Mpix API: https://api.mpix.com/v2
 *
 * NOTE: Mpix and Miller's Professional Imaging are the same company.
 * Miller's is the professional/studio brand; Mpix is the consumer-facing brand.
 * Both use the same fulfillment infrastructure and API platform.
 *
 * - If MPIX_API_KEY is set → real API (sandbox or live based on MPIX_ENVIRONMENT).
 * - If no key → mock mode (logs, returns fake IDs, safe for dev/staging).
 *
 * Products: prints, canvas, metal prints, mounted prints.
 */

const API_KEY = process.env.MPIX_API_KEY || "";
const PARTNER_ID = process.env.MPIX_PARTNER_ID || "";
const ENV = process.env.MPIX_ENVIRONMENT || "sandbox";
const BASE_URL =
  ENV === "live"
    ? "https://api.mpix.com/v2"
    : "https://api.sandbox.mpix.com/v2";
const IS_MOCK = !API_KEY;

// ── Types ─────────────────────────────────────────────────────────────────────

export type MpixOrderItem = {
  productSku: string;          // Mpix product SKU
  quantity: number;
  imageUrl: string;            // Public URL to the photo file
  options?: Record<string, string>; // e.g. { "Paper": "Lustre", "Size": "8x10" }
};

export type MpixRecipient = {
  firstName: string;
  lastName: string;
  address1: string;
  address2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;             // ISO 3166 two-letter code
  email?: string;
  phone?: string;
};

export type LabSubmissionResult = {
  labOrderId: string;
  confirmationId: string;
  status: string;
  estimatedDelivery: string | null;
  mock: boolean;
  raw?: unknown;
};

export type LabStatusResult = {
  status: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "ERROR" | "CANCELLED";
  trackingNumber: string | null;
  trackingUrl: string | null;
  raw?: unknown;
};

// ── Helpers ───────────────────────────────────────────────────────────────────

async function mpixFetch(path: string, opts: RequestInit = {}): Promise<Response> {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
      "X-Partner-Id": PARTNER_ID,
      ...(opts.headers || {}),
    },
  });

  // Retry once on rate limit
  if (res.status === 429) {
    await new Promise((r) => setTimeout(r, 2000));
    return fetch(url, {
      ...opts,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
        "X-Partner-Id": PARTNER_ID,
        ...(opts.headers || {}),
      },
    });
  }

  return res;
}

// ── Submit Order ─────────────────────────────────────────────────────────────

/**
 * Submit an order to Mpix / Miller's for fulfillment.
 *
 * @param items - Array of products to order
 * @param recipient - Shipping address and contact info
 * @param reference - Optional external reference ID (e.g. Fotiqo order ID)
 * @returns Lab submission result with order ID and status
 */
export async function submitOrder(
  items: MpixOrderItem[],
  recipient: MpixRecipient,
  reference?: string
): Promise<LabSubmissionResult> {
  if (IS_MOCK) {
    const mockId = `mpix_mock_${Date.now()}`;
    console.log(`[Mpix mock] Submit order: ${items.length} items → ${recipient.firstName} ${recipient.lastName}`);
    console.log(`[Mpix mock] Items:`, JSON.stringify(items, null, 2));
    return {
      labOrderId: mockId,
      confirmationId: `confirm_${mockId}`,
      status: "IN_PRODUCTION",
      estimatedDelivery: null,
      mock: true,
    };
  }

  const body = {
    externalReference: reference || `fotiqo_${Date.now()}`,
    items: items.map((item) => ({
      sku: item.productSku,
      quantity: item.quantity,
      images: [{ url: item.imageUrl }],
      options: item.options || {},
    })),
    shipping: {
      firstName: recipient.firstName,
      lastName: recipient.lastName,
      address1: recipient.address1,
      address2: recipient.address2 || "",
      city: recipient.city,
      state: recipient.state || "",
      postalCode: recipient.postalCode,
      country: recipient.country,
      email: recipient.email || "",
      phone: recipient.phone || "",
    },
  };

  const res = await mpixFetch("/orders", {
    method: "POST",
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Mpix submit failed (${res.status}): ${err}`);
  }

  const data = await res.json();

  return {
    labOrderId: data.orderId || data.id || `mpix_${Date.now()}`,
    confirmationId: data.confirmationId || data.orderId || "",
    status: data.status || "IN_PRODUCTION",
    estimatedDelivery: data.estimatedShipDate || data.estimatedDelivery || null,
    mock: false,
    raw: data,
  };
}

// ── Poll Status ──────────────────────────────────────────────────────────────

/**
 * Poll the current status of an Mpix order.
 *
 * @param labOrderId - The order ID returned from submitOrder
 * @returns Current order status with optional tracking info
 */
export async function pollOrderStatus(labOrderId: string): Promise<LabStatusResult> {
  if (IS_MOCK) {
    console.log(`[Mpix mock] Poll status: ${labOrderId}`);
    return { status: "PROCESSING", trackingNumber: null, trackingUrl: null };
  }

  const res = await mpixFetch(`/orders/${labOrderId}`);

  if (!res.ok) {
    return { status: "ERROR", trackingNumber: null, trackingUrl: null };
  }

  const data = await res.json();
  const rawStatus = (data.status || "").toLowerCase();

  let status: LabStatusResult["status"];
  if (rawStatus.includes("ship")) {
    status = "SHIPPED";
  } else if (rawStatus.includes("deliver") || rawStatus.includes("complete")) {
    status = "DELIVERED";
  } else if (rawStatus.includes("cancel")) {
    status = "CANCELLED";
  } else if (rawStatus.includes("error") || rawStatus.includes("fail")) {
    status = "ERROR";
  } else if (rawStatus.includes("production") || rawStatus.includes("process")) {
    status = "PROCESSING";
  } else {
    status = "PENDING";
  }

  return {
    status,
    trackingNumber: data.trackingNumber || data.tracking?.number || null,
    trackingUrl: data.trackingUrl || data.tracking?.url || null,
    raw: data,
  };
}

// ── Cancel Order ─────────────────────────────────────────────────────────────

/**
 * Cancel an Mpix order. Only works if the order has not entered production.
 *
 * @param labOrderId - The order ID to cancel
 * @returns true if cancellation succeeded
 */
export async function cancelOrder(labOrderId: string): Promise<boolean> {
  if (IS_MOCK) {
    console.log(`[Mpix mock] Cancel order: ${labOrderId}`);
    return true;
  }

  const res = await mpixFetch(`/orders/${labOrderId}/cancel`, {
    method: "POST",
  });

  return res.ok;
}

// ── Get Shipping Quote ───────────────────────────────────────────────────────

/**
 * Get available shipping methods and costs for an order.
 *
 * @param items - Items to quote shipping for
 * @param country - Destination country (ISO 3166 two-letter code)
 * @returns Array of shipping options with method name and cost
 */
export async function getShippingQuote(
  items: MpixOrderItem[],
  country: string
): Promise<{ method: string; cost: number }[]> {
  if (IS_MOCK) {
    return [
      { method: "Standard", cost: 6.99 },
      { method: "Express", cost: 15.99 },
      { method: "Overnight", cost: 32.99 },
    ];
  }

  const res = await mpixFetch("/shipping/quote", {
    method: "POST",
    body: JSON.stringify({
      items: items.map((item) => ({ sku: item.productSku, quantity: item.quantity })),
      destination: { country },
    }),
  });

  if (!res.ok) {
    return [{ method: "Standard", cost: 9.99 }];
  }

  const data = await res.json();
  return (data.options || []).map((o: any) => ({
    method: o.method || o.name || "Standard",
    cost: o.price || o.cost || 9.99,
  }));
}
