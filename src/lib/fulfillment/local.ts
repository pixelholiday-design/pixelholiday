/**
 * Local / in-house print fulfillment.
 *
 * Creates queue records using the existing PrintJob model (Order-based) or
 * falls back to a lightweight in-memory log when the ShopOrder context
 * doesn't have a plain Order reference.
 *
 * Also sends an internal chat notification so on-site staff can see the job.
 */

import { prisma } from "@/lib/db";

export type LocalPrintJobResult = {
  printJobIds: string[];
  status: "QUEUED" | "FALLBACK";
  mock: boolean;
};

export type ShopOrderForLocal = {
  id: string;
  shippingName: string | null;
};

export type ShopOrderItemForLocal = {
  id: string;
  quantity: number;
  size: string | null;
  photoId: string | null;
  product: {
    name: string;
    productKey?: string;
  };
};

/**
 * Queue a local print job for each item in the order.
 * Uses prisma.printJob when the shopOrder is linked to an Order (via galleryId).
 * Falls back to a console log + returns IDs if no Order link exists.
 */
export async function createLocalPrintJob(
  order: ShopOrderForLocal,
  items: ShopOrderItemForLocal[],
  photoUrls: Record<string, string> = {},
): Promise<LocalPrintJobResult> {
  const printJobIds: string[] = [];

  // Try to find the linked core Order so we can use the PrintJob model
  let linkedOrderId: string | null = null;
  try {
    const shopOrder = await prisma.shopOrder.findUnique({
      where: { id: order.id },
      select: { galleryId: true },
    });
    if (shopOrder?.galleryId) {
      // Look up the Order by galleryId
      const coreOrder = await prisma.order.findFirst({
        where: { galleryId: shopOrder.galleryId },
        select: { id: true },
      });
      linkedOrderId = coreOrder?.id ?? null;
    }
  } catch {
    // No linked order – will use fallback path
  }

  for (const item of items) {
    const photoId = item.photoId ?? null;

    if (linkedOrderId && photoId) {
      // Persist a real PrintJob record
      try {
        const job = await prisma.printJob.create({
          data: {
            orderId: linkedOrderId,
            photoIds: [photoId],
            printSize: item.size ?? "4x6",
            copies: item.quantity,
          },
        });
        printJobIds.push(job.id);
      } catch (err: any) {
        console.error("[LocalFulfillment] Failed to create PrintJob:", err.message);
        printJobIds.push(`LOCAL-FALLBACK-${item.id.slice(-6)}-${Date.now()}`);
      }
    } else {
      // Fallback: generate a synthetic ID and log
      const fallbackId = `LOCAL-${item.id.slice(-6)}-${Date.now()}`;
      printJobIds.push(fallbackId);
      const imageUrl =
        photoUrls[item.id] ||
        (photoId
          ? `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/api/photos/${photoId}/download`
          : "NO_PHOTO");
      console.log(
        `[LocalFulfillment] QUEUED job ${fallbackId}`,
        JSON.stringify({
          shopOrderId: order.id,
          product: item.product.name,
          size: item.size,
          copies: item.quantity,
          imageUrl,
        }),
      );
    }
  }

  // Notify staff via internal chat channel "global"
  try {
    // Attempt to find any staff user to attribute the system message
    const systemUser = await prisma.user.findFirst({
      where: { role: "OPERATIONS_MANAGER" },
      select: { id: true },
    });
    if (systemUser) {
      await prisma.chatMessage.create({
        data: {
          senderId: systemUser.id,
          channelId: "global",
          content: `[Print Queue] New local print job(s) queued for order ${order.id.slice(-8)} (${order.shippingName ?? "Customer"}). ${items.length} item(s). IDs: ${printJobIds.join(", ")}`,
        },
      });
    }
  } catch {
    // Chat notification is non-critical; never block fulfilment
  }

  return {
    printJobIds,
    status: linkedOrderId ? "QUEUED" : "FALLBACK",
    mock: false,
  };
}
