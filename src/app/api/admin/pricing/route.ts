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
  price: z.number().positive().max(100000),
});

export async function POST(req: Request) {
  try {
    const user = await requireRole(["CEO", "OPERATIONS_MANAGER"]);
    const body = await req.json().catch(() => ({}));
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

    const existing = await prisma.pricingConfig.findUnique({ where: { productKey: parsed.data.productKey } });
    if (!existing) return NextResponse.json({ error: "Unknown product key" }, { status: 404 });

    const updated = await prisma.pricingConfig.update({
      where: { productKey: parsed.data.productKey },
      data: { price: parsed.data.price, updatedBy: user.email },
    });
    await prisma.pricingHistory.create({
      data: {
        productKey: parsed.data.productKey,
        oldPrice: existing.price,
        newPrice: parsed.data.price,
        changedBy: user.email,
      },
    });
    return NextResponse.json({ ok: true, price: updated });
  } catch (e) {
    const g = handleGuardError(e); if (g) return g;
    return NextResponse.json({ error: "Internal" }, { status: 500 });
  }
}
