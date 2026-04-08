/**
 * Seed 5 sample bookings with varied sources.
 * Run: npx tsx prisma/seed-bookings.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const locations = await prisma.location.findMany();
  if (locations.length === 0) {
    console.error("No locations seeded yet — run prisma/seed.ts first");
    process.exit(1);
  }
  const photographers = await prisma.user.findMany({ where: { role: "PHOTOGRAPHER" } });
  if (photographers.length === 0) {
    console.error("No photographers seeded yet");
    process.exit(1);
  }

  const hilton = locations.find((l) => l.name.includes("Hilton")) || locations[0];
  const aquaSplash = locations.find((l) => l.name.includes("AquaSplash")) || locations[0];
  const friguia = locations.find((l) => l.name.includes("Friguia")) || locations[0];
  const norida = locations.find((l) => l.name.includes("Norida")) || locations[0];
  const yassine = photographers[0];
  const karim = photographers[1] || photographers[0];

  const now = Date.now();
  const tomorrow = new Date(now + 86400000);
  const dayAfter = new Date(now + 2 * 86400000);

  const rows = [
    {
      customerName: "Maria García",
      customerEmail: "maria.garcia@example.com",
      customerPhone: "+34612345001",
      source: "WEBSITE" as const,
      sourceDetail: "Website contact form #WEB-4521",
      externalRef: "WEB-4521",
      sessionType: "SUNSET",
      partySize: 4,
      locationId: hilton.id,
      photographerId: yassine.id,
      scheduledTime: new Date(tomorrow.setHours(19, 0, 0, 0)),
      specialRequests: "Anniversary celebration, beach backdrop preferred",
      estimatedDuration: 45,
    },
    {
      customerName: "The Johnson Family",
      customerEmail: "johnson.family@example.com",
      customerPhone: "+441234567002",
      source: "INSTAGRAM" as const,
      sourceDetail: "IG DM from @jenjohnson_travels",
      externalRef: "IG-2026-0408-01",
      sessionType: "FAMILY",
      partySize: 5,
      locationId: aquaSplash.id,
      photographerId: karim.id,
      scheduledTime: new Date(tomorrow.setHours(11, 30, 0, 0)),
      specialRequests: "Kids love the big slide",
      estimatedDuration: 30,
    },
    {
      customerName: "Dr. Tanaka",
      customerEmail: "tanaka@example.jp",
      customerPhone: "+81312345003",
      source: "HOTEL_CONCIERGE" as const,
      sourceDetail: "Booked via Norida front desk — Sarah M.",
      sessionType: "VIP",
      partySize: 2,
      locationId: norida.id,
      photographerId: yassine.id,
      scheduledTime: new Date(dayAfter.setHours(18, 0, 0, 0)),
      specialRequests: "Private beach session, 30th anniversary",
      estimatedDuration: 60,
    },
    {
      customerName: "Ahmed & Family",
      customerEmail: "",
      customerPhone: "+21698765004",
      source: "WHATSAPP" as const,
      sourceDetail: "WhatsApp +216 98 765 432 → Yassine",
      sessionType: "GROUP",
      partySize: 8,
      locationId: friguia.id,
      photographerId: karim.id,
      scheduledTime: new Date(dayAfter.setHours(10, 0, 0, 0)),
      specialRequests: "Three generations, grandparents visiting from France",
      estimatedDuration: 45,
    },
    {
      customerName: "Bella & Marco",
      customerEmail: "bellamarco@example.com",
      customerPhone: "+39055123005",
      source: "FACEBOOK" as const,
      sourceDetail: "FB Messenger inquiry",
      externalRef: "FB-MSG-9982",
      sessionType: "ROMANTIC",
      partySize: 2,
      locationId: hilton.id,
      photographerId: yassine.id,
      scheduledTime: new Date(dayAfter.setHours(19, 30, 0, 0)),
      specialRequests: "Honeymoon — golden hour preferred",
      estimatedDuration: 45,
    },
  ];

  let created = 0;
  for (const r of rows) {
    const existing = await prisma.appointment.findFirst({
      where: {
        customerName: r.customerName,
        source: r.source,
      },
    });
    if (existing) {
      console.log(`  ↻ exists: ${r.customerName} (${r.source})`);
      continue;
    }
    const appt = await prisma.appointment.create({
      data: {
        customerName: r.customerName,
        customerEmail: r.customerEmail || null,
        customerPhone: r.customerPhone,
        source: r.source,
        sourceDetail: r.sourceDetail,
        externalRef: (r as any).externalRef || null,
        sessionType: r.sessionType,
        partySize: r.partySize,
        locationId: r.locationId,
        assignedPhotographerId: r.photographerId,
        scheduledTime: r.scheduledTime,
        specialRequests: r.specialRequests,
        estimatedDuration: r.estimatedDuration,
        status: "CONFIRMED",
      },
    });
    console.log(`  ✓ ${r.customerName.padEnd(24)} ${r.source.padEnd(16)} ${r.sessionType.padEnd(10)} party=${r.partySize}  id=${appt.id.slice(0, 8)}`);
    created += 1;
  }

  console.log(`\nDONE — ${created} new bookings created.`);
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
