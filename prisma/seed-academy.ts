import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Pixel Academy data...");

  // ── F2: UpsellScripts ─────────────────────
  const upsells = [
    {
      scriptName: "VALUE_PIVOT",
      trigger: "small_cart",
      condition: "cartItemCount<=3",
      script: "For just 20€ more, you unlock the entire gallery. Way better value.",
      priority: 100,
    },
    {
      scriptName: "AI_PIVOT",
      trigger: "ai_pivot",
      condition: "cartTotal<50",
      script: "Add the AI Magic Shot — your child as a fennec fox explorer. 20 TND.",
      priority: 80,
    },
    {
      scriptName: "LEGACY_CLOSE",
      trigger: "legacy_close",
      condition: "has3Generations",
      script: "These photos with grandma will mean everything in 10 years. Get the printed album.",
      priority: 90,
    },
    {
      scriptName: "SPLASH_BUNDLE",
      trigger: "splash_bundle",
      condition: "locationType=SPLASH",
      script: "Splash bundle: 5 photos + the slow-mo reel for 40 TND.",
      locationType: "SPLASH",
      priority: 70,
    },
    {
      scriptName: "FEAR_OF_LOSS",
      trigger: "fear_of_loss",
      condition: "hesitating",
      script: "These photos disappear in 7 days — once you leave, the moment is gone forever.",
      priority: 95,
    },
    {
      scriptName: "KIDS_HOOK",
      trigger: "kids_hook",
      condition: "hasKids",
      script: "Your kids will only be this small once. Future-you will pay anything for these.",
      priority: 85,
    },
  ];
  for (const u of upsells) {
    await prisma.upsellScript.upsert({
      where: { id: u.scriptName },
      create: { id: u.scriptName, ...u },
      update: u,
    });
  }

  // ── F3: ApproachHooks ─────────────────────
  const hooks = [
    {
      name: "Chaos Hook",
      demographic: "family",
      location: "pool",
      locationType: "LUXURY",
      timeOfDay: "morning",
      script: "Looks like a beautiful chaos! Want a real family photo before naptime?",
    },
    {
      name: "Romantic Hook",
      demographic: "couple",
      location: "beach",
      locationType: "LUXURY",
      timeOfDay: "evening",
      script: "Sunset is in 30 minutes. Perfect light for a couple's portrait.",
    },
    {
      name: "Legacy Hook",
      demographic: "3gen",
      location: "lobby",
      locationType: "LUXURY",
      script: "Three generations together — let's capture that for the wall at home.",
    },
    {
      name: "VIP Hook",
      demographic: "vip",
      location: "lobby",
      locationType: "LUXURY",
      script: "Mr. Smith — your private sunset session is ready when you are.",
    },
    {
      name: "Wave Pool Hook",
      demographic: "family",
      location: "wave_pool",
      locationType: "SPLASH",
      script: "Wave hits in 60 seconds — let's get the splash shot!",
    },
    {
      name: "Slide Dispatch Hook",
      demographic: "kids",
      location: "slide",
      locationType: "SPLASH",
      script: "Smile at the bottom — I'm catching the slide drop!",
    },
    {
      name: "Lazy River Hook",
      demographic: "couple",
      location: "lazy_river",
      locationType: "SPLASH",
      script: "Float by — I'll catch you with the falls in the back.",
    },
    {
      name: "Kids Splash Hook",
      demographic: "kids",
      location: "kids_pool",
      locationType: "SPLASH",
      script: "Big jump on three! 1... 2... 3!",
    },
    {
      name: "Fear Hook",
      demographic: "any",
      location: "exit",
      locationType: "SPLASH",
      script: "Last chance — your splash photos vanish at midnight.",
    },
  ];
  for (const h of hooks) {
    await prisma.approachHook.upsert({
      where: { id: h.name.toLowerCase().replace(/\s+/g, "_") },
      create: { id: h.name.toLowerCase().replace(/\s+/g, "_"), ...h },
      update: h,
    });
  }

  // ── F7: Update existing Locations ─────────
  const luxury = await prisma.location.findFirst({ where: { name: { contains: "Hilton" } } });
  if (luxury) {
    await prisma.location.update({
      where: { id: luxury.id },
      data: { locationType: "LUXURY", targetAOV: 65, maxShiftHours: 8 },
    });
  }
  const splash = await prisma.location.findFirst({ where: { name: { contains: "AquaSplash" } } });
  if (splash) {
    await prisma.location.update({
      where: { id: splash.id },
      data: { locationType: "SPLASH", targetAOV: 40, maxShiftHours: 4 },
    });
  }

  // ── F1: Mark anchor pricing ───────────────
  const fullGallery = await prisma.pricingConfig.findUnique({
    where: { productKey: "full_gallery" },
  });
  if (fullGallery) {
    await prisma.pricingConfig.update({
      where: { id: fullGallery.id },
      data: { isAnchor: true, displayOrder: 1 },
    });
  }

  // ── F9: Site Evaluations per location ──────
  const allLocations = await prisma.location.findMany();
  for (const loc of allLocations) {
    const exists = await prisma.siteEvaluation.findFirst({ where: { locationId: loc.id } });
    if (exists) continue;
    const totalScore = 4 + 4 + 4 + 4 + 4;
    const monthlyGross = (loc.targetAOV ?? 50) * 30 * 20;
    await prisma.siteEvaluation.create({
      data: {
        locationId: loc.id,
        locationName: loc.name,
        trafficScore: 4,
        affluenceScore: 4,
        spaceScore: 4,
        partnerScore: 4,
        competitionScore: 4,
        totalScore,
        passed: totalScore >= 18,
        expectedTraffic: 600,
        expectedAOV: loc.targetAOV ?? 50,
        monthlyGross,
        rentCeiling: monthlyGross * 0.2,
        proposedRent: loc.rentCost ?? 0,
        status: "APPROVED",
      },
    });
  }

  // ── F10: ScalingGates for the seeded org ──
  const org = await prisma.organization.findFirst();
  if (org) {
    const gateDefs = [
      { gateNumber: 1, gateName: "Daily Sales Reporting >= 95%", requirement: "DSR submission rate >= 95%" },
      { gateNumber: 2, gateName: "Rent <= 20% of revenue", requirement: "Rent ratio <= 20%" },
      { gateNumber: 3, gateName: "Manager promoted from inside", requirement: "Internal promotion verified" },
    ];
    for (const g of gateDefs) {
      await prisma.scalingGate.upsert({
        where: { orgId_gateNumber: { orgId: org.id, gateNumber: g.gateNumber } },
        create: { orgId: org.id, ...g, passed: false },
        update: {},
      });
    }

    // ── F10: ProofSubmissions for current month ──
    const month = new Date().toISOString().slice(0, 7);
    const types = ["daily_cash", "bank_statement", "rent_receipt", "payroll", "petty_cash"];
    const firstLoc = allLocations[0];
    if (firstLoc) {
      for (const t of types) {
        await prisma.proofSubmission.upsert({
          where: { locationId_month_type: { locationId: firstLoc.id, month, type: t } },
          create: { locationId: firstLoc.id, month, type: t, status: "pending" },
          update: {},
        });
      }
    }
  }

  console.log("Pixel Academy seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
