import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  console.log("[Prodigi Webhook]", JSON.stringify(body).slice(0, 500));

  try {
    const event = body;
    const labOrderId = event.orderId || event.order?.id;

    if (!labOrderId) return NextResponse.json({ ok: true });

    // Find our ShopOrder by labOrderId
    const order = await prisma.shopOrder.findFirst({
      where: { labOrderId },
    });
    if (!order) return NextResponse.json({ ok: true, note: "Order not found" });

    const stage = event.status?.stage || event.stage || "";

    if (stage === "InProgress" || event.type === "order.created") {
      await prisma.shopOrder.update({
        where: { id: order.id },
        data: { status: "PROCESSING" },
      });
      console.log(`[Prodigi] Order ${order.id} → PROCESSING`);
    }

    if (stage === "Complete" || event.type === "shipment.shipped") {
      const tracking = event.shipments?.[0]?.tracking;
      const trackingNumber =
        tracking?.number || tracking?.trackingNumber || null;
      const trackingUrl = tracking?.url || tracking?.trackingUrl || null;

      await prisma.shopOrder.update({
        where: { id: order.id },
        data: {
          status: "SHIPPED",
          trackingNumber,
          trackingUrl,
        },
      });
      console.log(`[Prodigi] Order ${order.id} → SHIPPED (tracking: ${trackingNumber})`);
      // TODO: send customer shipping notification email
    }

    if (event.type === "order.completed") {
      await prisma.shopOrder.update({
        where: { id: order.id },
        data: { status: "DELIVERED" },
      });
      console.log(`[Prodigi] Order ${order.id} → DELIVERED`);
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("[Prodigi Webhook Error]", e);
    // Always return 200 to prevent lab from retrying on our processing errors
    return NextResponse.json({ ok: true });
  }
}
