import { NextResponse } from "next/server";
import { getXpStats, getLeaderboard } from "@/lib/gamification/xp";
import { requireStaff, handleGuardError } from "@/lib/guards";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const me = await requireStaff();
    const stats = await getXpStats(me.id);
    const leaderboard = await getLeaderboard("week");
    const myRank = leaderboard.findIndex((r) => r?.userId === me.id);
    return NextResponse.json({
      stats,
      leaderboard: leaderboard.slice(0, 10),
      myRank: myRank >= 0 ? myRank + 1 : null,
    });
  } catch (e) {
    const g = handleGuardError(e);
    if (g) return g;
    return NextResponse.json({ error: "Internal" }, { status: 500 });
  }
}
