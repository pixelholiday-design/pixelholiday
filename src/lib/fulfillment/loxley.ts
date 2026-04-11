/**
 * Loxley Colour print-lab API client (UK/Europe).
 *
 * Loxley Colour API: https://api.loxleycolour.com/v1
 *
 * NOTE: Loxley Colour is the primary lab for EU/UK orders.
 * Based in the UK, they serve photographers across Europe with
 * prints, canvas, framed prints, albums, and cards.
 *
 * - If LOXLEY_API_KEY is set → real API (sandbox or live based on LOXLEY_ENVIRONMENT).
 * - If no key → mock mode (logs, returns fake IDs, safe for dev/staging).
 *
 * Products: prints, canvas, framed prints, albums, cards.
 */

const API_KEY = process.env.LOXLEY_API_KEY || "";
const ACCOUNT_ID = process.env.LOXLEY_ACCOUNT_ID || "";
const ENV = process.env.LOXLEY_ENVIRONMENT || "sandbox";
const BASE_URL =
  ENV === "live"
    ? "https://api.loxleycolour.com/v1"
    : "https://api.sandbox.loxleycolour.com/v1";
const IS_MOCK = !API_KEY;

// ── Types ─────────────────────────────────────────────────────────────────────

export type LoxleyOrderItem = {
  productCode: string;         // Loxley product code
  quantity: number;
  imageUrl: string;            // Public URL to the photo file
  options?: Record<string, string>; // e.g. { "Paper": "Lustre", "Size": "10x8" }
};

export type LoxleyRecipient = {
  firstName: string;
  lastName: string;
  address1: string;
  address2?: string;
  city: string;
  county?: string;             // UK county / EU region
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

async function loxleyFetch(path: string, opts: RequestInit = {}): Promise<Response> {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
      "X-Account-Id": ACCOUNT_ID,
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
        "X-Account-Id": ACCOUNT_ID,
        ...(opts.headers || {}),
      },
    });
  }

  return res;
}

// ── Submit Order ─────────────────────────────────────────────────────────────

/**
 * Submit an order to Loxley Colour for fulfillment.
 *
 * @param items - Array of products to order
 * @param recipient - Shipping address and contact info
 * @param reference - Optional external reference ID (e.g. Fotiqo order ID)
 * @returns Lab submission result with order ID and status
 */
export async function submitOrder(
  items: LoxleyOrderItem[],
  recipient: LoxleyRecipient,
  reference?: string
): Promise<LabSubmissionResult> {
  if (IS_MOCK) {
    const mockId = `loxley_mock_${Date.now()}`;
    console.log(`[Loxley mock] Submit order: ${items.length} items → ${recipient.firstName} ${recipient.lastName}`);
    console.log(`[Loxley mock] Items:`, JSON.stringify(items, null, 2));
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
      productCode: item.productCode,
      quantity: item.quantity,
      images: [{ url: item.imageUrl }],
      options: item.options || {},
    })),
    deliveryAddress: {
      firstName: recipient.firstName,
      lastName: recipient.lastName,
      address1: recipient.address1,
      address2: recipient.address2 || "",
      city: recipient.city,
      county: recipient.county || "",
      postalCode: recipient.postalCode,
      country: recipient.country,
      email: recipient.email || "",
      phone: recipient.phone || "",
    },
  };

  const res = await loxleyFetch("/orders", {
    method: "POST",
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Loxley submit failed (${res.status}): ${err}`);
  }

  const data = await res.json();

  return {
    labOrderId: data.orderId || data.id || `loxley_${Date.now()}`,
    confirmationId: data.confirmationId || data.orderId || "",
    status: data.status || "IN_PRODUCTION",
    estimatedDelivery: data.estimatedDispatchDate || data.estimatedDelivery || null,
    mock: false,
    raw: data,
  };
}

// ── Poll Status ──────────────────────────────────────────────────────────────

/**
 * Poll the current status of a Loxley Colour order.
 *
 * @param labOrderId - The order ID returned from submitOrder
 * @returns Current order status with optional tracking info
 */
export async function pollOrderStatus(labOrderId: string): Promise<LabStatusResult> {
  if (IS_MOCK) {
    console.log(`[Loxley mock] Poll status: ${labOrderId}`);
    return { status: "PROCESSING", trackingNumber: null, trackingUrl: null };
  }

  const res = await loxleyFetch(`/orders/${labOrderId}`);

  if (!res.ok) {
    return { status: "ERROR", trackingNumber: null, trackingUrl: null };
  }

  const data = await res.json();
  const rawStatus = (data.status || "").toLowerCase();

  let status: LabStatusResult["status"];
  if (rawStatus.includes("dispatch") || rawStatus.includes("ship")) {
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
 * Cancel a Loxley Colour order. Only works if the order has not entered production.
 *
 * @param labOrderId - The order ID to cancel
 * @returns true if cancellation succeeded
 */
export async function cancelOrder(labOrderId: string): Promise<boolean> {
  if (IS_MOCK) {
    console.log(`[Loxley mock] Cancel order: ${labOrderId}`);
    return true;
  }

  const res = await loxleyFetch(`/orders/${labOrderId}/cancel`, {
    method: "POST",
  });

  return res.ok;
}

// ── Get Shipping Quote ───────────────────────────────────────────────────────

/**
 * Get available shipping methods and costs for an order.
 * Loxley ships primarily within the UK and Europe.
 *
 * @param items - Items to quote shipping for
 * @param country - Destination country (ISO 3166 two-letter code)
 * @returns Array of shipping options with method name and cost (GBP)
 */
export async function getShippingQuote(
  items: LoxleyOrderItem[],
  country: string
): Promise<{ method: string; cost: number }[]> {
  if (IS_MOCK) {
    return [
      { method: "Royal Mail Standard", cost: 4.99 },
      { method: "Royal Mail Tracked", cost: 8.99 },
      { method: "DPD Next Day", cost: 12.99 },
    ];
  }

  const res = await loxleyFetch("/shipping/quote", {
    method: "POST",
    body: JSON.stringify({
      items: items.map((item) => ({ productCode: item.productCode, quantity: item.quantity })),
      destination: { country },
    }),
  });

  if (!res.ok) {
    return [{ method: "Standard", cost: 7.99 }];
  }

  const data = await res.json();
  return (data.options || []).map((o: any) => ({
    method: o.method || o.name || "Standard",
    cost: o.price || o.cost || 7.99,
  }));
}
