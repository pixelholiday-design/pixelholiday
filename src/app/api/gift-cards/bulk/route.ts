import { NextResponse } from "next/server";
import { z } from "zod";
import { bulkCreateGiftCards } from "@/lib/gift-cards";

const schema = z.object({
  count: z.number().int().positive().min(1).max(500),
  amount: z.number().positive().min(5).max(1000),
  currency: z.string().length(3).optional(),
  locationId: z.string().optional(),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { count, amount, currency = "EUR", locationId } = parsed.data;

  try {
    const cards = await bulkCreateGiftCards(count, amount, currency, locationId);
    return NextResponse.json({ cards, count: cards.length });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Failed to create gift cards" },
      { status: 500 },
    );
  }
}
