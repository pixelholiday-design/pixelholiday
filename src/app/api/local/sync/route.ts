import { NextResponse } from "next/server";
import { getSyncStats, runSyncOnce } from "@/lib/sync";

export const dynamic = "force-dynamic";

export async function GET() {
  const stats = await getSyncStats();
  return NextResponse.json({ stats });
}

export async function POST() {
  const r = await runSyncOnce();
  const stats = await getSyncStats();
  return NextResponse.json({ ok: true, ran: r, stats });
}
