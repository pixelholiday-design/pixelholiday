import { NextResponse } from "next/server";
import { z } from "zod";
import { redeemGiftCard } from "@/lib/gift-cards";

const schema = z.object({
  code: z.string().min(1),
  amount: z.number().positive(),
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

  const { code, amount } = parsed.data;
  const result = await redeemGiftCard(code.toUpperCase().trim(), amount);

  if (!result.success) {
    return NextResponse.json(
      { error: result.error, remainingBalance: result.remainingBalance },
      { status: 400 },
    );
  }

  return NextResponse.json({
    success: true,
    remainingBalance: result.remainingBalance,
  });
}
