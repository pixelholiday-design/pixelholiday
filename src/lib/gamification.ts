// Unified XP system + badge logic across all modules.
export const XP_REWARDS = {
  PHOTO_UPLOADED: 1,
  GALLERY_CREATED: 10,
  SALE_CLOSED: 50,
  BOOKING_COMPLETED: 20,
  HOOK_CONVERSION: 30,
  STREAK_DAY: 5,
};

export const BADGES = {
  TOP_CLOSER: { id: "TOP_CLOSER", name: "Top Closer", icon: "💰", desc: "Highest weekly conversion rate", cadence: "weekly" },
  UPLOAD_KING: { id: "UPLOAD_KING", name: "Upload King", icon: "📸", desc: "Most uploads this week", cadence: "weekly" },
  BOOKING_MACHINE: { id: "BOOKING_MACHINE", name: "Booking Machine", icon: "📅", desc: "Most bookings driven this week", cadence: "weekly" },
  STREAK_MASTER: { id: "STREAK_MASTER", name: "Streak Master", icon: "🔥", desc: "7-day consecutive upload streak", cadence: "instant" },
  REVENUE_CHAMPION: { id: "REVENUE_CHAMPION", name: "Revenue Champion", icon: "🏆", desc: "Highest individual monthly revenue", cadence: "monthly" },
};

export function calculateLevel(xp: number) {
  // Level = floor(sqrt(xp/100)) — exponential curve
  return Math.floor(Math.sqrt(xp / 100)) + 1;
}

export type LeaderEntry = {
  userId: string;
  name: string;
  xp: number;
  level: number;
  badges: string[];
  uploads: number;
  sales: number;
  conversionRate: number;
  revenue: number;
  rank?: number;
};

export function awardBadges(entries: LeaderEntry[]): Record<string, string[]> {
  const awards: Record<string, string[]> = {};
  if (!entries.length) return awards;
  const add = (uid: string, b: string) => { (awards[uid] = awards[uid] || []).push(b); };

  const topCloser = [...entries].sort((a, b) => b.conversionRate - a.conversionRate)[0];
  if (topCloser && topCloser.conversionRate > 0) add(topCloser.userId, BADGES.TOP_CLOSER.id);

  const uploadKing = [...entries].sort((a, b) => b.uploads - a.uploads)[0];
  if (uploadKing && uploadKing.uploads > 0) add(uploadKing.userId, BADGES.UPLOAD_KING.id);

  const bookingMachine = [...entries].sort((a, b) => b.sales - a.sales)[0];
  if (bookingMachine && bookingMachine.sales > 0) add(bookingMachine.userId, BADGES.BOOKING_MACHINE.id);

  const revChamp = [...entries].sort((a, b) => b.revenue - a.revenue)[0];
  if (revChamp && revChamp.revenue > 0) add(revChamp.userId, BADGES.REVENUE_CHAMPION.id);

  for (const e of entries) {
    if (e.uploads >= 7) add(e.userId, BADGES.STREAK_MASTER.id); // simplified streak proxy
  }
  return awards;
}
