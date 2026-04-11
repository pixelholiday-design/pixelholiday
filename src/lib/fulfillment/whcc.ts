/**
 * WHCC (White House Custom Colour) print-lab API client.
 *
 * WHCC Developer API: https://developer.whcc.com/docs/
 *
 * - If WHCC_API_KEY is set → real API (sandbox or live based on WHCC_ENVIRONMENT).
 * - If no key → mock mode (logs, returns fake IDs, safe for dev/staging).
 *
 * WHCC uses a 3-step order flow:
 *   1. Import order JSON → get ConfirmationID
 *   2. Confirm order with ConfirmationID → order enters production
 *   3. Receive webhooks for status updates (shipped, delivered)
 */

const API_KEY = process.env.WHCC_API_KEY || "";
const ACCOUNT_ID = process.env.WHCC_ACCOUNT_ID || "";
const ENV = process.env.WHCC_ENVIRONMENT || "sandbox";
const BASE_URL =
  ENV === "live"
    ? "https://api.whcc.com/v1"
    : "https://api.sandbox.whcc.com/v1";
const IS_MOCK = !API_KEY;

// ── Types ─────────────────────────────────────────────────────────────────────

export type WhccOrderItem = {
  catalogId: string;         // WHCC product catalog ID
  quantity: number;
  imageUrl: string;          // Public URL to the photo file
  options?: Record<string, string>; // e.g. { "Paper": "Lustre", "Size": "8x10" }
};

export type WhccRecipient = {
  firstName: string;
  lastName: string;
  address1: string;
  address2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;           // ISO 3166 two-letter code
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

async function whccFetch(path: string, opts: RequestInit = {}): Promise<Response> {
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

// ── Import Order (Step 1) ─────────────────────────────────────────────────────

export async function importOrder(
  items: WhccOrderItem[],
  recipient: WhccRecipient,
  reference?: string
): Promise<LabSubmissionResult> {
  if (IS_MOCK) {
    const mockId = `whcc_mock_${Date.now()}`;
    console.log(`[WHCC mock] Import order: ${items.length} items → ${recipient.firstName} ${recipient.lastName}`);
    console.log(`[WHCC mock] Items:`, JSON.stringify(items, null, 2));
    return {
      labOrderId: mockId,
      confirmationId: `confirm_${mockId}`,
      status: "IMPORTED",
      estimatedDelivery: null,
      mock: true,
    };
  }

  const body = {
    orderReference: reference || `fotiqo_${Date.now()}`,
    items: items.map((item) => ({
      catalogId: item.catalogId,
      quantity: item.quantity,
      images: [{ url: item.imageUrl }],
      options: item.options || {},
    })),
    shipTo: {
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

  const res = await whccFetch("/orders/import", {
    method: "POST",
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`WHCC import failed (${res.status}): ${err}`);
  }

  const data = await res.json();

  return {
    labOrderId: data.orderId || data.id || `whcc_${Date.now()}`,
    confirmationId: data.confirmationId || "",
    status: "IMPORTED",
    estimatedDelivery: data.estimatedShipDate || null,
    mock: false,
    raw: data,
  };
}

// ── Confirm Order (Step 2) ────────────────────────────────────────────────────

export async function confirmOrder(confirmationId: string): Promise<{ orderId: string; status: string }> {
  if (IS_MOCK) {
    console.log(`[WHCC mock] Confirm order: ${confirmationId}`);
    return { orderId: confirmationId.replace("confirm_", ""), status: "IN_PRODUCTION" };
  }

  const res = await whccFetch("/orders/confirm", {
    method: "POST",
    body: JSON.stringify({ confirmationId }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`WHCC confirm failed (${res.status}): ${err}`);
  }

  const data = await res.json();
  return { orderId: data.orderId || confirmationId, status: data.status || "IN_PRODUCTION" };
}

// ── Submit (convenience: import + confirm in one call) ────────────────────────

export async function submitOrder(
  items: WhccOrderItem[],
  recipient: WhccRecipient,
  reference?: string
): Promise<LabSubmissionResult> {
  const imported = await importOrder(items, recipient, reference);

  if (IS_MOCK) {
    return { ...imported, status: "IN_PRODUCTION" };
  }

  const confirmed = await confirmOrder(imported.confirmationId);

  return {
    ...imported,
    labOrderId: confirmed.orderId,
    status: confirmed.status,
  };
}

// ── Poll Status ───────────────────────────────────────────────────────────────

export async function pollOrderStatus(labOrderId: string): Promise<LabStatusResult> {
  if (IS_MOCK) {
    console.log(`[WHCC mock] Poll status: ${labOrderId}`);
    return { status: "PROCESSING", trackingNumber: null, trackingUrl: null };
  }

  const res = await whccFetch(`/orders/${labOrderId}`);

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

// ── Cancel Order ──────────────────────────────────────────────────────────────

export async function cancelOrder(labOrderId: string): Promise<boolean> {
  if (IS_MOCK) {
    console.log(`[WHCC mock] Cancel order: ${labOrderId}`);
    return true;
  }

  const res = await whccFetch(`/orders/${labOrderId}/cancel`, {
    method: "POST",
  });

  return res.ok;
}

// ── Get Shipping Quote ────────────────────────────────────────────────────────

export async function getShippingQuote(
  items: WhccOrderItem[],
  country: string
): Promise<{ method: string; cost: number }[]> {
  if (IS_MOCK) {
    return [
      { method: "Standard", cost: 5.99 },
      { method: "Express", cost: 14.99 },
      { method: "Overnight", cost: 29.99 },
    ];
  }

  const res = await whccFetch("/shipping/quote", {
    method: "POST",
    body: JSON.stringify({
      items: items.map((item) => ({ catalogId: item.catalogId, quantity: item.quantity })),
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
