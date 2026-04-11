import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * GET /api/shop/poll-status
 * Polls the lab APIs for status updates on PROCESSING orders.
 * Called from /api/automation/cron or manually.
 * Currently supports Prodigi; other labs can be added below.
 */
export async function GET() {
  try {
    const processingOrders = await prisma.shopOrder.findMany({
      where: { status: "PROCESSING", labOrderId: { not: null } },
      orderBy: { updatedAt: "asc" },
      take: 50,
    });

    if (processingOrders.length === 0) {
      return NextResponse.json({ updated: 0, message: "No PROCESSING orders to poll" });
    }

    const updates: { id: string; status: string; trackingNumber?: string | null }[] = [];
    const errors: { id: string; error: string }[] = [];

    const prodigiKey = process.env.PRODIGI_API_KEY;
    const printfulKey = process.env.PRINTFUL_API_KEY;

    for (const order of processingOrders) {
      if (!order.labOrderId) continue;

      try {
        // Detect which lab based on labName
        const labName = (order.labName || "").toUpperCase();

        if (labName.includes("PRODIGI") && prodigiKey) {
          const res = await fetch(
            `https://api.prodigi.com/v4.0/Orders/${order.labOrderId}`,
            {
              headers: { "X-API-Key": prodigiKey },
              signal: AbortSignal.timeout(8000),
            }
          );

          if (res.ok) {
            const json = await res.json().catch(() => null);
            const stage: string =
              json?.order?.status?.stage || json?.status?.stage || "";
            const trackingNumber: string | null =
              json?.order?.shipments?.[0]?.tracking?.number ?? null;
            const trackingUrl: string | null =
              json?.order?.shipments?.[0]?.tracking?.url ?? null;

            if (stage === "Complete" && trackingNumber) {
              await prisma.shopOrder.update({
                where: { id: order.id },
                data: { status: "SHIPPED", trackingNumber, trackingUrl },
              });
              updates.push({ id: order.id, status: "SHIPPED", trackingNumber });
            } else if (stage === "Delivered") {
              await prisma.shopOrder.update({
                where: { id: order.id },
                data: { status: "DELIVERED" },
              });
              updates.push({ id: order.id, status: "DELIVERED" });
            } else if (stage === "Error") {
              await prisma.shopOrder.update({
                where: { id: order.id },
                data: { status: "ERROR" },
              });
              updates.push({ id: order.id, status: "ERROR" });
            }
          }
        } else if (labName.includes("PRINTFUL") && printfulKey) {
          const res = await fetch(
            `https://api.printful.com/orders/@${order.labOrderId}`,
            {
              headers: { Authorization: `Bearer ${printfulKey}` },
              signal: AbortSignal.timeout(8000),
            }
          );

          if (res.ok) {
            const json = await res.json().catch(() => null);
            const pfStatus: string = json?.result?.status || "";
            const shipments = json?.result?.shipments || [];
            const tracking: string | null =
              shipments[0]?.tracking_number ?? null;
            const trackingUrl: string | null =
              shipments[0]?.tracking_url ?? null;

            if (pfStatus === "shipped" && tracking) {
              await prisma.shopOrder.update({
                where: { id: order.id },
                data: { status: "SHIPPED", trackingNumber: tracking, trackingUrl },
              });
              updates.push({ id: order.id, status: "SHIPPED", trackingNumber: tracking });
            } else if (pfStatus === "fulfilled") {
              await prisma.shopOrder.update({
                where: { id: order.id },
                data: { status: "DELIVERED" },
              });
              updates.push({ id: order.id, status: "DELIVERED" });
            } else if (pfStatus === "failed") {
              await prisma.shopOrder.update({
                where: { id: order.id },
                data: { status: "ERROR" },
              });
              updates.push({ id: order.id, status: "ERROR" });
            }
          }
        }
        if (labName.includes("WHCC")) {
          const whccKey = process.env.WHCC_API_KEY;
          if (whccKey) {
            const whccEnv = process.env.WHCC_ENVIRONMENT || "sandbox";
            const whccBase = whccEnv === "live" ? "https://api.whcc.com/v1" : "https://api.sandbox.whcc.com/v1";
            const res = await fetch(`${whccBase}/orders/${order.labOrderId}`, {
              headers: {
                Authorization: `Bearer ${whccKey}`,
                "X-Account-Id": process.env.WHCC_ACCOUNT_ID || "",
              },
              signal: AbortSignal.timeout(8000),
            });

            if (res.ok) {
              const json = await res.json().catch(() => null);
              const whccStatus = (json?.status || "").toLowerCase();
              const tracking: string | null = json?.trackingNumber || json?.tracking?.number || null;
              const trackingUrl: string | null = json?.trackingUrl || json?.tracking?.url || null;

              if (whccStatus.includes("ship") && tracking) {
                await prisma.shopOrder.update({
                  where: { id: order.id },
                  data: { status: "SHIPPED", trackingNumber: tracking, trackingUrl },
                });
                updates.push({ id: order.id, status: "SHIPPED", trackingNumber: tracking });
              } else if (whccStatus.includes("deliver") || whccStatus.includes("complete")) {
                await prisma.shopOrder.update({
                  where: { id: order.id },
                  data: { status: "DELIVERED" },
                });
                updates.push({ id: order.id, status: "DELIVERED" });
              } else if (whccStatus.includes("error") || whccStatus.includes("fail")) {
                await prisma.shopOrder.update({
                  where: { id: order.id },
                  data: { status: "ERROR" },
                });
                updates.push({ id: order.id, status: "ERROR" });
              }
            }
          }
        }
        // MOCK orders: skip (they won't have real lab APIs)
      } catch (e: any) {
        console.error(`[poll-status] Error polling order ${order.id}:`, e.message);
        errors.push({ id: order.id, error: e.message });
      }
    }

    return NextResponse.json({
      polled: processingOrders.length,
      updated: updates.length,
      updates,
      errors,
      ranAt: new Date().toISOString(),
    });
  } catch (e: any) {
    console.error("[poll-status] Fatal error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
