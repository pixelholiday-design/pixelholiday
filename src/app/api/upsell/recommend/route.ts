import { NextRequest, NextResponse } from "next/server";
import { pickScript } from "@/lib/upsell/coach";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const ctx = await req.json().catch(() => ({}));
  const script = await pickScript(ctx);
  if (script) {
    await prisma.upsellScript.update({
      where: { id: script.id },
      data: { timesShown: { increment: 1 } },
    });
  }
  return NextResponse.json({ script });
}
