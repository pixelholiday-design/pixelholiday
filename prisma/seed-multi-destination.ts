import { PrismaClient, LocationType } from "@prisma/client";

const prisma = new PrismaClient();

type LocationSeed = {
  name: string;
  type: LocationType;
  address: string;
  country: string;
  city: string;
  timezone: string;
  currency: string;
  taxRate: number;
  rentAmount: number;
  rentType: string;
  locationType: string;
  targetAOV: number;
  scheduleType: string;
  morningStart?: string;
  morningEnd?: string;
  eveningStart?: string;
  eveningEnd?: string;
  rotationHours?: number;
  commissionType: string;
  commissionRate: number;
  tier1Threshold?: number;
  tier1Rate?: number;
  tier2Threshold?: number;
  tier2Rate?: number;
  tier3Rate?: number;
  supervisorOverride?: number;
  partnerName?: string;
  roomCount?: number;
  occupancyRate?: number;
};

const LOCATIONS: LocationSeed[] = [
  {
    name: "Hilton Monastir",
    type: LocationType.HOTEL,
    address: "Monastir, Tunisia",
    country: "Tunisia",
    city: "Monastir",
    timezone: "Africa/Tunis",
    currency: "EUR",
    taxRate: 0.19,
    rentAmount: 2000,
    rentType: "FIXED",
    locationType: "LUXURY",
    targetAOV: 65,
    scheduleType: "SIESTA",
    morningStart: "10:00",
    morningEnd: "13:00",
    eveningStart: "17:00",
    eveningEnd: "23:00",
    commissionType: "FLAT",
    commissionRate: 0.10,
    partnerName: "Hilton Hotels",
    roomCount: 280,
    occupancyRate: 0.78,
  },
  {
    name: "AquaSplash Water Park",
    type: LocationType.WATER_PARK,
    address: "Hammamet, Tunisia",
    country: "Tunisia",
    city: "Hammamet",
    timezone: "Africa/Tunis",
    currency: "EUR",
    taxRate: 0.19,
    rentAmount: 1500,
    rentType: "FIXED",
    locationType: "SPLASH",
    targetAOV: 40,
    scheduleType: "ROTATION",
    rotationHours: 4,
    commissionType: "TIERED",
    commissionRate: 0.07,
    tier1Threshold: 1000,
    tier1Rate: 0.03,
    tier2Threshold: 2500,
    tier2Rate: 0.07,
    tier3Rate: 0.12,
    supervisorOverride: 0.02,
  },
  {
    name: "Friguia Park",
    type: LocationType.ATTRACTION,
    address: "Bouficha, Tunisia",
    country: "Tunisia",
    city: "Bouficha",
    timezone: "Africa/Tunis",
    currency: "EUR",
    taxRate: 0.19,
    rentAmount: 1200,
    rentType: "FIXED",
    locationType: "ATTRACTION",
    targetAOV: 25,
    scheduleType: "FULL_DAY",
    morningStart: "09:00",
    morningEnd: "17:00",
    commissionType: "FLAT",
    commissionRate: 0.08,
  },
  {
    name: "Norida Beach Resort",
    type: LocationType.HOTEL,
    address: "Rhodes, Greece",
    country: "Greece",
    city: "Rhodes",
    timezone: "Europe/Athens",
    currency: "EUR",
    taxRate: 0.24,
    rentAmount: 3000,
    rentType: "FIXED",
    locationType: "LUXURY",
    targetAOV: 80,
    scheduleType: "SIESTA",
    morningStart: "10:00",
    morningEnd: "13:00",
    eveningStart: "17:00",
    eveningEnd: "23:00",
    commissionType: "FLAT",
    commissionRate: 0.10,
    partnerName: "Norida Group",
  },
  {
    name: "Aqua Fun Park",
    type: LocationType.WATER_PARK,
    address: "Crete, Greece",
    country: "Greece",
    city: "Crete",
    timezone: "Europe/Athens",
    currency: "EUR",
    taxRate: 0.24,
    rentAmount: 2000,
    rentType: "FIXED",
    locationType: "SPLASH",
    targetAOV: 35,
    scheduleType: "ROTATION",
    rotationHours: 4,
    commissionType: "TIERED",
    commissionRate: 0.07,
    tier1Threshold: 1000,
    tier1Rate: 0.03,
    tier2Threshold: 2500,
    tier2Rate: 0.07,
    tier3Rate: 0.12,
  },
];

// Pricing matrix: [Hilton, AquaSplash, Friguia, Norida, AquaFun]
const PRICING: Record<string, [number, number, number, number, number]> = {
  single_photo: [20, 5, 8, 25, 6],
  three_photos: [50, 15, 20, 60, 18],
  full_gallery: [130, 45, 55, 150, 50],
  pass_basic: [100, 49, 40, 120, 55],
  pass_vip: [199, 69, 60, 230, 75],
  print_4x6: [15, 8, 10, 18, 9],
  print_8x10: [25, 15, 18, 30, 16],
  canvas_30x40: [80, 50, 55, 95, 55],
};

const PRODUCT_NAMES: Record<string, string> = {
  single_photo: "Single Photo",
  three_photos: "3-Photo Package",
  full_gallery: "Full Gallery",
  pass_basic: "Digital Pass Basic",
  pass_vip: "Digital Pass VIP",
  print_4x6: "Printed 4x6",
  print_8x10: "Printed 8x10",
  canvas_30x40: "Canvas 30x40",
  waterproof_usb: "Waterproof USB",
};

async function main() {
  // Find or create an org. Prefer an HQ that already exists.
  let org = await prisma.organization.findFirst({ where: { type: "HEADQUARTERS" } });
  if (!org) {
    org = await prisma.organization.findFirst();
  }
  if (!org) {
    org = await prisma.organization.create({
      data: { name: "Fotiqo HQ", type: "HEADQUARTERS" },
    });
    console.log("Created HQ org:", org.id);
  } else {
    console.log("Using existing org:", org.name, org.id);
  }

  const createdLocations: Record<string, string> = {};

  for (const loc of LOCATIONS) {
    const existing = await prisma.location.findFirst({ where: { name: loc.name } });
    const data = {
      name: loc.name,
      type: loc.type,
      orgId: org.id,
      address: loc.address,
      country: loc.country,
      city: loc.city,
      timezone: loc.timezone,
      currency: loc.currency,
      taxRate: loc.taxRate,
      rentAmount: loc.rentAmount,
      rentType: loc.rentType,
      locationType: loc.locationType,
      targetAOV: loc.targetAOV,
      scheduleType: loc.scheduleType,
      morningStart: loc.morningStart ?? null,
      morningEnd: loc.morningEnd ?? null,
      eveningStart: loc.eveningStart ?? null,
      eveningEnd: loc.eveningEnd ?? null,
      rotationHours: loc.rotationHours ?? null,
      commissionType: loc.commissionType,
      commissionRate: loc.commissionRate,
      tier1Threshold: loc.tier1Threshold ?? null,
      tier1Rate: loc.tier1Rate ?? null,
      tier2Threshold: loc.tier2Threshold ?? null,
      tier2Rate: loc.tier2Rate ?? null,
      tier3Rate: loc.tier3Rate ?? null,
      supervisorOverride: loc.supervisorOverride ?? null,
      partnerName: loc.partnerName ?? null,
      roomCount: loc.roomCount ?? null,
      occupancyRate: loc.occupancyRate ?? null,
      isActive: true,
    };
    const row = existing
      ? await prisma.location.update({ where: { id: existing.id }, data })
      : await prisma.location.create({ data });
    createdLocations[loc.name] = row.id;
    console.log("Location:", loc.name, "->", row.id);
  }

  // Per-location pricing
  const locationOrder = [
    "Hilton Monastir",
    "AquaSplash Water Park",
    "Friguia Park",
    "Norida Beach Resort",
    "Aqua Fun Park",
  ];
  let pricingCount = 0;
  for (const [productKey, prices] of Object.entries(PRICING)) {
    for (let i = 0; i < locationOrder.length; i++) {
      const locId = createdLocations[locationOrder[i]];
      if (!locId) continue;
      const price = prices[i];
      await prisma.pricingConfig.upsert({
        where: { productKey_locationId: { productKey, locationId: locId } },
        create: {
          productKey,
          locationId: locId,
          name: PRODUCT_NAMES[productKey] ?? productKey,
          price,
        },
        update: { price, name: PRODUCT_NAMES[productKey] ?? productKey },
      });
      pricingCount++;
    }
  }

  // waterproof_usb for AquaSplash + Aqua Fun Park
  for (const name of ["AquaSplash Water Park", "Aqua Fun Park"]) {
    const locId = createdLocations[name];
    if (!locId) continue;
    await prisma.pricingConfig.upsert({
      where: { productKey_locationId: { productKey: "waterproof_usb", locationId: locId } },
      create: {
        productKey: "waterproof_usb",
        locationId: locId,
        name: PRODUCT_NAMES.waterproof_usb,
        price: 59,
      },
      update: { price: 59 },
    });
    pricingCount++;
  }

  console.log(`\nDONE — ${LOCATIONS.length} locations, ${pricingCount} pricing rows.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
