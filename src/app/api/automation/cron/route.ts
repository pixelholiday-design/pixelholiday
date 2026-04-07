import { NextResponse } from "next/server";

export async function GET() {
  const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const [a, s] = await Promise.all([
    fetch(`${base}/api/automation/abandoned-cart`, { method: "POST" }).then((r) => r.json()).catch(() => ({})),
    fetch(`${base}/api/automation/sweep-up`, { method: "POST" }).then((r) => r.json()).catch(() => ({})),
  ]);
  return NextResponse.json({ abandonedCart: a, sweepUp: s, ranAt: new Date().toISOString() });
}
