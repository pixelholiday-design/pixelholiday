import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

const schema = z.object({
  code: z.string().min(1),
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

  const { code } = parsed.data;
  const card = await prisma.giftCard.findUnique({ where: { code } });

  if (!card) {
    return NextResponse.json({ error: "Gift card not found" }, { status: 404 });
  }

  if (!card.isActive) {
    return NextResponse.json({ error: "Gift card is already inactive" }, { status: 400 });
  }

  await prisma.giftCard.update({
    where: { code },
    data: { isActive: false },
  });

  return NextResponse.json({ success: true, code });
}
