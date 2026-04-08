export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { suggestHook } from "@/lib/hooks/suggest";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const hook = await suggestHook({
    demographic: sp.get("demographic") ?? undefined,
    location: sp.get("location") ?? undefined,
    locationType: sp.get("locationType") ?? undefined,
    timeOfDay: sp.get("timeOfDay") ?? undefined,
  });
  return NextResponse.json({ hook });
}
