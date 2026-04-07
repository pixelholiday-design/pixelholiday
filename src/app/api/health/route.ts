import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

const startedAt = Date.now();

export async function GET() {
  try {
    // Light-touch DB ping — fails fast if connection is dead
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({
      status: "ok",
      database: "connected",
      uptimeMs: Date.now() - startedAt,
      timestamp: new Date().toISOString(),
      version: process.env.NEXT_PUBLIC_APP_VERSION || "dev",
    });
  } catch (e: any) {
    return NextResponse.json(
      {
        status: "degraded",
        database: "disconnected",
        error: e?.message || "unknown",
        uptimeMs: Date.now() - startedAt,
      },
      { status: 503 }
    );
  }
}
