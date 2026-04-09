import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

const HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Cache-Control": "no-store",
};

const startedAt = Date.now();

export async function OPTIONS() {
  return new NextResponse(null, { headers: HEADERS });
}

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    const localServer = await prisma.kioskConfig.findFirst({ where: { isLocalServer: true } });
    return NextResponse.json(
      {
        status: "ok",
        role: "LOCAL_SERVER",
        name: localServer?.name || "Fotiqo Sale Point",
        locationId: localServer?.locationId || null,
        uptimeMs: Date.now() - startedAt,
        timestamp: new Date().toISOString(),
      },
      { headers: HEADERS }
    );
  } catch (e: any) {
    return NextResponse.json(
      { status: "degraded", error: e?.message || "unknown" },
      { status: 503, headers: HEADERS }
    );
  }
}
