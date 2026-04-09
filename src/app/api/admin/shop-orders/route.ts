import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { calculateCommission } from "@/lib/fulfillment/commission";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || undefined;

  try {
    const orders = await prisma.shopOrder.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: "desc" },
      take: 200,
      include: {
        customer: { select: { id: true, name: true, email: true, whatsapp: true } },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                category: true,
                fulfillmentType: true,
                costPrice: true,
                retailPrice: true,
                labProductId: true,
                labName: true,
              },
            },
          },
        },
      },
    });

    // Attach commission breakdown to each order
    const ordersWithCommission = orders.map((order) => {
      const breakdown = calculateCommission(
        order.items.map((i) => ({
          unitPrice: i.unitPrice,
          quantity: i.quantity,
          fulfillmentType: i.product.fulfillmentType,
          costPrice: i.product.costPrice,
          isAutomated: false,
        })),
      );
      return {
        ...order,
        commissionBreakdown: breakdown,
      };
    });

    // Summary stats
    const totalRevenue = orders.reduce((s, o) => s + o.total, 0);
    const totalCommission = ordersWithCommission.reduce(
      (s, o) => s + o.commissionBreakdown.pixelvoCommission,
      0,
    );
    const byStatus: Record<string, number> = {};
    for (const o of orders) {
      byStatus[o.status] = (byStatus[o.status] || 0) + 1;
    }

    return NextResponse.json({
      orders: ordersWithCommission,
      summary: { totalRevenue, totalCommission, byStatus, count: orders.length },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body?.id) return NextResponse.json({ error: "Missing order id" }, { status: 400 });

    const { id, status, trackingNumber, trackingUrl, labOrderId } = body as {
      id: string;
      status?: string;
      trackingNumber?: string;
      trackingUrl?: string;
      labOrderId?: string;
    };

    const update: Record<string, unknown> = {};
    if (status) update.status = status;
    if (trackingNumber !== undefined) update.trackingNumber = trackingNumber;
    if (trackingUrl !== undefined) update.trackingUrl = trackingUrl;
    if (labOrderId !== undefined) update.labOrderId = labOrderId;

    const updated = await prisma.shopOrder.update({
      where: { id },
      data: update,
    });

    return NextResponse.json({ order: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
