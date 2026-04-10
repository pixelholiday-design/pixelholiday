import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import crypto from "crypto";

/** POST /api/keys — Generate a new API key */
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id;
  const body = await req.json().catch(() => ({}));

  const rawKey = `fq_live_${crypto.randomBytes(24).toString("hex")}`;
  const apiKey = await prisma.apiKey.create({
    data: { userId, key: rawKey, name: body.name || "Default" },
  });

  return NextResponse.json({ ok: true, key: rawKey, id: apiKey.id, name: apiKey.name });
}

/** GET /api/keys — List API keys (masked) */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id;

  const keys = await prisma.apiKey.findMany({
    where: { userId },
    select: { id: true, key: true, name: true, lastUsedAt: true, isActive: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    keys: keys.map((k) => ({ ...k, key: k.key.slice(0, 12) + "..." + k.key.slice(-4) })),
  });
}
