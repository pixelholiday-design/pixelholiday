import { NextRequest, NextResponse } from "next/server";
import { runAllGates } from "@/lib/scaling/gates";

export async function POST(req: NextRequest) {
  const { orgId } = await req.json();
  if (!orgId) return NextResponse.json({ error: "orgId required" }, { status: 400 });
  const results = await runAllGates(orgId);
  return NextResponse.json({ results });
}
