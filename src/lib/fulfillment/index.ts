/**
 * Main fulfillment orchestrator.
 * Called after a ShopOrder is paid (Stripe webhook or manual trigger).
 */

import { prisma } from "@/lib/db";
import { submitToLab } from "./prodigi";
import { calculateCommission } from "./commission";

export type FulfillmentResult = {
  orderId: string;
  status: "PROCESSING" | "PARTIAL" | "ERROR";
  digital: number;
  physical: number;
  manual: number;
  labOrderId?: string;
  commission: number;
  error?: string;
};

export async function fulfillOrder(shopOrderId: string): Promise<FulfillmentResult> {
  // Load order with items and products
  let order;
  try {
    order = await prisma.shopOrder.findUnique({
      where: { id: shopOrderId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });
  } catch (err: any) {
    return { orderId: shopOrderId, status: "ERROR", digital: 0, physical: 0, manual: 0, commission: 0, error: err.message };
  }

  if (!order) {
    return { orderId: shopOrderId, status: "ERROR", digital: 0, physical: 0, manual: 0, commission: 0, error: "Order not found" };
  }

  // Group items by fulfillment type
  const digitalItems = order.items.filter((i) => i.product.fulfillmentType === "DIGITAL");
  const autoItems = order.items.filter((i) => i.product.fulfillmentType === "AUTO");
  const manualItems = order.items.filter((i) => i.product.fulfillmentType === "MANUAL");

  const updates: Promise<unknown>[] = [];
  let labOrderId: string | undefined;

  // 1. DIGITAL → mark delivered immediately
  if (digitalItems.length > 0) {
    updates.push(
      prisma.shopOrderItem
        .updateMany({
          where: { id: { in: digitalItems.map((i) => i.id) } },
          data: { status: "DELIVERED" },
        })
        .catch(() => null),
    );
  }

  // 2. AUTO (print lab) → submit to Prodigi
  if (autoItems.length > 0) {
    try {
      const result = await submitToLab(order, autoItems as any);
      labOrderId = result.labOrderId;
      updates.push(
        prisma.shopOrder
          .update({
            where: { id: shopOrderId },
            data: { labOrderId: result.labOrderId, labName: result.mock ? "MOCK" : "PRODIGI" },
          })
          .catch(() => null),
      );
      updates.push(
        prisma.shopOrderItem
          .updateMany({
            where: { id: { in: autoItems.map((i) => i.id) } },
            data: { status: "IN_PRODUCTION", labItemId: result.labOrderId },
          })
          .catch(() => null),
      );
    } catch (err: any) {
      console.error("[fulfillOrder] Lab submission failed:", err.message);
      // Don't block – just leave items as PENDING
    }
  }

  // 3. MANUAL → mark as PENDING_MANUAL (no automation)
  if (manualItems.length > 0) {
    updates.push(
      prisma.shopOrderItem
        .updateMany({
          where: { id: { in: manualItems.map((i) => i.id) } },
          data: { status: "PENDING_MANUAL" },
        })
        .catch(() => null),
    );
  }

  // Calculate commission
  const commissionBreakdown = calculateCommission(
    order.items.map((i) => ({
      unitPrice: i.unitPrice,
      quantity: i.quantity,
      fulfillmentType: i.product.fulfillmentType,
      costPrice: i.product.costPrice,
      isAutomated: false, // can be extended with sleeping-money flag
    })),
  );

  // Update order status + commission
  updates.push(
    prisma.shopOrder
      .update({
        where: { id: shopOrderId },
        data: {
          status: "PROCESSING",
          pixelvoCommission: commissionBreakdown.pixelvoCommission,
        },
      })
      .catch(() => null),
  );

  await Promise.all(updates);

  return {
    orderId: shopOrderId,
    status: "PROCESSING",
    digital: digitalItems.length,
    physical: autoItems.length,
    manual: manualItems.length,
    labOrderId,
    commission: commissionBreakdown.pixelvoCommission,
  };
}
