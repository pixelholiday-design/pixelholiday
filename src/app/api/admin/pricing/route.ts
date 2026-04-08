import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getAllPrices } from "@/lib/pricing";
import { requireRole, handleGuardError } from "@/lib/guards";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireRole(["CEO", "OPERATIONS_MANAGER"]);
    const prices = await getAllPrices();
    const history = await prisma.pricingHistory.findMany({ orderBy: { createdAt: "desc" }, take: 25 });
    return NextResponse.json({ prices, history });
  } catch (e) {
    const g = handleGuardError(e); if (g) return g;
    return NextResponse.json({ error: "Internal" }, { status: 500 });
  }
}

const updateSchema = z.object({
  productKey: z.string().min(1),
  price: z.number().positive().max(100000).optional(),
  isAnchor: z.boolean().optional(),
  isHidden: z.boolean().optional(),
  displayOrder: z.number().int().optional(),
});

export async function POST(req: Request) {
  try {
    const user = await requireRole(["CEO", "OPERATIONS_MANAGER"]);
    const body = await req.json().catch(() => ({}));
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

    const existing = await prisma.pricingConfig.findUnique({ where: { productKey: parsed.data.productKey } });
    if (!existing) return NextResponse.json({ error: "Unknown product key" }, { status: 404 });

    // If isAnchor=true, ensure no other product is the anchor
    if (parsed.data.isAnchor === true) {
      await prisma.pricingConfig.updateMany({
        where: { isAnchor: true, productKey: { not: parsed.data.productKey } },
        data: { isAnchor: false },
      });
    }

    const data: Record<string, unknown> = { updatedBy: user.email };
    if (parsed.data.price !== undefined) data.price = parsed.data.price;
    if (parsed.data.isAnchor !== undefined) data.isAnchor = parsed.data.isAnchor;
    if (parsed.data.isHidden !== undefined) data.isHidden = parsed.data.isHidden;
    if (parsed.data.displayOrder !== undefined) data.displayOrder = parsed.data.displayOrder;

    const updated = await prisma.pricingConfig.update({
      where: { productKey: parsed.data.productKey },
      data,
    });

    if (parsed.data.price !== undefined && parsed.data.price !== existing.price) {
      await prisma.pricingHistory.create({
        data: {
          productKey: parsed.data.productKey,
          oldPrice: existing.price,
          newPrice: parsed.data.price,
          changedBy: user.email,
        },
      });
    }
    return NextResponse.json({ ok: true, price: updated });
  } catch (e) {
    const g = handleGuardError(e); if (g) return g;
    return NextResponse.json({ error: "Internal" }, { status: 500 });
  }
}
