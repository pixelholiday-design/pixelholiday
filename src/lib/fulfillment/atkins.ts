/**
 * Atkins Pro print-lab API client (Australia/New Zealand).
 *
 * Atkins Pro API: https://api.atkins.com.au/v1
 *
 * NOTE: Atkins is the oldest photo lab in Australia, established in 1896.
 * Primary lab for AU/NZ orders. They serve professional photographers
 * with prints, canvas, albums, and cards.
 *
 * - If ATKINS_API_KEY is set → real API (sandbox or live based on ATKINS_ENVIRONMENT).
 * - If no key → mock mode (logs, returns fake IDs, safe for dev/staging).
 *
 * Products: prints, canvas, albums, cards.
 */

const API_KEY = process.env.ATKINS_API_KEY || "";
const ACCOUNT_ID = process.env.ATKINS_ACCOUNT_ID || "";
const ENV = process.env.ATKINS_ENVIRONMENT || "sandbox";
const BASE_URL =
  ENV === "live"
    ? "https://api.atkins.com.au/v1"
    : "https://api.sandbox.atkins.com.au/v1";
const IS_MOCK = !API_KEY;

// ── Types ─────────────────────────────────────────────────────────────────────

export type AtkinsOrderItem = {
  productCode: string;         // Atkins product code
  quantity: number;
  imageUrl: string;            // Public URL to the photo file
  options?: Record<string, string>; // e.g. { "Paper": "Metallic", "Size": "8x12" }
};

export type AtkinsRecipient = {
  firstName: string;
  lastName: string;
  address1: string;
  address2?: string;
  city: string;
  state?: string;              // AU state (e.g. "SA", "NSW", "VIC")
  postalCode: string;
  country: string;             // ISO 3166 two-letter code (AU, NZ)
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

async function atkinsFetch(path: string, opts: RequestInit = {}): Promise<Response> {
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
 * Submit an order to Atkins Pro for fulfillment.
 *
 * @param items - Array of products to order
 * @param recipient - Shipping address and contact info
 * @param reference - Optional external reference ID (e.g. Fotiqo order ID)
 * @returns Lab submission result with order ID and status
 */
export async function submitOrder(
  items: AtkinsOrderItem[],
  recipient: AtkinsRecipient,
  reference?: string
): Promise<LabSubmissionResult> {
  if (IS_MOCK) {
    const mockId = `atkins_mock_${Date.now()}`;
    console.log(`[Atkins mock] Submit order: ${items.length} items → ${recipient.firstName} ${recipient.lastName}`);
    console.log(`[Atkins mock] Items:`, JSON.stringify(items, null, 2));
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
      state: recipient.state || "",
      postalCode: recipient.postalCode,
      country: recipient.country,
      email: recipient.email || "",
      phone: recipient.phone || "",
    },
  };

  const res = await atkinsFetch("/orders", {
    method: "POST",
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Atkins submit failed (${res.status}): ${err}`);
  }

  const data = await res.json();

  return {
    labOrderId: data.orderId || data.id || `atkins_${Date.now()}`,
    confirmationId: data.confirmationId || data.orderId || "",
    status: data.status || "IN_PRODUCTION",
    estimatedDelivery: data.estimatedDispatchDate || data.estimatedDelivery || null,
    mock: false,
    raw: data,
  };
}

// ── Poll Status ──────────────────────────────────────────────────────────────

/**
 * Poll the current status of an Atkins Pro order.
 *
 * @param labOrderId - The order ID returned from submitOrder
 * @returns Current order status with optional tracking info
 */
export async function pollOrderStatus(labOrderId: string): Promise<LabStatusResult> {
  if (IS_MOCK) {
    console.log(`[Atkins mock] Poll status: ${labOrderId}`);
    return { status: "PROCESSING", trackingNumber: null, trackingUrl: null };
  }

  const res = await atkinsFetch(`/orders/${labOrderId}`);

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
 * Cancel an Atkins Pro order. Only works if the order has not entered production.
 *
 * @param labOrderId - The order ID to cancel
 * @returns true if cancellation succeeded
 */
export async function cancelOrder(labOrderId: string): Promise<boolean> {
  if (IS_MOCK) {
    console.log(`[Atkins mock] Cancel order: ${labOrderId}`);
    return true;
  }

  const res = await atkinsFetch(`/orders/${labOrderId}/cancel`, {
    method: "POST",
  });

  return res.ok;
}

// ── Get Shipping Quote ───────────────────────────────────────────────────────

/**
 * Get available shipping methods and costs for an order.
 * Atkins ships primarily within Australia and New Zealand.
 *
 * @param items - Items to quote shipping for
 * @param country - Destination country (ISO 3166 two-letter code)
 * @returns Array of shipping options with method name and cost (AUD)
 */
export async function getShippingQuote(
  items: AtkinsOrderItem[],
  country: string
): Promise<{ method: string; cost: number }[]> {
  if (IS_MOCK) {
    return [
      { method: "Australia Post Standard", cost: 8.95 },
      { method: "Australia Post Express", cost: 14.95 },
      { method: "StarTrack Premium", cost: 22.95 },
    ];
  }

  const res = await atkinsFetch("/shipping/quote", {
    method: "POST",
    body: JSON.stringify({
      items: items.map((item) => ({ productCode: item.productCode, quantity: item.quantity })),
      destination: { country },
    }),
  });

  if (!res.ok) {
    return [{ method: "Standard", cost: 12.95 }];
  }

  const data = await res.json();
  return (data.options || []).map((o: any) => ({
    method: o.method || o.name || "Standard",
    cost: o.price || o.cost || 12.95,
  }));
}
