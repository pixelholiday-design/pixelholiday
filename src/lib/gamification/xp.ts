import { prisma } from "@/lib/db";
import { checkAndAwardBadges } from "@/lib/gamification/badges";

/**
 * Single-source-of-truth XP engine. Every photographer/staff action that
 * should earn points goes through awardXP(), which:
 *   1. Inserts an XpLog row (audit trail per action)
 *   2. Increments User.xp atomically
 *   3. Recomputes the user's level + updates streakDays / lastActivityAt
 *   4. Triggers badge checks
 *
 * Action keys map to XP rewards in REWARDS below. Add new entries here, never
 * inline magic numbers in route handlers.
 */

export const REWARDS = {
  upload_gallery: 10,
  upload_bonus_50_photos: 25,
  upload_speed_bonus: 10,
  upload_first_of_day: 10,
  hook_booking: 30,
  sale_close: 50,
  sale_close_100plus: 75,
  sale_close_200plus: 100,
  digital_pass_sale: 40,
  five_star_review: 60,
  perfect_day: 200,
  upsell: 35,
  sleeping_money: 20,
  streak_day: 15,
} as const;

export type XpAction = keyof typeof REWARDS;

export const LEVELS: { level: number; xp: number; title: string; perk: string }[] = [
  { level: 1, xp: 0, title: "Rookie", perk: "—" },
  { level: 2, xp: 200, title: "Shooter", perk: "—" },
  { level: 3, xp: 500, title: "Closer", perk: "Blue badge" },
  { level: 4, xp: 1000, title: "Pro", perk: "Priority bookings" },
  { level: 5, xp: 2000, title: "Expert", perk: "Choose own schedule" },
  { level: 6, xp: 3500, title: "Master", perk: "Mentors new staff" },
  { level: 7, xp: 5000, title: "Elite", perk: "+5% commission bonus" },
  { level: 8, xp: 8000, title: "Legend", perk: "+10% commission bonus" },
  { level: 9, xp: 12000, title: "Champion", perk: "Hall of fame" },
  { level: 10, xp: 20000, title: "Pixelvo Icon", perk: "Auto-supervisor" },
];

export function levelForXp(xp: number) {
  let current = LEVELS[0];
  for (const l of LEVELS) if (xp >= l.xp) current = l;
  return current;
}

export function nextLevel(xp: number) {
  return LEVELS.find((l) => l.xp > xp) || null;
}

export async function awardXP(
  userId: string,
  action: XpAction | { action: XpAction; bonus?: number },
  context?: Record<string, unknown>
) {
  const { action: act, bonus } = typeof action === "string" ? { action, bonus: 0 } : action;
  const amount = REWARDS[act] + (bonus || 0);
  if (!amount) return null;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return null;

  // Streak: same calendar day = no change; consecutive day = +1; gap = reset
  const now = new Date();
  let streakDays = user.streakDays;
  if (user.lastActivityAt) {
    const last = new Date(user.lastActivityAt);
    const dayMs = 24 * 60 * 60 * 1000;
    const sameDay = last.toDateString() === now.toDateString();
    const consecutive =
      Math.floor((now.getTime() - last.getTime()) / dayMs) === 1 &&
      now.toDateString() !== last.toDateString();
    if (consecutive) streakDays += 1;
    else if (!sameDay) streakDays = 1;
  } else {
    streakDays = 1;
  }

  const newXp = user.xp + amount;
  const newLevel = levelForXp(newXp).level;
  const leveledUp = newLevel > user.level;

  await prisma.$transaction([
    prisma.xpLog.create({
      data: { userId, action: act, amount, context: context ? JSON.stringify(context) : null },
    }),
    prisma.user.update({
      where: { id: userId },
      data: { xp: newXp, level: newLevel, streakDays, lastActivityAt: now },
    }),
  ]);

  // Badge check runs synchronously so the response can return earned badges
  const earned = await checkAndAwardBadges(userId).catch(() => []);

  return { amount, newXp, level: newLevel, leveledUp, earnedBadges: earned, streakDays };
}

export async function getXpStats(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      xp: true,
      level: true,
      streakDays: true,
      badges: true,
      userBadges: { include: { badge: true } },
    },
  });
  if (!user) return null;
  const cur = levelForXp(user.xp);
  const next = nextLevel(user.xp);
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayXp = await prisma.xpLog.aggregate({
    _sum: { amount: true },
    where: { userId, createdAt: { gte: todayStart } },
  });
  return {
    user,
    current: cur,
    next,
    todayXp: todayXp._sum.amount || 0,
    progressToNext: next
      ? Math.min(100, Math.round(((user.xp - cur.xp) / (next.xp - cur.xp)) * 100))
      : 100,
  };
}

export async function getLeaderboard(period: "today" | "week" | "month" | "all", locationId?: string) {
  const since = new Date();
  if (period === "today") since.setHours(0, 0, 0, 0);
  else if (period === "week") since.setDate(since.getDate() - 7);
  else if (period === "month") since.setDate(since.getDate() - 30);
  else since.setFullYear(2000);

  const xpRows = await prisma.xpLog.groupBy({
    by: ["userId"],
    _sum: { amount: true },
    where: { createdAt: { gte: since } },
    orderBy: { _sum: { amount: "desc" } },
    take: 20,
  });

  const users = await prisma.user.findMany({
    where: {
      id: { in: xpRows.map((r) => r.userId) },
      ...(locationId ? { locationId } : {}),
    },
    select: { id: true, name: true, level: true, xp: true, locationId: true, userBadges: true },
  });
  const userMap = new Map(users.map((u) => [u.id, u]));

  return xpRows
    .map((r, i) => {
      const u = userMap.get(r.userId);
      if (!u) return null;
      return {
        rank: i + 1,
        userId: u.id,
        name: u.name,
        level: u.level,
        totalXp: u.xp,
        periodXp: r._sum.amount || 0,
        badgeCount: u.userBadges.length,
      };
    })
    .filter(Boolean);
}
