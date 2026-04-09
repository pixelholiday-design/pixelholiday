import { NextResponse } from "next/server";
import { runPreArrivalAutomation } from "@/lib/automation/pre-arrival";

export async function GET() {
  const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const [a, s, p] = await Promise.all([
    fetch(`${base}/api/automation/abandoned-cart`, { method: "POST" }).then((r) => r.json()).catch(() => ({})),
    fetch(`${base}/api/automation/sweep-up`, { method: "POST" }).then((r) => r.json()).catch(() => ({})),
    runPreArrivalAutomation().catch(() => ({})),
  ]);
  return NextResponse.json({ abandonedCart: a, sweepUp: s, preArrival: p, ranAt: new Date().toISOString() });
}
