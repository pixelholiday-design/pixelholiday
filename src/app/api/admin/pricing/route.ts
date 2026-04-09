import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getAllPrices } from "@/lib/pricing";
import { requireRole, handleGuardError } from "@/lib/guards";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    await requireRole(["CEO", "OPERATIONS_MANAGER"]);
    const { searchParams } = new URL(req.url);
    const locationId = searchParams.get("locationId") || undefined;

    const prices = await getAllPrices(locationId);
    const history = await prisma.pricingHistory.findMany({
      orderBy: { createdAt: "desc" },
      take: 25,
    });

    // Fetch all locations for the dropdown
    let locations: { id: string; name: string }[] = [];
    try {
      locations = await prisma.location.findMany({
        select: { id: true, name: true },
        orderBy: { name: "asc" },
      });
    } catch {}

    return NextResponse.json({ prices, history, locations });
  } catch (e) {
    const g = handleGuardError(e); if (g) return g;
    return NextResponse.json({ error: "Internal" }, { status: 500 });
  }
}

const updateSchema = z.object({
  productKey: z.string().min(1),
  locationId: z.string().nullable().optional(),
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

    const { productKey, locationId = null } = parsed.data;

    // For location-specific prices: upsert an override row.
    // For global (locationId = null): require existing row.
    if (locationId) {
      // Ensure the global product key exists first
      const globalExists = await prisma.pricingConfig.findFirst({
        where: { productKey, locationId: null },
      });
      if (!globalExists) return NextResponse.json({ error: "Unknown product key" }, { status: 404 });

      const data: Record<string, unknown> = { updatedBy: user.email };
      if (parsed.data.price !== undefined) data.price = parsed.data.price;
      if (parsed.data.isAnchor !== undefined) data.isAnchor = parsed.data.isAnchor;
      if (parsed.data.isHidden !== undefined) data.isHidden = parsed.data.isHidden;
      if (parsed.data.displayOrder !== undefined) data.displayOrder = parsed.data.displayOrder;

      // Upsert using the unique compound key [productKey, locationId]
      const existing = await prisma.pricingConfig.findFirst({ where: { productKey, locationId } });
      let updated;
      if (existing) {
        if (parsed.data.price !== undefined && parsed.data.price !== existing.price) {
          await prisma.pricingHistory.create({
            data: { productKey, oldPrice: existing.price, newPrice: parsed.data.price, changedBy: user.email },
          });
        }
        updated = await prisma.pricingConfig.update({ where: { id: existing.id }, data });
      } else {
        // Create the location override row, inheriting name/currency from global
        updated = await prisma.pricingConfig.create({
          data: {
            productKey,
            name: globalExists.name,
            price: parsed.data.price ?? globalExists.price,
            currency: globalExists.currency,
            locationId,
            isAnchor: parsed.data.isAnchor ?? globalExists.isAnchor,
            isHidden: parsed.data.isHidden ?? globalExists.isHidden,
            displayOrder: parsed.data.displayOrder ?? globalExists.displayOrder,
            updatedBy: user.email,
          },
        });
        if (parsed.data.price !== undefined) {
          await prisma.pricingHistory.create({
            data: { productKey, oldPrice: globalExists.price, newPrice: parsed.data.price, changedBy: user.email },
          });
        }
      }
      return NextResponse.json({ ok: true, price: updated });
    }

    // Global price update
    const existing = await prisma.pricingConfig.findFirst({
      where: { productKey, locationId: null },
    });
    if (!existing) return NextResponse.json({ error: "Unknown product key" }, { status: 404 });

    // If isAnchor=true, ensure no other global product is the anchor
    if (parsed.data.isAnchor === true) {
      await prisma.pricingConfig.updateMany({
        where: { isAnchor: true, locationId: null, productKey: { not: productKey } },
        data: { isAnchor: false },
      });
    }

    const data: Record<string, unknown> = { updatedBy: user.email };
    if (parsed.data.price !== undefined) data.price = parsed.data.price;
    if (parsed.data.isAnchor !== undefined) data.isAnchor = parsed.data.isAnchor;
    if (parsed.data.isHidden !== undefined) data.isHidden = parsed.data.isHidden;
    if (parsed.data.displayOrder !== undefined) data.displayOrder = parsed.data.displayOrder;

    const updated = await prisma.pricingConfig.update({ where: { id: existing.id }, data });

    if (parsed.data.price !== undefined && parsed.data.price !== existing.price) {
      await prisma.pricingHistory.create({
        data: { productKey, oldPrice: existing.price, newPrice: parsed.data.price, changedBy: user.email },
      });
    }
    return NextResponse.json({ ok: true, price: updated });
  } catch (e) {
    const g = handleGuardError(e); if (g) return g;
    return NextResponse.json({ error: "Internal" }, { status: 500 });
  }
}
