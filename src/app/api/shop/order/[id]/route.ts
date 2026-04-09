import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

// ── GET /api/shop/order/[id] ──────────────────────────────────────────────────

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const { id } = params;

  if (!id) {
    return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
  }

  try {
    const order = await prisma.shopOrder.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: {
              select: {
                productKey: true,
                name: true,
                category: true,
                fulfillmentType: true,
                turnaround: true,
                mockupUrl: true,
              },
            },
          },
        },
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            whatsapp: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Parse bookPhotoIds JSON strings for each item
    const items = order.items.map((item) => ({
      ...item,
      bookPhotoIds: item.bookPhotoIds
        ? (() => {
            try {
              return JSON.parse(item.bookPhotoIds as string);
            } catch {
              return null;
            }
          })()
        : null,
    }));

    return NextResponse.json({
      ...order,
      items,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
