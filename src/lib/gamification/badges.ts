import { prisma } from "@/lib/db";

/**
 * Badge engine.
 *
 * BADGE_DEFS describes every badge the system knows about. checkAndAwardBadges()
 * runs after every XP-earning action, queries the user's stats, and awards any
 * badges whose conditions now hold. UserBadge has a (userId, badgeId) unique
 * constraint so award is idempotent.
 */

export const BADGE_DEFS: {
  key: string;
  name: string;
  description: string;
  icon: string;
  category: "sales" | "uploads" | "streaks" | "special";
  xpBonus?: number;
  isSecret?: boolean;
}[] = [
  { key: "first_blood",       name: "First Blood",        description: "Close your first sale",                              icon: "🩸", category: "sales",   xpBonus: 25 },
  { key: "hat_trick",         name: "Hat Trick",          description: "3 sales in one day",                                 icon: "🎩", category: "sales",   xpBonus: 50 },
  { key: "century_club",      name: "Century Club",       description: "€100+ single sale",                                  icon: "💯", category: "sales",   xpBonus: 75 },
  { key: "big_whale",         name: "Big Whale",          description: "€200+ single sale",                                  icon: "🐋", category: "sales",   xpBonus: 100 },
  { key: "upload_king",       name: "Upload King",        description: "Most uploads this week",                             icon: "📸", category: "uploads", xpBonus: 60 },
  { key: "speed_demon",       name: "Speed Demon",        description: "Upload 100 photos in under 5 min",                   icon: "⚡", category: "uploads", xpBonus: 50 },
  { key: "perfect_day",       name: "Perfect Day",        description: "100% conversion in a single day",                    icon: "✨", category: "sales",   xpBonus: 200 },
  { key: "week_warrior",      name: "Week Warrior",       description: "7-day upload streak",                                icon: "🔥", category: "streaks", xpBonus: 80 },
  { key: "month_machine",     name: "Month Machine",      description: "30-day upload streak",                               icon: "🛡️", category: "streaks", xpBonus: 250 },
  { key: "hook_master",       name: "Hook Master",        description: "5 customers booked from your hook photo",            icon: "🎣", category: "sales",   xpBonus: 60 },
  { key: "digital_pusher",    name: "Digital Pusher",     description: "Sell 10 digital passes in a week",                   icon: "💳", category: "sales",   xpBonus: 100 },
  { key: "sleeping_money_king",name: "Sleeping Money King",description: "€500+ in automated post-trip sales",                icon: "💤", category: "sales",   xpBonus: 150 },
  { key: "team_player",       name: "Team Player",        description: "Help a colleague close a sale",                      icon: "🤝", category: "special", xpBonus: 40 },
  { key: "early_bird",        name: "Early Bird",         description: "First upload before 8 AM",                           icon: "🌅", category: "special", xpBonus: 30 },
  { key: "night_owl",         name: "Night Owl",          description: "Last upload after 8 PM",                             icon: "🦉", category: "special", xpBonus: 30 },
  { key: "review_star",       name: "Review Star",        description: "Receive 10 five-star reviews",                       icon: "⭐", category: "special", xpBonus: 100 },
  { key: "level_5_club",      name: "Level 5 Club",       description: "Reach level 5",                                      icon: "🎖️", category: "special", xpBonus: 0 },
  { key: "level_10_legend",   name: "Level 10 Legend",    description: "Reach level 10",                                     icon: "🏆", category: "special", xpBonus: 0, isSecret: true },
];

export async function ensureBadgeCatalogue() {
  for (const b of BADGE_DEFS) {
    await prisma.badge.upsert({
      where: { key: b.key },
      update: {},
      create: {
        key: b.key,
        name: b.name,
        description: b.description,
        icon: b.icon,
        category: b.category,
        xpBonus: b.xpBonus || 0,
        isSecret: b.isSecret || false,
      },
    });
  }
}

export async function checkAndAwardBadges(userId: string): Promise<string[]> {
  await ensureBadgeCatalogue();
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      userBadges: { include: { badge: true } },
      commissions: { include: { order: true } },
      galleries: { include: { order: true } },
    },
  });
  if (!user) return [];

  const owned = new Set(user.userBadges.map((ub) => ub.badge.key));
  const newlyEarned: string[] = [];

  async function award(key: string) {
    if (owned.has(key)) return;
    const badge = await prisma.badge.findUnique({ where: { key } });
    if (!badge) return;
    try {
      await prisma.userBadge.create({ data: { userId, badgeId: badge.id } });
      newlyEarned.push(key);
      // bonus XP for the badge itself
      if (badge.xpBonus > 0) {
        await prisma.user.update({
          where: { id: userId },
          data: { xp: { increment: badge.xpBonus } },
        });
      }
    } catch {
      // unique constraint — already had it
    }
  }

  // Sales-based
  const completedOrders = user.galleries
    .map((g) => g.order)
    .filter((o): o is NonNullable<typeof o> => !!o && o.status === "COMPLETED");
  if (completedOrders.length >= 1) await award("first_blood");
  if (completedOrders.some((o) => o.amount >= 100)) await award("century_club");
  if (completedOrders.some((o) => o.amount >= 200)) await award("big_whale");

  // 3 sales in one day
  const byDate = new Map<string, number>();
  for (const o of completedOrders) {
    const d = new Date(o.createdAt).toDateString();
    byDate.set(d, (byDate.get(d) || 0) + 1);
  }
  if (Array.from(byDate.values()).some((n) => n >= 3)) await award("hat_trick");

  // Streak badges
  if (user.streakDays >= 7) await award("week_warrior");
  if (user.streakDays >= 30) await award("month_machine");

  // Level milestones
  if (user.level >= 5) await award("level_5_club");
  if (user.level >= 10) await award("level_10_legend");

  // Time-of-day badges (if any XpLog exists at the right hour)
  const earliest = await prisma.xpLog.findFirst({
    where: { userId, action: "upload_gallery" },
    orderBy: { createdAt: "asc" },
  });
  if (earliest && new Date(earliest.createdAt).getHours() < 8) await award("early_bird");
  const latest = await prisma.xpLog.findFirst({
    where: { userId, action: "upload_gallery" },
    orderBy: { createdAt: "desc" },
  });
  if (latest && new Date(latest.createdAt).getHours() >= 20) await award("night_owl");

  return newlyEarned;
}
