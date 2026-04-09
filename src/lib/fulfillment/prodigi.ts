/**
 * Prodigi print-lab API client.
 * If PRODIGI_API_KEY is set → real API call.
 * Otherwise → mock response (safe for dev / staging).
 */

export type ProdigiOrderItem = {
  sku: string;
  copies: number;
  assets: { url: string; printArea?: string }[];
  sizing?: string;
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
  };
};

const PRODIGI_API = "https://api.prodigi.com/v4.0/Orders";

export async function submitToLab(
  order: ShopOrderForLab,
  items: ShopOrderItemForLab[],
): Promise<LabSubmissionResult> {
  const apiKey = process.env.PRODIGI_API_KEY;

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
    .filter((item) => item.product.labProductId)
    .map((item) => ({
      sku: item.product.labProductId!,
      copies: item.quantity,
      sizing: "fillPrintArea",
      assets: item.photoId
        ? [{ url: `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/api/photos/${item.photoId}/download`, printArea: "default" }]
        : [{ url: `${process.env.R2_PUBLIC_URL ?? ""}/placeholder.jpg`, printArea: "default" }],
    }));

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

  // ── Real API call ─────────────────────────────────────────────────────────
  if (apiKey) {
    try {
      const res = await fetch(PRODIGI_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": apiKey,
        },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        console.error("[Prodigi] API error", res.status, json);
        throw new Error(json?.message || `Prodigi HTTP ${res.status}`);
      }
      const labOrderId = json?.order?.id || json?.id || `PRODIGI-${Date.now()}`;
      const estimatedDelivery =
        json?.order?.status?.details?.estimatedDeliveryDate ?? null;
      return { labOrderId, status: "SUBMITTED", estimatedDelivery, mock: false, raw: json };
    } catch (err: any) {
      console.error("[Prodigi] Submission failed:", err.message);
      throw err;
    }
  }

  // ── Mock mode ─────────────────────────────────────────────────────────────
  const mockId = `MOCK-${Date.now()}-${order.id.slice(-6)}`;
  console.log("[Prodigi MOCK] Would submit order to lab:", JSON.stringify(payload, null, 2));
  return {
    labOrderId: mockId,
    status: "SUBMITTED",
    estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    mock: true,
  };
}
