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

  // Assign 4-digit PINs for sale-kiosk access
  await prisma.user.update({ where: { id: photo1.id }, data: { pin: "1111" } });
  await prisma.user.update({ where: { id: photo2.id }, data: { pin: "2222" } });
  await prisma.user.update({ where: { id: sales.id }, data: { pin: "3333" } });
  await prisma.user.update({ where: { id: supervisor.id }, data: { pin: "4444" } });

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
          // Real HTTPS URL so cleanUrl/watermarkedUrl can fall through when
          // Cloudinary isn't configured in the target env.
          s3Key_highRes: demoUrl(idx),
          cloudinaryId: null,
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

  // ── CHAT CHANNELS + MEMBERS + MESSAGES ────────
  const hiltonChannel = await prisma.chatChannel.create({
    data: {
      name: "Hilton Team",
      type: "LOCATION",
      description: "Hilton Monastir on-site team",
      locationId: hotel.id,
      isSystem: true,
    },
  });
  const aquaChannel = await prisma.chatChannel.create({
    data: {
      name: "AquaSplash Team",
      type: "LOCATION",
      description: "AquaSplash Water Park crew",
      locationId: park.id,
      isSystem: true,
    },
  });
  const photogChannel = await prisma.chatChannel.create({
    data: {
      name: "All Photographers",
      type: "ROLE",
      description: "Cross-site photographer chat",
      role: "PHOTOGRAPHER",
      isSystem: true,
    },
  });
  const announceChannel = await prisma.chatChannel.create({
    data: {
      name: "Announcements",
      type: "ANNOUNCEMENT",
      description: "Company-wide announcements",
      isSystem: true,
    },
  });
  const mgmtChannel = await prisma.chatChannel.create({
    data: {
      name: "Management",
      type: "ROLE",
      description: "CEO, Ops, and Supervisors",
      role: "MANAGEMENT",
      isSystem: true,
    },
  });

  const addMembers = async (channelId: string, userIds: string[]) => {
    for (const userId of userIds) {
      await prisma.chatMember.create({ data: { channelId, userId } });
    }
  };
  await addMembers(hiltonChannel.id, [ceo.id, ops.id, supervisor.id, photo1.id, sales.id, reception.id, trainee.id]);
  await addMembers(aquaChannel.id, [ceo.id, ops.id, photo2.id]);
  await addMembers(photogChannel.id, [ceo.id, ops.id, photo1.id, photo2.id]);
  await addMembers(announceChannel.id, [ceo.id, ops.id, supervisor.id, photo1.id, photo2.id, sales.id, reception.id, trainee.id]);
  await addMembers(mgmtChannel.id, [ceo.id, ops.id, supervisor.id]);

  const msgs: Array<{ channelId: string; senderId: string | null; content: string; type?: "TEXT" | "SYSTEM" | "ALERT" | "AI_TIP" }> = [
    { channelId: hiltonChannel.id, senderId: ops.id, content: "All cameras synced for the morning shift." },
    { channelId: hiltonChannel.id, senderId: photo1.id, content: "Heading to room 214 now for the family booking." },
    { channelId: hiltonChannel.id, senderId: sales.id, content: "Just closed a €150 album sale at the kiosk 🎉" },
    { channelId: hiltonChannel.id, senderId: null, content: "⚠️ Conversion rate on today's galleries dropped 18% — review hook images.", type: "ALERT" },
    { channelId: aquaChannel.id, senderId: photo2.id, content: "Wristband station restocked, 40 left." },
    { channelId: aquaChannel.id, senderId: ops.id, content: "Slides reopen at 14:00, staff back in position." },
    { channelId: aquaChannel.id, senderId: null, content: "💡 AI Tip: Guests love burst shots on the main slide — try 6-frame bursts for auto-reels.", type: "AI_TIP" },
    { channelId: photogChannel.id, senderId: photo1.id, content: "Anyone have a spare SD card? Mine is full." },
    { channelId: photogChannel.id, senderId: photo2.id, content: "I've got one at AquaSplash, swing by after your shift." },
    { channelId: photogChannel.id, senderId: null, content: "💡 AI Tip: Golden hour today is 18:42 — schedule VIP sunset sessions now.", type: "AI_TIP" },
    { channelId: announceChannel.id, senderId: ceo.id, content: "Team, great work last weekend — water park hit a record €12,400." },
    { channelId: announceChannel.id, senderId: ceo.id, content: "Reminder: monthly payroll closes Friday." },
    { channelId: announceChannel.id, senderId: null, content: "📣 New pricing tier live: VIP Sunset Package €180.", type: "SYSTEM" },
    { channelId: mgmtChannel.id, senderId: ops.id, content: "Staff cost leaderboard attached — 3 photographers flagged for review." },
    { channelId: mgmtChannel.id, senderId: null, content: "⚠️ Cash drawer variance of €42 detected at Hilton kiosk.", type: "ALERT" },
  ];
  for (const m of msgs) {
    await prisma.chatMessage.create({
      data: { channelId: m.channelId, senderId: m.senderId, content: m.content, type: (m.type as any) ?? "TEXT" },
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

  // ── PRICING DEFAULTS ──────────────────────────
  const DEFAULT_PRICES = [
    { productKey: "single_photo", name: "Single Photo (digital)", price: 5 },
    { productKey: "ten_pack", name: "10-Photo Package", price: 39 },
    { productKey: "full_gallery", name: "Full Gallery (digital)", price: 49 },
    { productKey: "full_gallery_premium", name: "Full Gallery (premium)", price: 99 },
    { productKey: "print_4x6", name: "Printed 4x6", price: 3 },
    { productKey: "print_5x7", name: "Printed 5x7", price: 5 },
    { productKey: "print_8x10", name: "Printed 8x10", price: 10 },
    { productKey: "print_a4", name: "Printed A4", price: 15 },
    { productKey: "pass_basic", name: "Digital Pass Basic", price: 50 },
    { productKey: "pass_unlimited", name: "Digital Pass Unlimited", price: 100 },
    { productKey: "pass_vip", name: "Digital Pass VIP", price: 150 },
    { productKey: "magic_shot", name: "Magic Shot add-on", price: 5 },
    { productKey: "video_reel", name: "Video Reel add-on", price: 10 },
  ];
  for (const p of DEFAULT_PRICES) {
    const existing = await prisma.pricingConfig.findFirst({
      where: { productKey: p.productKey, locationId: null },
    });
    if (!existing) {
      await prisma.pricingConfig.create({ data: { ...p, locationId: null } });
    }
  }

  // ── DEFAULT CAMPAIGNS ─────────────────────────
  await prisma.campaign.createMany({
    data: [
      { type: "ABANDONED_CART_3D", name: "Abandoned cart — day 3", discountPct: 0.15, delayDays: 3, template: "Missing the sun? Get your memories now at 15% off." },
      { type: "SWEEP_UP_7D", name: "Partial-paid sweep — day 7", discountPct: 0.5, delayDays: 7, template: "Unlock the rest of your gallery for 50% off — last chance." },
    ],
  });

  // ── SAMPLE PRINT JOB ──────────────────────────
  const firstOrder = await prisma.order.findFirst();
  if (firstOrder) {
    const samplePhotos = await prisma.photo.findMany({ where: { galleryId: firstOrder.galleryId }, take: 3 });
    if (samplePhotos.length) {
      await prisma.printJob.create({
        data: {
          orderId: firstOrder.id,
          photoIds: samplePhotos.map((p) => p.id),
          printSize: "5x7",
          copies: 2,
        },
      });
    }
  }

  // ── CASH REGISTERS ────────────────────────────
  const cashDay = new Date();
  cashDay.setHours(0, 0, 0, 0);
  const reg1 = await prisma.cashRegister.create({
    data: {
      locationId: hotel.id,
      date: cashDay,
      openingBalance: 100,
      totalCashIn: 145,
      totalCashOut: 25,
      totalExpenses: 8,
      expectedBalance: 100 + 145 - 25 - 8,
      openedBy: supervisor.email,
      status: "OPEN",
    },
  });
  // 5 sample cash transactions
  await prisma.cashTransaction.createMany({
    data: [
      { cashRegisterId: reg1.id, type: "SALE", amount: 49, staffId: photo1.id, staffPin: "1111", customerName: "Guest 1", description: "Full gallery" },
      { cashRegisterId: reg1.id, type: "CHANGE_GIVEN", amount: -10, staffId: photo1.id, staffPin: "1111", customerName: "Guest 1", description: "Change for €60" },
      { cashRegisterId: reg1.id, type: "SALE", amount: 35, staffId: sales.id, staffPin: "3333", customerName: "Guest 2", description: "Social media pack" },
      { cashRegisterId: reg1.id, type: "SALE", amount: 49, staffId: photo1.id, staffPin: "1111", customerName: "Guest 3", description: "Full gallery" },
      { cashRegisterId: reg1.id, type: "CHANGE_GIVEN", amount: -15, staffId: photo1.id, staffPin: "1111", customerName: "Guest 3", description: "Change for €64" },
    ],
  });
  await prisma.cashHandover.create({
    data: {
      cashRegisterId: reg1.id,
      fromStaffId: photo1.id,
      toStaffId: supervisor.id,
      amount: 50,
      denomination: "2x€20, 1x€10",
      notes: "End of morning shift",
    },
  });
  await prisma.cashExpense.create({
    data: {
      cashRegisterId: reg1.id,
      amount: 8,
      reason: "Printer paper restock",
      staffId: supervisor.id,
      approvedBy: ops.email,
    },
  });
  // Second register — already closed and reconciled
  const reg2 = await prisma.cashRegister.create({
    data: {
      locationId: park.id,
      date: cashDay,
      openingBalance: 80,
      totalCashIn: 220,
      totalCashOut: 30,
      totalExpenses: 0,
      expectedBalance: 80 + 220 - 30,
      actualBalance: 270,
      discrepancy: 0,
      status: "RECONCILED",
      openedBy: photo2.email,
      closedBy: ops.email,
      closedAt: new Date(),
    },
  });

  // ── PRINT LAB + COUPONS + FULFILLMENT ──────────
  const lab = await prisma.printLabConfig.create({
    data: {
      name: "Local Lab Tunis",
      type: "LOCAL",
      isActive: true,
      isDefault: true,
      markupPercent: 60,
    },
  });
  await prisma.coupon.createMany({
    data: [
      { code: "WELCOME10", type: "PERCENTAGE", value: 10, isActive: true, maxUses: 100, usedCount: 12 },
      { code: "FREESHIP", type: "FREE_SHIPPING", value: 0, isActive: true, minOrder: 50 },
    ],
  });
  // Sample fulfillment for first order
  const sampleOrder = await prisma.order.findFirst();
  if (sampleOrder) {
    await prisma.fulfillmentOrder.create({
      data: {
        orderId: sampleOrder.id,
        printLabId: lab.id,
        status: "PENDING",
        shippingAddress: { name: "Guest 1", city: "Monastir", country: "TN" },
        items: [{ type: "print_5x7", qty: 2 }],
        costToUs: 6,
        chargedCustomer: 10,
        profit: 4,
      },
    });
  }

  // Sample gallery cover message
  await prisma.gallery.updateMany({
    where: { status: "PAID" },
    data: { coverMessage: "Thank you for visiting — enjoy your memories!" },
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
