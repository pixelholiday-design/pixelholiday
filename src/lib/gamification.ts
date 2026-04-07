import { prisma } from "./db";

export const BADGES = ["Top Closer", "Upload King", "Booking Machine", "Streak Master", "Revenue Champion"] as const;
export type Badge = (typeof BADGES)[number];

export function levelFromXp(xp: number) {
  return Math.floor(xp / 1000) + 1;
}

export async function addXp(userId: string, amount: number, reason?: string) {
  const u = await prisma.user.update({
    where: { id: userId },
    data: { xp: { increment: amount } },
  });
  const newLevel = levelFromXp(u.xp);
  if (newLevel !== u.level) {
    await prisma.user.update({ where: { id: userId }, data: { level: newLevel } });
  }
  console.log(`[XP] +${amount} → ${u.name} (${reason || ""})`);
  return { xp: u.xp, level: newLevel };
}

export async function awardBadge(userId: string, badge: Badge) {
  const u = await prisma.user.findUnique({ where: { id: userId } });
  if (!u || u.badges.includes(badge)) return;
  await prisma.user.update({
    where: { id: userId },
    data: { badges: { set: [...u.badges, badge] } },
  });
  console.log(`[Badge] ${badge} → ${u.name}`);
}
