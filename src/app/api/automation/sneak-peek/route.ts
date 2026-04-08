import { NextRequest, NextResponse } from "next/server";
import { runSneakPeek } from "@/lib/automation/sneak-peek";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const result = await runSneakPeek(body.locationId);
  return NextResponse.json(result);
}
