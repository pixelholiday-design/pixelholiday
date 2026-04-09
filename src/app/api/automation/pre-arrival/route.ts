import { NextResponse } from "next/server";
import { runPreArrivalAutomation } from "@/lib/automation/pre-arrival";

/**
 * POST /api/automation/pre-arrival
 * Trigger pre-arrival automation: Digital Pass offers + checkout reminders.
 * Designed to be called by a cron job or scheduled task.
 */
export async function POST() {
  try {
    const result = await runPreArrivalAutomation();
    return NextResponse.json({ ok: true, ...result });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
