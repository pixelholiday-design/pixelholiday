import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { BADGES } from "@/lib/gamification";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  // Returns badge definitions and a mock monthly awards ceremony summary.
  const badges = Object.values(BADGES);
  const monthlyAwards = badges.map((b) => ({ ...b, awardedTo: null }));
  return NextResponse.json({ badges, monthlyAwards });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  // Simulate badge award trigger (push notification stub)
  const { userId, badgeId } = await req.json();
  const badge = (BADGES as any)[badgeId];
  if (!badge) return NextResponse.json({ error: "Unknown badge" }, { status: 400 });
  // In production: persist to DB + send WhatsApp / push notification
  console.log(`[BADGE] ${badge.icon} ${badge.name} awarded to ${userId}`);
  return NextResponse.json({ ok: true, notification: `${badge.icon} You earned: ${badge.name}!` });
}
