/**
 * Idempotent, additive chat seeder.
 *
 * Safe to re-run: uses deterministic natural-key lookups (channel name,
 * channel+user pair, channel+content+sender hash) and short-circuits if a
 * record already exists. Touches ONLY ChatChannel / ChatMember / ChatMessage —
 * never creates / deletes / updates users, orgs, locations, galleries, etc.
 *
 * Usage:
 *   DATABASE_URL=<...> npx tsx scripts/seed-chat.ts
 *
 * Or against local .env:
 *   npx tsx scripts/seed-chat.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function getOrCreateChannel(params: {
  name: string;
  type: "LOCATION" | "ROLE" | "DIRECT" | "ANNOUNCEMENT";
  description?: string;
  locationId?: string | null;
  role?: string | null;
}) {
  const existing = await prisma.chatChannel.findFirst({ where: { name: params.name } });
  if (existing) return existing;
  return prisma.chatChannel.create({
    data: {
      name: params.name,
      type: params.type,
      description: params.description ?? null,
      locationId: params.locationId ?? null,
      role: params.role ?? null,
      isSystem: true,
    },
  });
}

async function ensureMember(channelId: string, userId: string) {
  await prisma.chatMember.upsert({
    where: { channelId_userId: { channelId, userId } },
    update: {},
    create: { channelId, userId },
  });
}

async function ensureMessage(args: {
  channelId: string;
  senderId: string | null;
  content: string;
  type?: "TEXT" | "SYSTEM" | "ALERT" | "AI_TIP";
}) {
  // Natural key: channel + sender + content. This is fine for seed messages
  // because they're hand-picked and won't collide with organic user input.
  const existing = await prisma.chatMessage.findFirst({
    where: {
      channelId: args.channelId,
      senderId: args.senderId,
      content: args.content,
    },
    select: { id: true },
  });
  if (existing) return existing;
  return prisma.chatMessage.create({
    data: {
      channelId: args.channelId,
      senderId: args.senderId,
      content: args.content,
      type: (args.type ?? "TEXT") as any,
    },
    select: { id: true },
  });
}

async function main() {
  console.log("🌱 Additive chat seeder starting…");

  // ── 1. Discover real users + locations on this DB ──
  const [users, locations] = await Promise.all([
    prisma.user.findMany({
      select: { id: true, name: true, role: true, email: true, locationId: true },
    }),
    prisma.location.findMany({ select: { id: true, name: true, type: true } }),
  ]);

  if (users.length === 0 || locations.length === 0) {
    console.log("⚠️  No users or locations found. Nothing to seed.");
    return;
  }

  const byEmail = new Map(users.map((u) => [u.email, u]));
  const byRole = (role: string) => users.filter((u) => u.role === role);

  // Pick "canonical" actors. Fall back to role lookups if seed emails aren't present.
  const ceo = byEmail.get("admin@pixelholiday.local") ?? byRole("CEO")[0];
  const ops = byEmail.get("ops@pixelholiday.local") ?? byRole("OPERATIONS_MANAGER")[0];
  const supervisor = byEmail.get("super@pixelholiday.local") ?? byRole("SUPERVISOR")[0];
  const photo1 = byEmail.get("photo1@pixelholiday.local") ?? byRole("PHOTOGRAPHER")[0];
  const photo2 = byEmail.get("photo2@pixelholiday.local") ?? byRole("PHOTOGRAPHER")[1] ?? photo1;
  const sales = byEmail.get("sales@pixelholiday.local") ?? byRole("SALES_STAFF")[0];
  const reception = byEmail.get("reception@pixelholiday.local") ?? byRole("RECEPTIONIST")[0];
  const trainee = byEmail.get("trainee@pixelholiday.local") ?? byRole("ACADEMY_TRAINEE")[0];

  if (!ceo) {
    console.log("⚠️  No CEO found — skipping seed to avoid weird state.");
    return;
  }

  const hotel = locations.find((l) => l.name === "Hilton Monastir") ?? locations.find((l) => l.type === "HOTEL");
  const park =
    locations.find((l) => l.name === "AquaSplash Water Park") ?? locations.find((l) => l.type === "WATER_PARK");

  console.log(`   Found ${users.length} users, ${locations.length} locations`);
  console.log(`   Canonical actors: ceo=${ceo?.name}, ops=${ops?.name}, photo1=${photo1?.name}`);
  console.log(`   Hotel: ${hotel?.name ?? "(none)"}, Park: ${park?.name ?? "(none)"}`);

  // ── 2. Create / find the 5 canonical channels ──
  const hiltonChan = hotel
    ? await getOrCreateChannel({
        name: "Hilton Team",
        type: "LOCATION",
        description: "Hilton Monastir on-site team",
        locationId: hotel.id,
      })
    : null;

  const aquaChan = park
    ? await getOrCreateChannel({
        name: "AquaSplash Team",
        type: "LOCATION",
        description: "AquaSplash Water Park crew",
        locationId: park.id,
      })
    : null;

  const photogChan = await getOrCreateChannel({
    name: "All Photographers",
    type: "ROLE",
    description: "Cross-site photographer chat",
    role: "PHOTOGRAPHER",
  });

  const announceChan = await getOrCreateChannel({
    name: "Announcements",
    type: "ANNOUNCEMENT",
    description: "Company-wide announcements",
  });

  const mgmtChan = await getOrCreateChannel({
    name: "Management",
    type: "ROLE",
    description: "CEO, Ops, and Supervisors",
    role: "MANAGEMENT",
  });

  // ── 3. Memberships (idempotent) ──
  const add = async (channelId: string | undefined, list: (typeof users)[number][]) => {
    if (!channelId) return;
    for (const u of list) if (u) await ensureMember(channelId, u.id);
  };

  // Hilton team: anyone with locationId = hotel.id, plus CEO/ops
  if (hiltonChan && hotel) {
    const hiltonStaff = users.filter((u) => u.locationId === hotel.id);
    await add(hiltonChan.id, [ceo, ops, ...hiltonStaff].filter(Boolean) as any[]);
  }
  // AquaSplash team: anyone with locationId = park.id, plus CEO/ops
  if (aquaChan && park) {
    const parkStaff = users.filter((u) => u.locationId === park.id);
    await add(aquaChan.id, [ceo, ops, ...parkStaff].filter(Boolean) as any[]);
  }
  // All Photographers: every photographer + leadership
  await add(
    photogChan.id,
    [ceo, ops, ...byRole("PHOTOGRAPHER")].filter(Boolean) as any[]
  );
  // Announcements: everyone
  await add(announceChan.id, users);
  // Management: CEO, OPS, SUPERVISORs
  await add(
    mgmtChan.id,
    [ceo, ops, ...byRole("SUPERVISOR")].filter(Boolean) as any[]
  );

  // ── 4. Starter messages (idempotent, ~15 items including AI/SYSTEM) ──
  const messages: Array<{
    channelId?: string;
    senderId: string | null;
    content: string;
    type?: "TEXT" | "SYSTEM" | "ALERT" | "AI_TIP";
  }> = [];

  if (hiltonChan) {
    if (ops) messages.push({ channelId: hiltonChan.id, senderId: ops.id, content: "All cameras synced for the morning shift." });
    if (photo1) messages.push({ channelId: hiltonChan.id, senderId: photo1.id, content: "Heading to room 214 now for the family booking." });
    if (sales) messages.push({ channelId: hiltonChan.id, senderId: sales.id, content: "Just closed a €150 album sale at the kiosk 🎉" });
    messages.push({
      channelId: hiltonChan.id,
      senderId: null,
      content: "⚠️ Conversion rate on today's galleries dropped 18% — review hook images.",
      type: "ALERT",
    });
  }
  if (aquaChan) {
    if (photo2) messages.push({ channelId: aquaChan.id, senderId: photo2.id, content: "Wristband station restocked, 40 left." });
    if (ops) messages.push({ channelId: aquaChan.id, senderId: ops.id, content: "Slides reopen at 14:00, staff back in position." });
    messages.push({
      channelId: aquaChan.id,
      senderId: null,
      content: "💡 AI Tip: Guests love burst shots on the main slide — try 6-frame bursts for auto-reels.",
      type: "AI_TIP",
    });
  }
  if (photo1) messages.push({ channelId: photogChan.id, senderId: photo1.id, content: "Anyone have a spare SD card? Mine is full." });
  if (photo2) messages.push({ channelId: photogChan.id, senderId: photo2.id, content: "I've got one at AquaSplash, swing by after your shift." });
  messages.push({
    channelId: photogChan.id,
    senderId: null,
    content: "💡 AI Tip: Golden hour today is 18:42 — schedule VIP sunset sessions now.",
    type: "AI_TIP",
  });
  messages.push({ channelId: announceChan.id, senderId: ceo.id, content: "Team, great work last weekend — water park hit a record €12,400." });
  messages.push({ channelId: announceChan.id, senderId: ceo.id, content: "Reminder: monthly payroll closes Friday." });
  messages.push({
    channelId: announceChan.id,
    senderId: null,
    content: "📣 New pricing tier live: VIP Sunset Package €180.",
    type: "SYSTEM",
  });
  if (ops) messages.push({ channelId: mgmtChan.id, senderId: ops.id, content: "Staff cost leaderboard attached — 3 photographers flagged for review." });
  messages.push({
    channelId: mgmtChan.id,
    senderId: null,
    content: "⚠️ Cash drawer variance of €42 detected at Hilton kiosk.",
    type: "ALERT",
  });

  let created = 0;
  let skipped = 0;
  for (const m of messages) {
    if (!m.channelId) continue;
    const before = await prisma.chatMessage.findFirst({
      where: { channelId: m.channelId, senderId: m.senderId, content: m.content },
      select: { id: true },
    });
    await ensureMessage({ channelId: m.channelId, senderId: m.senderId, content: m.content, type: m.type });
    if (before) skipped++;
    else created++;
  }

  // ── 5. Report ──
  const [chCount, msgCount, memCount] = await Promise.all([
    prisma.chatChannel.count(),
    prisma.chatMessage.count(),
    prisma.chatMember.count(),
  ]);
  console.log("✅ Chat seed complete:");
  console.log(`   Channels: ${chCount}`);
  console.log(`   Members:  ${memCount}`);
  console.log(`   Messages: ${msgCount} (added ${created}, skipped ${skipped} already-present)`);
}

main()
  .catch((e) => {
    console.error("❌ seed-chat failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
