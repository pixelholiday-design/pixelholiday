import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/** POST /api/keys/test — Validate an API key from the Authorization header */
export async function POST(req: Request) {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) {
    return NextResponse.json(
      { error: "Missing API key. Use: Authorization: Bearer fq_live_xxx" },
      { status: 401 }
    );
  }

  const key = auth.slice(7);
  const apiKey = await prisma.apiKey.findUnique({ where: { key } });

  if (!apiKey) {
    return NextResponse.json({ error: "API key not found" }, { status: 401 });
  }
  if (!apiKey.isActive) {
    return NextResponse.json({ error: "API key has been revoked" }, { status: 401 });
  }

  // Update last used timestamp
  await prisma.apiKey.update({
    where: { id: apiKey.id },
    data: { lastUsedAt: new Date() },
  });

  return NextResponse.json({
    ok: true,
    message: "API key is valid",
    keyName: apiKey.name,
    userId: apiKey.userId,
  });
}
