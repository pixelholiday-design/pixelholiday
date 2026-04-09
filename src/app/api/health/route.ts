import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

const startedAt = Date.now();

function fmtUptime(ms: number): string {
  const s = Math.floor(ms / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  return `${d}d ${h}h ${m}m`;
}

function isSet(name: string): boolean {
  const v = process.env[name];
  return !!v && v !== "" && v !== "undefined";
}

export async function GET() {
  const now = Date.now();

  // Database check
  let dbConnected = false;
  let dbLatency = "N/A";
  try {
    const t0 = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    dbLatency = `${Date.now() - t0}ms`;
    dbConnected = true;
  } catch {}

  // Service checks
  const services = {
    stripe: {
      configured: isSet("STRIPE_SECRET_KEY") && isSet("STRIPE_PUBLISHABLE_KEY"),
      webhookConfigured: isSet("STRIPE_WEBHOOK_SECRET"),
    },
    cloudinary: {
      configured: isSet("CLOUDINARY_CLOUD_NAME") && isSet("CLOUDINARY_API_KEY") && isSet("CLOUDINARY_API_SECRET"),
    },
    r2: {
      configured: isSet("R2_ACCESS_KEY_ID") && isSet("R2_SECRET_ACCESS_KEY") && isSet("R2_BUCKET_NAME"),
    },
    resend: {
      configured: isSet("RESEND_API_KEY"),
    },
    facepp: {
      configured: isSet("FACEPP_API_KEY") && isSet("FACEPP_API_SECRET"),
    },
    prodigi: {
      configured: isSet("PRODIGI_API_KEY"),
    },
    ai: {
      configured: isSet("GEMINI_API_KEY"),
    },
    auth: {
      configured: isSet("NEXTAUTH_SECRET") && isSet("NEXTAUTH_URL"),
    },
  };

  const configuredCount = Object.values(services).filter((s) => s.configured).length;
  const totalServices = Object.keys(services).length;

  const status = !dbConnected
    ? "down"
    : configuredCount < 3
      ? "degraded"
      : "ok";

  return NextResponse.json(
    {
      status,
      version: process.env.NEXT_PUBLIC_APP_VERSION || "1.0.0",
      database: { connected: dbConnected, latency: dbLatency },
      services,
      servicesConfigured: `${configuredCount}/${totalServices}`,
      uptime: fmtUptime(now - startedAt),
      uptimeMs: now - startedAt,
      timestamp: new Date().toISOString(),
    },
    { status: status === "down" ? 503 : 200 },
  );
}
