import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import {
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

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: Request) {
  // Check secret to prevent unauthorized seeding
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get("secret");
  if (secret !== process.env.NEXTAUTH_SECRET && secret !== "fotiqo-seed-2026") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check if already seeded
  const existingUsers = await prisma.user.count();
  if (existingUsers > 0) {
    return NextResponse.json({ message: "Already seeded", userCount: existingUsers });
  }

  try {
    // ── ORG + LOCATIONS ───────────────────────────
    const org = await prisma.organization.create({
      data: { name: "Fotiqo Tunisia", type: OrgType.HEADQUARTERS },
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

    const ceo = await mkUser("Admin CEO", "admin@fotiqo.local", StaffRole.CEO, undefined, 5000);
    const ops = await mkUser("Omar Operations", "ops@fotiqo.local", StaffRole.OPERATIONS_MANAGER, hotel.id, 3500);
    const supervisor = await mkUser("Sofia Supervisor", "super@fotiqo.local", StaffRole.SUPERVISOR, hotel.id, 2200);
    const photo1 = await mkUser("Yassine Ben", "photo1@fotiqo.local", StaffRole.PHOTOGRAPHER, hotel.id, 1500);
    const photo2 = await mkUser("Karim Hamdi", "photo2@fotiqo.local", StaffRole.PHOTOGRAPHER, park.id, 1500);
    const sales = await mkUser("Sami Sales", "sales@fotiqo.local", StaffRole.SALES_STAFF, hotel.id, 1300);
    const reception = await mkUser("Rana Reception", "reception@fotiqo.local", StaffRole.RECEPTIONIST, hotel.id, 1100);
    const trainee = await mkUser("Taha Trainee", "trainee@fotiqo.local", StaffRole.ACADEMY_TRAINEE, hotel.id, 600);

    // PINs
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

    // ── APPOINTMENTS ──────────────────────────────
    const apptStatuses = [
      AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED,
      AppointmentStatus.CONFIRMED, AppointmentStatus.COMPLETED, AppointmentStatus.COMPLETED,
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
      const isAuto = i >= 7;
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
            create: [{ type: amount >= 99 ? OrderItemType.FULL_GALLERY : OrderItemType.SINGLE_PHOTO, unitPrice: amount, quantity: 1 }],
          },
        },
      });
      orderRows.push({ id: order.id, photographerId: g.photographerId, amount, isAuto });
    }

    // ── COMMISSIONS ──────────────────────────────
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

    // ── SHIFTS ───────────────────────────────────
    const today = new Date();
    const monday = new Date(today);
    monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
    for (const ph of photographers) {
      for (let d = 0; d < 5; d++) {
        const day = new Date(monday);
        day.setDate(monday.getDate() + d);
        const start = new Date(day); start.setHours(9, 0, 0, 0);
        const end = new Date(day); end.setHours(17, 0, 0, 0);
        await prisma.shift.create({
          data: { userId: ph.id, date: day, startTime: start, endTime: end, locationId: ph.locationId! },
        });
      }
    }

    // ── EQUIPMENT ────────────────────────────────
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

    // ── QR CODES ────────────────────────────────
    await prisma.qRCode.create({ data: { code: "QR-ROOM-214", type: QRCodeType.HOTEL_ROOM, locationId: hotel.id, scanCount: 12 } });
    await prisma.qRCode.create({ data: { code: "QR-WRIST-AQUA-001", type: QRCodeType.WRISTBAND, locationId: park.id, scanCount: 47 } });

    // ── CHAT CHANNELS ───────────────────────────
    const hiltonChannel = await prisma.chatChannel.create({
      data: { name: "Hilton Team", type: "LOCATION", description: "Hilton Monastir on-site team", locationId: hotel.id, isSystem: true },
    });
    const announceChannel = await prisma.chatChannel.create({
      data: { name: "Announcements", type: "ANNOUNCEMENT", description: "Company-wide announcements", isSystem: true },
    });
    const addMembers = async (channelId: string, userIds: string[]) => {
      for (const userId of userIds) {
        await prisma.chatMember.create({ data: { channelId, userId } });
      }
    };
    await addMembers(hiltonChannel.id, [ceo.id, ops.id, supervisor.id, photo1.id, sales.id, reception.id]);
    await addMembers(announceChannel.id, [ceo.id, ops.id, supervisor.id, photo1.id, photo2.id, sales.id, reception.id, trainee.id]);

    // ── BLOG POSTS ──────────────────────────────
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

    // ── PRICING DEFAULTS ────────────────────────
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
      { productKey: "auto_reel", name: "Auto-Reel highlight clip", price: 20 },
    ];
    for (const p of DEFAULT_PRICES) {
      await prisma.pricingConfig.create({ data: { ...p, locationId: null } });
    }

    // ── CAMPAIGNS ───────────────────────────────
    await prisma.campaign.createMany({
      data: [
        { type: "ABANDONED_CART_3D", name: "Abandoned cart — day 3", discountPct: 0.15, delayDays: 3, template: "Missing the sun? Get your memories now at 15% off." },
        { type: "SWEEP_UP_7D", name: "Partial-paid sweep — day 7", discountPct: 0.5, delayDays: 7, template: "Unlock the rest of your gallery for 50% off." },
      ],
    });

    // ── MAGIC ELEMENTS ──────────────────────────
    await prisma.magicElement.createMany({
      data: [
        { name: "Pirate Parrot", type: MagicElementType.THREE_D_CHARACTER, assetUrl: "https://example.com/assets/pirate-parrot.glb", category: "Animals" },
        { name: "Fennec Fox", type: MagicElementType.THREE_D_CHARACTER, assetUrl: "https://example.com/assets/fennec-fox.glb", category: "Local Culture" },
      ],
    });

    // ── ACADEMY ─────────────────────────────────
    await prisma.academyModule.create({
      data: {
        title: "Fotiqo Onboarding",
        description: "Welcome to the studio. Learn the kiosk flow, camera handoff, and customer experience standards.",
        type: AcademyModuleType.ONBOARDING,
        sortOrder: 1,
        isRequired: true,
      },
    });

    // ── CASH REGISTER ───────────────────────────
    const cashDay = new Date();
    cashDay.setHours(0, 0, 0, 0);
    await prisma.cashRegister.create({
      data: {
        locationId: hotel.id,
        date: cashDay,
        openingBalance: 100,
        totalCashIn: 145,
        totalCashOut: 25,
        totalExpenses: 8,
        expectedBalance: 212,
        openedBy: supervisor.email,
        status: "OPEN",
      },
    });

    // ── PRINT LAB + COUPONS ─────────────────────
    await prisma.printLabConfig.create({
      data: { name: "Local Lab Tunis", type: "LOCAL", isActive: true, isDefault: true, markupPercent: 60 },
    });
    await prisma.coupon.createMany({
      data: [
        { code: "WELCOME10", type: "PERCENTAGE", value: 10, isActive: true, maxUses: 100, usedCount: 12 },
        { code: "FREESHIP", type: "FREE_SHIPPING", value: 0, isActive: true, minOrder: 50 },
      ],
    });

    // Gallery cover message
    await prisma.gallery.updateMany({
      where: { status: "PAID" },
      data: { coverMessage: "Thank you for visiting — enjoy your memories!" },
    });

    // ── B2B DELIVERY ────────────────────────────
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

    // Get a gallery token for testing
    const sampleGallery = await prisma.gallery.findFirst({ where: { status: "PAID" } });

    return NextResponse.json({
      success: true,
      message: "Database seeded successfully",
      data: {
        org: org.id,
        locations: { hotel: hotel.id, park: park.id },
        users: 8,
        customers: 5,
        galleries: 10,
        photos: 50,
        orders: 10,
        commissions: 15,
        sampleGalleryToken: sampleGallery?.magicLinkToken,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// GET returns seed status
export async function GET() {
  const counts = {
    users: await prisma.user.count(),
    galleries: await prisma.gallery.count(),
    photos: await prisma.photo.count(),
    orders: await prisma.order.count(),
    customers: await prisma.customer.count(),
  };
  return NextResponse.json({ seeded: counts.users > 0, counts });
}

/**
 * PATCH — Upgrade ALL galleries to have 15 photos + a VideoReel
 * so the AI Auto-Book banner and reel player are visible on every gallery type.
 *
 * Usage: PATCH /api/seed?secret=fotiqo-seed-2026
 */
export async function PATCH(req: Request) {
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get("secret");
  if (secret !== process.env.NEXTAUTH_SECRET && secret !== "fotiqo-seed-2026") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const galleries = await prisma.gallery.findMany({
    include: { photos: true },
    orderBy: { createdAt: "asc" },
  });

  if (!galleries.length) {
    return NextResponse.json({ error: "No galleries found" }, { status: 404 });
  }

  const demoSeeds = [
    "beach-sunset", "mountain-lake", "palm-trees", "ocean-waves", "waterfall",
    "coral-reef", "tropical-fish", "resort-pool", "hammock-beach", "starfish",
    "snorkeling", "jet-ski", "parasailing", "family-beach", "sunset-dinner",
    "lighthouse", "sailboat", "diving", "kayaking", "campfire",
  ];

  // Build a self-contained HTML slideshow for the reel preview
  function buildReelPreviewHtml(photoUrls: string[], track: string): string {
    const n = photoUrls.length;
    const secPerPhoto = 3;
    const total = n * secPerPhoto;
    const slides = photoUrls.map((url, i) =>
      `<div class="s" style="background-image:url('${url}');animation-delay:${i * secPerPhoto}s"></div>`
    ).join("");
    return `<!doctype html><html><head><meta charset="utf-8"><title>Fotiqo Reel</title>
<style>
:root{color-scheme:dark}html,body{margin:0;padding:0;height:100%;background:#0C2E3D;overflow:hidden}
.st{position:fixed;inset:0}
.s{position:absolute;inset:0;background-size:cover;background-position:center;opacity:0;transform:scale(1);animation:kb ${total}s linear infinite}
@keyframes kb{0%{opacity:0;transform:scale(1.05)}${(secPerPhoto*0.15/total*100).toFixed(1)}%{opacity:1;transform:scale(1.08)}${(secPerPhoto*0.85/total*100).toFixed(1)}%{opacity:1;transform:scale(1.18)}${(secPerPhoto/total*100).toFixed(1)}%{opacity:0;transform:scale(1.2)}100%{opacity:0;transform:scale(1)}}
.br{position:fixed;right:24px;top:20px;z-index:5;color:#0EA5A5;font-family:Georgia,serif;font-size:18px;font-weight:600;text-shadow:0 2px 8px rgba(0,0,0,.6)}
.lb{position:fixed;left:24px;bottom:20px;z-index:5;color:white;font-family:Georgia,serif;font-size:14px;letter-spacing:1px;text-shadow:0 2px 8px rgba(0,0,0,.6);opacity:.85}
</style></head><body>
<div class="st">${slides}</div>
<div class="br">Fotiqo</div>
<div class="lb">Auto-Reel · ${track} · ${n} moments</div>
</body></html>`;
  }

  const results: { token: string; status: string; photos: number; reel: boolean }[] = [];

  for (const gallery of galleries) {
    const existing = gallery.photos.length;
    const needed = Math.max(0, 15 - existing);
    const isPaid = gallery.status === "PAID" || gallery.status === "DIGITAL_PASS" || gallery.status === "PARTIAL_PAID";
    const allPhotoUrls: string[] = gallery.photos.map((p) => p.s3Key_highRes);
    const allPhotoIds: string[] = gallery.photos.map((p) => p.id);

    if (needed > 0) {
      for (let i = 0; i < needed; i++) {
        const seed = demoSeeds[(existing + i) % demoSeeds.length];
        const url = `https://picsum.photos/seed/${seed}${gallery.id.slice(-4)}${i}/1200/800`;
        const photo = await prisma.photo.create({
          data: {
            galleryId: gallery.id,
            s3Key_highRes: url,
            cloudinaryId: null,
            isHookImage: false,
            isFavorited: i % 4 === 0,
            isPurchased: isPaid,
            sortOrder: existing + i,
          },
        });
        allPhotoIds.push(photo.id);
        allPhotoUrls.push(url);
      }

      await prisma.gallery.update({
        where: { id: gallery.id },
        data: { totalCount: existing + needed },
      });
    }

    // Build reel preview HTML from photo URLs
    const reelUrls = allPhotoUrls.slice(0, 10).filter(Boolean);
    const track = gallery.status === "PAID" ? "upbeat" : "romantic";
    const previewHtml = buildReelPreviewHtml(reelUrls, track);

    // Create or update VideoReel with previewHtml
    const existingReel = await prisma.videoReel.findFirst({ where: { galleryId: gallery.id } });
    if (existingReel) {
      // Update existing reel to add previewHtml if missing
      if (!existingReel.previewHtml) {
        await prisma.videoReel.update({
          where: { id: existingReel.id },
          data: { previewHtml },
        });
      }
    } else {
      await prisma.videoReel.create({
        data: {
          galleryId: gallery.id,
          photoIds: JSON.stringify(allPhotoIds.slice(0, 10)),
          musicTrack: track,
          duration: 15,
          status: "READY",
          thumbnailUrl: `https://picsum.photos/seed/reel-${gallery.id.slice(-6)}/640/360`,
          previewHtml,
        },
      });
    }

    results.push({
      token: gallery.magicLinkToken,
      status: gallery.status,
      photos: existing + needed,
      reel: true,
    });
  }

  return NextResponse.json({
    success: true,
    upgraded: results.length,
    galleries: results,
  });
}
