import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

function check(name: string): { set: boolean; hint: string } {
  const v = process.env[name];
  const set = !!v && v !== "" && v !== "undefined";
  // Never expose actual values — only whether they're set
  return { set, hint: set ? `Set (${v!.slice(0, 4)}...)` : "Not set" };
}

export async function GET() {
  // Database connectivity
  let dbConnected = false;
  let dbLatency = "";
  let tableCount = 0;
  try {
    const t0 = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    dbLatency = `${Date.now() - t0}ms`;
    dbConnected = true;
    // Count tables
    const tables: any[] = await prisma.$queryRaw`
      SELECT count(*) as c FROM information_schema.tables
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    `;
    tableCount = Number(tables[0]?.c || 0);
  } catch {}

  const vars = [
    { key: "DATABASE_URL", service: "Neon PostgreSQL", category: "Database", docs: "https://neon.tech/docs/connect/connect-from-any-app" },
    { key: "NEXTAUTH_SECRET", service: "NextAuth", category: "Auth", docs: "Run: openssl rand -base64 32" },
    { key: "NEXTAUTH_URL", service: "NextAuth", category: "Auth", docs: "Set to your production URL (e.g. https://fotiqo.com)" },
    { key: "STRIPE_SECRET_KEY", service: "Stripe Payments", category: "Payments", docs: "https://dashboard.stripe.com/apikeys" },
    { key: "STRIPE_PUBLISHABLE_KEY", service: "Stripe Payments", category: "Payments", docs: "https://dashboard.stripe.com/apikeys" },
    { key: "STRIPE_WEBHOOK_SECRET", service: "Stripe Webhooks", category: "Payments", docs: "https://dashboard.stripe.com/webhooks — add endpoint, copy signing secret" },
    { key: "CLOUDINARY_CLOUD_NAME", service: "Cloudinary", category: "Images", docs: "https://console.cloudinary.com/settings/c-CLOUD/api-keys" },
    { key: "CLOUDINARY_API_KEY", service: "Cloudinary", category: "Images", docs: "https://console.cloudinary.com/settings/c-CLOUD/api-keys" },
    { key: "CLOUDINARY_API_SECRET", service: "Cloudinary", category: "Images", docs: "https://console.cloudinary.com/settings/c-CLOUD/api-keys" },
    { key: "R2_ACCESS_KEY_ID", service: "Cloudflare R2", category: "Storage", docs: "https://dash.cloudflare.com — R2 > Manage R2 API Tokens" },
    { key: "R2_SECRET_ACCESS_KEY", service: "Cloudflare R2", category: "Storage", docs: "https://dash.cloudflare.com — R2 > Manage R2 API Tokens" },
    { key: "R2_BUCKET_NAME", service: "Cloudflare R2", category: "Storage", docs: "Your R2 bucket name (e.g. fotiqo-photos)" },
    { key: "R2_ENDPOINT", service: "Cloudflare R2", category: "Storage", docs: "https://<account-id>.r2.cloudflarestorage.com" },
    { key: "R2_PUBLIC_URL", service: "Cloudflare R2", category: "Storage", docs: "Your R2 public bucket URL or custom domain" },
    { key: "RESEND_API_KEY", service: "Resend Email", category: "Email", docs: "https://resend.com/api-keys" },
    { key: "FROM_EMAIL", service: "Resend Email", category: "Email", docs: "e.g. noreply@fotiqo.com (must be verified in Resend)" },
    { key: "FACEPP_API_KEY", service: "Face++ Recognition", category: "AI", docs: "https://console.faceplusplus.com/app/apikey/list" },
    { key: "FACEPP_API_SECRET", service: "Face++ Recognition", category: "AI", docs: "https://console.faceplusplus.com/app/apikey/list" },
    { key: "GEMINI_API_KEY", service: "Google Gemini AI", category: "AI", docs: "https://aistudio.google.com/app/apikey" },
    { key: "PRODIGI_API_KEY", service: "Prodigi Fulfillment", category: "Fulfillment", docs: "https://dashboard.prodigi.com/api-keys" },
    { key: "PRODIGI_ENVIRONMENT", service: "Prodigi Fulfillment", category: "Fulfillment", docs: "sandbox or production" },
  ];

  const results = vars.map((v) => ({
    ...v,
    ...check(v.key),
  }));

  const configured = results.filter((r) => r.set).length;
  const total = results.length;
  const readiness = Math.round((configured / total) * 100);

  return NextResponse.json({
    database: { connected: dbConnected, latency: dbLatency, tableCount },
    variables: results,
    summary: { configured, total, readiness },
  });
}
