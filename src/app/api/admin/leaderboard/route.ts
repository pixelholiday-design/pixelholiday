import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { XP_REWARDS, calculateLevel, awardBadges, type LeaderEntry } from "@/lib/gamification";

export async function GET() {
  let entries: LeaderEntry[] = [];
  try {
    const users = await prisma.user.findMany({
      where: { role: { in: ["PHOTOGRAPHER", "SALES_STAFF", "SUPERVISOR"] as any } },
      include: {
        galleries: { include: { photos: true, order: true } },
      },
      take: 100,
    });

    for (const u of users) {
      const uploads = u.galleries.reduce((s: number, g: any) => s + (g.photos?.length || 0), 0);
      const sales = u.galleries.filter((g: any) => g.order).length;
      const revenue = u.galleries.reduce((s: number, g: any) => s + (g.order?.amount || 0), 0);
      const conversionRate = u.galleries.length ? sales / u.galleries.length : 0;

      const xp =
        uploads * XP_REWARDS.PHOTO_UPLOADED +
        u.galleries.length * XP_REWARDS.GALLERY_CREATED +
        sales * XP_REWARDS.SALE_CLOSED;
      entries.push({
        userId: u.id,
        name: u.name,
        xp,
        level: calculateLevel(xp),
        badges: [],
        uploads,
        sales,
        conversionRate,
        revenue,
      });
    }
  } catch {
    // DB unavailable — return empty
  }

  const awards = awardBadges(entries);
  entries = entries.map((e) => ({ ...e, badges: awards[e.userId] || [] }));
  entries.sort((a, b) => b.xp - a.xp);
  entries = entries.map((e, i) => ({ ...e, rank: i + 1 }));

  return NextResponse.json({ leaderboard: entries, totalParticipants: entries.length });
}
