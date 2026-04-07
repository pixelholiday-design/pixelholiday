import {
  PrismaClient,
  GalleryStatus,
  LocationType,
  OrgType,
  StaffRole,
  AppointmentStatus,
  BookingSource,
  OrderStatus,
  PaymentMethod,
  OrderItemType,
  CommissionType,
  EquipmentStatus,
  QRCodeType,
  ContentStatus,
  AcademyModuleType,
  MagicElementType,
} from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding PixelHoliday...");

  // ── ORG + LOCATIONS ───────────────────────────
  const org = await prisma.organization.create({
    data: { name: "PixelHoliday Tunisia", type: OrgType.HEADQUARTERS },
  });
  const hotel = await prisma.location.create({
    data: { name: "Hilton Monastir", type: LocationType.HOTEL, orgId: org.id, address: "Monastir, Tunisia", rentCost: 2500 },
  });
  const park = await prisma.location.create({
    data: { name: "AquaSplash Water Park", type: LocationType.WATER_PARK, orgId: org.id, address: "Hammamet, Tunisia", rentCost: 1800 },
  });

  // ── USERS (8 roles) ───────────────────────────
  const passwordHash = await bcrypt.hash("password123", 10);
  const mkUser = (name: string, email: string, role: StaffRole, locationId?: string, salary?: number) =>
    prisma.user.create({
      data: { name, email, password: passwordHash, role, orgId: org.id, locationId, salary, rating: 4 + Math.random() },
    });

  const ceo = await mkUser("Admin CEO", "admin@pixelholiday.local", StaffRole.CEO, undefined, 5000);
  const ops = await mkUser("Omar Operations", "ops@pixelholiday.local", StaffRole.OPERATIONS_MANAGER, hotel.id, 3500);
  const supervisor = await mkUser("Sofia Supervisor", "super@pixelholiday.local", StaffRole.SUPERVISOR, hotel.id, 2200);
  const photo1 = await mkUser("Yassine Ben", "photo1@pixelholiday.local", StaffRole.PHOTOGRAPHER, hotel.id, 1500);
  const photo2 = await mkUser("Karim Hamdi", "photo2@pixelholiday.local", StaffRole.PHOTOGRAPHER, park.id, 1500);
  const sales = await mkUser("Sami Sales", "sales@pixelholiday.local", StaffRole.SALES_STAFF, hotel.id, 1300);
  const reception = await mkUser("Rana Reception", "reception@pixelholiday.local", StaffRole.RECEPTIONIST, hotel.id, 1100);
  const trainee = await mkUser("Taha Trainee", "trainee@pixelholiday.local", StaffRole.ACADEMY_TRAINEE, hotel.id, 600);

  const photographers = [photo1, photo2];

  // ── CUSTOMERS ─────────────────────────────────
  const customers = await Promise.all(
    Array.from({ length: 5 }).map((_, i) =>
      prisma.customer.create({
        data: {
          name: `Guest ${i + 1}`,
          email: `guest${i + 1}@example.com`,
          whatsapp: `+216200000${i}${i}`,
          roomNumber: `${100 + i * 7}`,
          locationId: i % 2 === 0 ? hotel.id : park.id,
        },
      })
    )
  );

  // ── GALLERIES + PHOTOS ────────────────────────
  const statuses: GalleryStatus[] = [
    GalleryStatus.HOOK_ONLY, GalleryStatus.PREVIEW_ECOM, GalleryStatus.PAID,
    GalleryStatus.PARTIAL_PAID, GalleryStatus.DIGITAL_PASS, GalleryStatus.HOOK_ONLY,
    GalleryStatus.PREVIEW_ECOM, GalleryStatus.PREVIEW_ECOM, GalleryStatus.PAID, GalleryStatus.HOOK_ONLY,
  ];
  const demoUrl = (i: number) => `https://picsum.photos/seed/pixel${i}/1200/800`;
  const galleries: { id: string; status: GalleryStatus; photographerId: string; customerId: string }[] = [];

  for (let g = 0; g < 10; g++) {
    const photographer = photographers[g % photographers.length];
    const customer = customers[g % customers.length];
    const location = g % 2 === 0 ? hotel : park;
    const gallery = await prisma.gallery.create({
      data: {
        status: statuses[g],
        locationId: location.id,
        photographerId: photographer.id,
        customerId: customer.id,
        roomNumber: customer.roomNumber,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        totalCount: 5,
      },
    });
    galleries.push({ id: gallery.id, status: statuses[g], photographerId: photographer.id, customerId: customer.id });

    for (let p = 0; p < 5; p++) {
      const idx = g * 5 + p;
      await prisma.photo.create({
        data: {
          galleryId: gallery.id,
          s3Key_highRes: demoUrl(idx),
          cloudinaryId: `sample-${idx}`,
          isHookImage: p === 0,
          sortOrder: p,
          isPurchased: statuses[g] === GalleryStatus.PAID || (statuses[g] === GalleryStatus.PARTIAL_PAID && p < 2),
        },
      });
    }

    if (statuses[g] === GalleryStatus.PARTIAL_PAID) {
      await prisma.gallery.update({
        where: { id: gallery.id },
        data: { partialPurchase: true, purchasedCount: 2 },
      });
    }
  }

  // ── APPOINTMENTS (5) ──────────────────────────
  const apptStatuses = [
    AppointmentStatus.PENDING,
    AppointmentStatus.CONFIRMED,
    AppointmentStatus.CONFIRMED,
    AppointmentStatus.COMPLETED,
    AppointmentStatus.COMPLETED,
  ];
  for (let i = 0; i < 5; i++) {
    const g = galleries[i];
    await prisma.appointment.create({
      data: {
        galleryId: g.id,
        scheduledTime: new Date(Date.now() + (i - 2) * 86400000),
        status: apptStatuses[i],
        assignedPhotographerId: g.photographerId,
        source: BookingSource.HOOK_GALLERY,
      },
    });
  }

  // ── ORDERS + ITEMS + COMMISSIONS ──────────────
  const orderRows: { id: string; photographerId: string; amount: number; isAuto: boolean }[] = [];
  for (let i = 0; i < 10; i++) {
    const g = galleries[i];
    const isAuto = i >= 7; // last 3 are sleeping money
    const amount = [49, 99, 15, 99, 49, 35, 150, 99, 49, 99][i];
    const order = await prisma.order.create({
      data: {
        galleryId: g.id,
        customerId: g.customerId,
        amount,
        currency: "EUR",
        paymentMethod: i % 2 === 0 ? PaymentMethod.STRIPE_ONLINE : PaymentMethod.STRIPE_TERMINAL,
        status: i < 8 ? OrderStatus.COMPLETED : OrderStatus.PENDING,
        isAutomatedSale: isAuto,
        items: {
          create: [{
            type: amount >= 99 ? OrderItemType.FULL_GALLERY : OrderItemType.SINGLE_PHOTO,
            unitPrice: amount,
            quantity: 1,
          }],
        },
      },
    });
    orderRows.push({ id: order.id, photographerId: g.photographerId, amount, isAuto });
  }

  // ── COMMISSIONS (15 across types) ─────────────
  const commTypes: CommissionType[] = [
    CommissionType.PHOTO_SALE, CommissionType.PHOTO_SALE, CommissionType.PHOTO_SALE,
    CommissionType.DIGITAL_PASS_SALE, CommissionType.DIGITAL_PASS_SALE,
    CommissionType.APPOINTMENT_BOOKING, CommissionType.APPOINTMENT_BOOKING,
    CommissionType.QR_REFERRAL, CommissionType.QR_REFERRAL,
    CommissionType.SLEEPING_MONEY, CommissionType.SLEEPING_MONEY, CommissionType.SLEEPING_MONEY,
    CommissionType.PHOTO_SALE, CommissionType.PHOTO_SALE, CommissionType.APPOINTMENT_BOOKING,
  ];
  const month = new Date().toISOString().slice(0, 7);
  for (let i = 0; i < 15; i++) {
    const o = orderRows[i % orderRows.length];
    const rate = commTypes[i] === CommissionType.SLEEPING_MONEY ? 0.20 : 0.10;
    await prisma.commission.create({
      data: {
        userId: i % 3 === 0 ? sales.id : o.photographerId,
        orderId: o.id,
        type: commTypes[i],
        amount: Math.round(o.amount * rate * 100) / 100,
        rate,
        month,
        isPaid: i < 5,
        paidAt: i < 5 ? new Date() : null,
      },
    });
  }

  // ── SHIFTS (this week, all photographers) ─────
  const today = new Date();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
  for (const ph of photographers) {
    for (let d = 0; d < 5; d++) {
      const day = new Date(monday);
      day.setDate(monday.getDate() + d);
      const start = new Date(day);
      start.setHours(9, 0, 0, 0);
      const end = new Date(day);
      end.setHours(17, 0, 0, 0);
      await prisma.shift.create({
        data: {
          userId: ph.id,
          date: day,
          startTime: start,
          endTime: end,
          locationId: ph.locationId!,
        },
      });
    }
  }

  // ── EQUIPMENT (3 items, assigned) ─────────────
  const eq1 = await prisma.equipment.create({
    data: { name: "Nikon D7000 #3", type: "Camera", serialNumber: "NK-7000-003", purchaseCost: 1200, locationId: hotel.id, status: EquipmentStatus.ASSIGNED },
  });
  const eq2 = await prisma.equipment.create({
    data: { name: "Canon 24-70mm L", type: "Lens", serialNumber: "CN-2470-014", purchaseCost: 1800, locationId: hotel.id, status: EquipmentStatus.ASSIGNED },
  });
  const eq3 = await prisma.equipment.create({
    data: { name: "iPad Pro 12.9 (Kiosk)", type: "iPad", serialNumber: "IPD-12-088", purchaseCost: 1100, locationId: park.id, status: EquipmentStatus.ASSIGNED },
  });
  await prisma.equipmentAssignment.createMany({
    data: [
      { equipmentId: eq1.id, userId: photo1.id },
      { equipmentId: eq2.id, userId: photo1.id },
      { equipmentId: eq3.id, userId: photo2.id },
    ],
  });

  // ── QR CODES ──────────────────────────────────
  await prisma.qRCode.create({
    data: { code: "QR-ROOM-214", type: QRCodeType.HOTEL_ROOM, locationId: hotel.id, scanCount: 12 },
  });
  await prisma.qRCode.create({
    data: { code: "QR-WRIST-AQUA-001", type: QRCodeType.WRISTBAND, locationId: park.id, scanCount: 47 },
  });

  // ── CHAT MESSAGES ─────────────────────────────
  const chatMsgs = [
    { senderId: ceo.id, content: "Team, great work last weekend — water park hit a record." },
    { senderId: ops.id, content: "All cameras synced for the morning shift." },
    { senderId: photo1.id, content: "Heading to room 214 now for the family booking." },
    { senderId: sales.id, content: "Just closed a €150 album sale at the kiosk 🎉" },
    { senderId: reception.id, content: "Two QR pre-bookings came in via the lobby card." },
  ];
  for (const m of chatMsgs) {
    await prisma.chatMessage.create({
      data: { senderId: m.senderId, content: m.content, channelId: `location:${hotel.id}` },
    });
  }

  // ── BLOG POSTS ────────────────────────────────
  await prisma.blogPost.create({
    data: {
      title: "5 reasons to book a sunset photo session in Tunisia",
      content: "The golden hour over the Mediterranean is unlike anywhere else…",
      authorId: ceo.id,
      isAIGenerated: true,
      status: ContentStatus.PUBLISHED,
      seoKeywords: ["tunisia", "sunset", "photography", "resort"],
      publishedAt: new Date(),
    },
  });
  await prisma.blogPost.create({
    data: {
      title: "How AquaSplash captures speed-camera waterslide shots",
      content: "Behind the scenes of our automated speed camera system…",
      authorId: ops.id,
      isAIGenerated: false,
      status: ContentStatus.DRAFT,
      seoKeywords: ["waterpark", "speed-camera", "tech"],
    },
  });

  // ── B2B DELIVERY ──────────────────────────────
  await prisma.b2BDelivery.create({
    data: {
      locationId: hotel.id,
      month: new Date().toISOString().slice(0, 7),
      photoCount: 10,
      deliveredAt: new Date(),
      rentDiscountPercent: 0.12,
      notes: "Sunset shots for hotel marketing — agreed 12% rent discount.",
    },
  });

  // ── MAGIC ELEMENTS ────────────────────────────
  await prisma.magicElement.createMany({
    data: [
      {
        name: "Pirate Parrot",
        type: MagicElementType.THREE_D_CHARACTER,
        assetUrl: "https://example.com/assets/pirate-parrot.glb",
        category: "Animals",
      },
      {
        name: "Fennec Fox",
        type: MagicElementType.THREE_D_CHARACTER,
        assetUrl: "https://example.com/assets/fennec-fox.glb",
        category: "Local Culture",
      },
    ],
  });

  // ── ACADEMY MODULE ────────────────────────────
  await prisma.academyModule.create({
    data: {
      title: "PixelHoliday Onboarding",
      description: "Welcome to the studio. Learn the kiosk flow, camera handoff, and customer experience standards.",
      type: AcademyModuleType.ONBOARDING,
      sortOrder: 1,
      isRequired: true,
    },
  });

  console.log("✅ Seed complete:");
  console.log("   1 org, 2 locations");
  console.log("   8 users (CEO, Ops, Supervisor, 2 Photographers, Sales, Reception, Trainee)");
  console.log("   5 customers, 10 galleries, 50 photos");
  console.log("   5 appointments, 10 orders, 15 commissions");
  console.log("   10 shifts, 3 equipment items, 2 QR codes");
  console.log("   5 chat messages, 2 blog posts, 1 B2B delivery");
  console.log("   2 magic elements, 1 academy module");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
