import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { Resend } from "resend";

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  console.log("[Printful Webhook]", JSON.stringify(body).slice(0, 500));

  try {
    const eventType: string = body.type || "";
    // Printful event data lives in body.data
    const data = body.data || body;

    // Printful uses merchantReference or order.external_id to link back to us
    const merchantRef: string | undefined =
      data.order?.external_id || data.external_id;

    // Also support looking up by labOrderId (if we stored Printful's order id)
    const printfulOrderId: string | undefined =
      String(data.order?.id || data.id || "");

    let order = null;

    // Try by merchant reference first (our ShopOrder.id)
    if (merchantRef) {
      order = await prisma.shopOrder.findUnique({ where: { id: merchantRef } });
    }
    // Fall back to labOrderId stored from submission
    if (!order && printfulOrderId) {
      order = await prisma.shopOrder.findFirst({
        where: { labOrderId: printfulOrderId },
      });
    }

    if (!order) {
      console.warn(`[Printful] No matching order for merchantRef=${merchantRef} / labOrderId=${printfulOrderId}`);
      return NextResponse.json({ ok: true, note: "Order not found" });
    }

    if (eventType === "order_created") {
      await prisma.shopOrder.update({
        where: { id: order.id },
        data: { status: "PROCESSING" },
      });
      console.log(`[Printful] Order ${order.id} → PROCESSING`);
    }

    if (eventType === "package_shipped") {
      const shipment = data.shipment || {};
      const trackingNumber = shipment.tracking_number || null;
      const trackingUrl = shipment.tracking_url || null;

      await prisma.shopOrder.update({
        where: { id: order.id },
        data: {
          status: "SHIPPED",
          trackingNumber,
          trackingUrl,
        },
      });
      console.log(`[Printful] Order ${order.id} → SHIPPED (tracking: ${trackingNumber})`);

      // Send customer shipping notification if email available
      if (process.env.RESEND_API_KEY) {
        try {
          const fullOrder = await prisma.shopOrder.findUnique({
            where: { id: order.id },
            include: { customer: { select: { email: true, name: true } } },
          });
          if (fullOrder?.customer?.email) {
            const resend = new Resend(process.env.RESEND_API_KEY);
            const trackingLine = trackingNumber
              ? `<p>Tracking number: <strong>${trackingNumber}</strong>${trackingUrl ? ` · <a href="${trackingUrl}">Track your package</a>` : ""}</p>`
              : "";
            await resend.emails.send({
              from: process.env.FROM_EMAIL || "hello@fotiqo.local",
              to: fullOrder.customer.email,
              subject: "Your Fotiqo order has shipped!",
              html: `
                <p>Hi ${fullOrder.customer.name || "there"},</p>
                <p>Great news — your print order is on its way!</p>
                ${trackingLine}
                <p>Thank you for choosing Fotiqo.</p>
              `,
            });
          }
        } catch (emailErr) {
          console.warn("[Printful] Shipping email failed:", emailErr);
        }
      } else {
        console.log(`[Email MOCK → customer] Printful order shipped, tracking: ${trackingNumber}`);
      }
    }

    if (eventType === "order_failed") {
      console.error(`[Printful] order_failed for ShopOrder ${order.id}`, data);
      // Mark with ERROR status and log for admin
      await prisma.shopOrder.update({
        where: { id: order.id },
        data: { status: "ERROR" },
      });
      // Notify admin via AI growth log
      try {
        await prisma.aIGrowthLog.create({
          data: {
            type: "PRICING_OPTIMIZATION",
            description: `Printful order failed — ShopOrder ${order.id}`,
            result: JSON.stringify(data).slice(0, 500),
            dataSnapshot: { shopOrderId: order.id, printfulOrderId, eventType },
          },
        });
      } catch {
        // non-critical
      }
    }

    if (eventType === "order_canceled") {
      await prisma.shopOrder.update({
        where: { id: order.id },
        data: { status: "CANCELLED" },
      });
      console.log(`[Printful] Order ${order.id} → CANCELLED`);
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("[Printful Webhook Error]", e);
    // Always return 200 to prevent Printful from retrying
    return NextResponse.json({ ok: true });
  }
}
