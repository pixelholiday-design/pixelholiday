/**
 * IDEMPOTENT production seed for Fotiqo.
 *
 * Uses upsert everywhere — safe to run multiple times.
 * Seeds: org, 5 locations, 8 users, 5 customers, 10 galleries,
 * 50 photos, pricing, chat, magic elements, campaigns, academy, etc.
 *
 * Usage: npx tsx prisma/seed-production.ts
 */

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
  console.log("🌱 Seeding Fotiqo (production-safe, idempotent)...");

  const passwordHash = await bcrypt.hash("password123", 10);

  // ── 1. ORGANIZATION ───────────────────────────────────────────────────────
  const org = await prisma.organization.upsert({
    where: { id: "org_fotiqo_hq" },
    update: { name: "Fotiqo Tunisia" },
    create: { id: "org_fotiqo_hq", name: "Fotiqo Tunisia", type: OrgType.HEADQUARTERS },
  });
  console.log("  ✓ Organization");

  // ── 2. LOCATIONS (5) ──────────────────────────────────────────────────────
  const locationData = [
    { id: "loc_hilton", name: "Hilton Monastir", type: LocationType.HOTEL, address: "Route de la Corniche, Monastir 5000, Tunisia", rentCost: 2500, defaultLocale: "fr", country: "Tunisia", city: "Monastir", locationType: "LUXURY" },
    { id: "loc_aquasplash", name: "AquaSplash Water Park", type: LocationType.WATER_PARK, address: "Zone Touristique Yasmine, Hammamet, Tunisia", rentCost: 1800, defaultLocale: "fr", country: "Tunisia", city: "Hammamet", locationType: "SPLASH" },
    { id: "loc_carthageland", name: "Carthage Land", type: LocationType.ATTRACTION, address: "Yasmine Hammamet, Tunisia", rentCost: 2000, defaultLocale: "fr", country: "Tunisia", city: "Hammamet", locationType: "ATTRACTION" },
    { id: "loc_royal", name: "Royal Hammamet", type: LocationType.HOTEL, address: "Avenue de la Paix, Hammamet, Tunisia", rentCost: 2800, defaultLocale: "fr", country: "Tunisia", city: "Hammamet", locationType: "LUXURY" },
    { id: "loc_sahara", name: "Sahara Adventure Park", type: LocationType.ATTRACTION, address: "Route de Tozeur, Douz, Tunisia", rentCost: 1500, defaultLocale: "ar", country: "Tunisia", city: "Douz", locationType: "ATTRACTION" },
  ];
  const locations: Record<string, any> = {};
  for (const loc of locationData) {
    locations[loc.id] = await prisma.location.upsert({
      where: { id: loc.id },
      update: { name: loc.name, address: loc.address, rentCost: loc.rentCost, defaultLocale: loc.defaultLocale, country: loc.country, city: loc.city, locationType: loc.locationType },
      create: { ...loc, orgId: org.id },
    });
  }
  console.log("  ✓ 5 Locations");

  // ── 3. USERS (8) ─────────────────────────────────────────────────────────
  const userData = [
    { id: "usr_ceo", name: "Admin CEO", email: "admin@fotiqo.local", role: StaffRole.CEO, locationId: undefined as string | undefined, salary: 5000, pin: null as string | null },
    { id: "usr_ops", name: "Omar Operations", email: "ops@fotiqo.local", role: StaffRole.OPERATIONS_MANAGER, locationId: "loc_hilton", salary: 3500, pin: null },
    { id: "usr_super", name: "Sofia Supervisor", email: "super@fotiqo.local", role: StaffRole.SUPERVISOR, locationId: "loc_hilton", salary: 2200, pin: "4444" },
    { id: "usr_photo1", name: "Yassine Ben", email: "photo1@fotiqo.local", role: StaffRole.PHOTOGRAPHER, locationId: "loc_hilton", salary: 1500, pin: "1111" },
    { id: "usr_photo2", name: "Karim Hamdi", email: "photo2@fotiqo.local", role: StaffRole.PHOTOGRAPHER, locationId: "loc_aquasplash", salary: 1500, pin: "2222" },
    { id: "usr_sales", name: "Sami Sales", email: "sales@fotiqo.local", role: StaffRole.SALES_STAFF, locationId: "loc_hilton", salary: 1300, pin: "3333" },
    { id: "usr_recep", name: "Rana Reception", email: "reception@fotiqo.local", role: StaffRole.RECEPTIONIST, locationId: "loc_hilton", salary: 1100, pin: null },
    { id: "usr_trainee", name: "Taha Trainee", email: "trainee@fotiqo.local", role: StaffRole.ACADEMY_TRAINEE, locationId: "loc_hilton", salary: 600, pin: null },
  ];
  const users: Record<string, any> = {};
  for (const u of userData) {
    users[u.id] = await prisma.user.upsert({
      where: { email: u.email },
      update: { name: u.name, role: u.role, salary: u.salary, pin: u.pin, locationId: u.locationId },
      create: { id: u.id, name: u.name, email: u.email, password: passwordHash, role: u.role, orgId: org.id, locationId: u.locationId, salary: u.salary, pin: u.pin, rating: 4 + Math.random() },
    });
  }
  console.log("  ✓ 8 Users");

  // ── 4. CUSTOMERS (5) ─────────────────────────────────────────────────────
  const customerData = [
    { id: "cust_1", name: "Marie Dupont", email: "marie@example.com", whatsapp: "+33612345678", roomNumber: "214", locationId: "loc_hilton" },
    { id: "cust_2", name: "Hans Mueller", email: "hans@example.com", whatsapp: "+491511234567", roomNumber: "308", locationId: "loc_aquasplash" },
    { id: "cust_3", name: "John Smith", email: "john@example.com", whatsapp: "+447911123456", roomNumber: "105", locationId: "loc_hilton" },
    { id: "cust_4", name: "Anna Rossi", email: "anna@example.com", whatsapp: "+393471234567", roomNumber: "412", locationId: "loc_royal" },
    { id: "cust_5", name: "Ahmed Ben Ali", email: "ahmed@example.com", whatsapp: "+21622123456", roomNumber: "201", locationId: "loc_sahara" },
  ];
  const customers: Record<string, any> = {};
  for (const c of customerData) {
    customers[c.id] = await prisma.customer.upsert({
      where: { id: c.id },
      update: { name: c.name, email: c.email, whatsapp: c.whatsapp, roomNumber: c.roomNumber },
      create: { ...c },
    });
  }
  console.log("  ✓ 5 Customers");

  // ── 5. GALLERIES (10) + PHOTOS (50) ───────────────────────────────────────
  const galleryStatuses: GalleryStatus[] = [
    "HOOK_ONLY", "PREVIEW_ECOM", "PAID", "PARTIAL_PAID", "DIGITAL_PASS",
    "HOOK_ONLY", "PREVIEW_ECOM", "PREVIEW_ECOM", "PAID", "HOOK_ONLY",
  ];
  const demoUrl = (i: number) => `https://picsum.photos/seed/fotiqo${i}/1200/800`;
  const galleryIds: string[] = [];

  for (let g = 0; g < 10; g++) {
    const gId = `gal_prod_${g}`;
    const photoIds = [`usr_photo1`, `usr_photo2`];
    const custIds = Object.keys(customers);
    const locIds = Object.keys(locations);

    const gallery = await prisma.gallery.upsert({
      where: { id: gId },
      update: { status: galleryStatuses[g] },
      create: {
        id: gId,
        status: galleryStatuses[g],
        locationId: locIds[g % locIds.length],
        photographerId: users[photoIds[g % 2]].id,
        customerId: customers[custIds[g % custIds.length]].id,
        roomNumber: customerData[g % customerData.length].roomNumber,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        totalCount: 5,
        partialPurchase: galleryStatuses[g] === "PARTIAL_PAID",
        purchasedCount: galleryStatuses[g] === "PARTIAL_PAID" ? 2 : galleryStatuses[g] === "PAID" ? 5 : 0,
        coverMessage: galleryStatuses[g] === "PAID" ? "Thank you for visiting — enjoy your memories!" : null,
      },
    });
    galleryIds.push(gId);

    // 5 photos per gallery
    for (let p = 0; p < 5; p++) {
      const pId = `photo_prod_${g}_${p}`;
      const idx = g * 5 + p;
      await prisma.photo.upsert({
        where: { id: pId },
        update: {},
        create: {
          id: pId,
          galleryId: gId,
          s3Key_highRes: demoUrl(idx),
          cloudinaryId: null,
          isHookImage: p === 0,
          sortOrder: p,
          isPurchased: galleryStatuses[g] === "PAID" || (galleryStatuses[g] === "PARTIAL_PAID" && p < 2),
        },
      });
    }
  }
  console.log("  ✓ 10 Galleries, 50 Photos");

  // ── 6. PRICING DEFAULTS ───────────────────────────────────────────────────
  const prices = [
    { productKey: "single_photo", name: "Single Photo (digital)", price: 5 },
    { productKey: "ten_pack", name: "10-Photo Package", price: 39 },
    { productKey: "full_gallery", name: "Full Gallery (digital)", price: 49 },
    { productKey: "full_gallery_premium", name: "Full Gallery (premium)", price: 99 },
    { productKey: "print_4x6", name: "Printed 4×6", price: 3 },
    { productKey: "print_5x7", name: "Printed 5×7", price: 5 },
    { productKey: "print_8x10", name: "Printed 8×10", price: 10 },
    { productKey: "print_a4", name: "Printed A4", price: 15 },
    { productKey: "canvas_30x40", name: "Canvas 30×40cm", price: 45 },
    { productKey: "pass_basic", name: "Digital Pass Basic", price: 50 },
    { productKey: "pass_unlimited", name: "Digital Pass Unlimited", price: 100 },
    { productKey: "pass_vip", name: "Digital Pass VIP", price: 150 },
    { productKey: "magic_shot", name: "Magic Shot add-on", price: 5 },
    { productKey: "video_reel", name: "Video Reel add-on", price: 10 },
    { productKey: "auto_reel", name: "Auto-Reel highlight clip", price: 20 },
    { productKey: "retouch_credit", name: "Pro Retouch credit", price: 3 },
    { productKey: "social_media_pack", name: "Social Media Package", price: 35 },
    { productKey: "printed_album", name: "Printed Luxury Album", price: 150 },
  ];
  for (const p of prices) {
    const existing = await prisma.pricingConfig.findFirst({
      where: { productKey: p.productKey, locationId: null },
    });
    if (!existing) {
      await prisma.pricingConfig.create({ data: { ...p, locationId: null } });
    }
  }
  console.log("  ✓ 18 Pricing configs");

  // ── 7. CAMPAIGNS ──────────────────────────────────────────────────────────
  const campaigns = [
    { type: "ABANDONED_CART_3D", name: "Abandoned cart — day 3", discountPct: 0.15, delayDays: 3, template: "Missing the sun? Get your memories now at 15% off." },
    { type: "SWEEP_UP_7D", name: "Partial-paid sweep — day 7", discountPct: 0.5, delayDays: 7, template: "Unlock the rest of your gallery for 50% off — last chance." },
  ];
  for (const c of campaigns) {
    const existing = await prisma.campaign.findFirst({ where: { type: c.type } });
    if (!existing) await prisma.campaign.create({ data: c });
  }
  console.log("  ✓ Campaigns");

  // ── 8. MAGIC ELEMENTS (10) ────────────────────────────────────────────────
  const magicElements = [
    { name: "Pirate Parrot", type: MagicElementType.THREE_D_CHARACTER, assetUrl: "https://example.com/assets/pirate-parrot.glb", category: "Animals", position: "CENTER" },
    { name: "Fennec Fox", type: MagicElementType.THREE_D_CHARACTER, assetUrl: "https://example.com/assets/fennec-fox.glb", category: "Local Culture", position: "CENTER" },
    { name: "Dragon Wings", type: MagicElementType.AR_OVERLAY, assetUrl: "https://example.com/assets/dragon-wings.png", category: "Fantasy", position: "TOP" },
    { name: "Pirate Ship", type: MagicElementType.BACKGROUND_REPLACE, assetUrl: "https://example.com/assets/pirate-ship.jpg", category: "Adventure", position: "BORDER" },
    { name: "Tropical Frame", type: MagicElementType.GRAPHIC_OVERLAY, assetUrl: "https://example.com/assets/tropical-frame.png", category: "Frames", position: "BORDER" },
    { name: "Butterfly Crown", type: MagicElementType.AR_OVERLAY, assetUrl: "https://example.com/assets/butterfly-crown.png", category: "Animals", position: "FACE" },
    { name: "Tunisia Stars", type: MagicElementType.GRAPHIC_OVERLAY, assetUrl: "https://example.com/assets/tunisia-stars.png", category: "Local Culture", position: "SCATTER" },
    { name: "Underwater Bubbles", type: MagicElementType.AR_OVERLAY, assetUrl: "https://example.com/assets/bubbles.png", category: "Water", position: "SCATTER" },
    { name: "Sunset Beach", type: MagicElementType.BACKGROUND_REPLACE, assetUrl: "https://example.com/assets/sunset-beach.jpg", category: "Scenery", position: "BORDER" },
    { name: "Camel Companion", type: MagicElementType.THREE_D_CHARACTER, assetUrl: "https://example.com/assets/camel.glb", category: "Local Culture", position: "CENTER" },
  ];
  for (const me of magicElements) {
    const existing = await prisma.magicElement.findFirst({ where: { name: me.name } });
    if (!existing) await prisma.magicElement.create({ data: me });
  }
  console.log("  ✓ 10 Magic Elements");

  // ── 9. CHAT CHANNELS ──────────────────────────────────────────────────────
  const channels = [
    { name: "Hilton Team", type: "LOCATION", description: "Hilton Monastir on-site team", locationId: "loc_hilton", isSystem: true },
    { name: "AquaSplash Team", type: "LOCATION", description: "AquaSplash Water Park crew", locationId: "loc_aquasplash", isSystem: true },
    { name: "All Photographers", type: "ROLE", description: "Cross-site photographer chat", role: "PHOTOGRAPHER", isSystem: true },
    { name: "Announcements", type: "ANNOUNCEMENT", description: "Company-wide announcements", isSystem: true },
    { name: "Management", type: "ROLE", description: "CEO, Ops, and Supervisors", role: "MANAGEMENT", isSystem: true },
  ];
  for (const ch of channels) {
    const existing = await prisma.chatChannel.findFirst({ where: { name: ch.name } });
    if (!existing) {
      await prisma.chatChannel.create({ data: ch as any });
    }
  }
  console.log("  ✓ 5 Chat Channels");

  // ── 10. ACADEMY MODULE ────────────────────────────────────────────────────
  const academyExists = await prisma.academyModule.findFirst({ where: { title: "Fotiqo Onboarding" } });
  if (!academyExists) {
    await prisma.academyModule.create({
      data: {
        title: "Fotiqo Onboarding",
        description: "Welcome to the studio. Learn the kiosk flow, camera handoff, and customer experience standards.",
        type: AcademyModuleType.ONBOARDING,
        sortOrder: 1,
        isRequired: true,
      },
    });
  }
  console.log("  ✓ Academy Module");

  // ── 11. COUPONS ───────────────────────────────────────────────────────────
  const coupons = [
    { code: "WELCOME10", type: "PERCENTAGE", value: 10, isActive: true, maxUses: 100, usedCount: 0 },
    { code: "FREESHIP", type: "FREE_SHIPPING", value: 0, isActive: true, minOrder: 50 },
  ];
  for (const c of coupons) {
    const existing = await prisma.coupon.findFirst({ where: { code: c.code } });
    if (!existing) await prisma.coupon.create({ data: c as any });
  }
  console.log("  ✓ Coupons");

  // ── 12. QR CODES ──────────────────────────────────────────────────────────
  const qrCodes = [
    { code: "QR-ROOM-214", type: QRCodeType.HOTEL_ROOM, locationId: "loc_hilton" },
    { code: "QR-WRIST-AQUA-001", type: QRCodeType.WRISTBAND, locationId: "loc_aquasplash" },
    { code: "QR-LOBBY-ROYAL", type: QRCodeType.LOBBY_SIGN, locationId: "loc_royal" },
    { code: "QR-WELCOME-SAHARA", type: QRCodeType.WELCOME_ARCHWAY, locationId: "loc_sahara" },
  ];
  for (const qr of qrCodes) {
    const existing = await prisma.qRCode.findFirst({ where: { code: qr.code } });
    if (!existing) await prisma.qRCode.create({ data: qr });
  }
  console.log("  ✓ QR Codes");

  console.log("\n✅ Production seed complete!");
  console.log("   1 organization, 5 locations, 8 users, 5 customers");
  console.log("   10 galleries, 50 photos, 18 pricing configs");
  console.log("   10 magic elements, 5 chat channels, 4 QR codes");
  console.log("   2 campaigns, 2 coupons, 1 academy module");
  console.log("\n   All users: password = password123");
  console.log("   Admin login: admin@fotiqo.local / password123");
}

main()
  .catch((e) => { console.error("❌ Seed failed:", e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
