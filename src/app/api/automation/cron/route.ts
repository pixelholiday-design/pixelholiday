import { NextResponse } from "next/server";
import { runPreArrivalAutomation } from "@/lib/automation/pre-arrival";
import { runGalleryExpiryAutomation } from "@/lib/automation/gallery-expiry";

export async function GET() {
  const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const [a, s, p, poll, expiry] = await Promise.all([
    fetch(`${base}/api/automation/abandoned-cart`, { method: "POST" }).then((r) => r.json()).catch(() => ({})),
    fetch(`${base}/api/automation/sweep-up`, { method: "POST" }).then((r) => r.json()).catch(() => ({})),
    runPreArrivalAutomation().catch(() => ({})),
    fetch(`${base}/api/shop/poll-status`).then((r) => r.json()).catch(() => ({})),
    runGalleryExpiryAutomation().catch(() => ({})),
  ]);
  return NextResponse.json({ abandonedCart: a, sweepUp: s, preArrival: p, pollStatus: poll, galleryExpiry: expiry, ranAt: new Date().toISOString() });
}
