import { NextResponse } from "next/server";
import { runNoShowRecovery } from "@/lib/automation/no-show-recovery";

export async function POST() {
  const result = await runNoShowRecovery();
  return NextResponse.json(result);
}
