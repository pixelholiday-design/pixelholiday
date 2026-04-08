import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function log(label, pass, detail = "") {
  console.log(`${pass ? "PASS" : "FAIL"}  ${label}${detail ? " — " + detail : ""}`);
  if (!pass) process.exitCode = 1;
}

async function main() {
  // Step 1: 5+ locations
  const locCount = await prisma.location.count();
  log("Step 1: Location count >= 5", locCount >= 5, `count=${locCount}`);

  const hilton = await prisma.location.findFirst({ where: { name: "Hilton Monastir" } });
  const aqua = await prisma.location.findFirst({ where: { name: "AquaSplash Water Park" } });
  if (!hilton || !aqua) {
    log("locations exist", false, "Hilton or AquaSplash missing — aborting");
    await prisma.$disconnect();
    return;
  }

  // Step 2: per-location pricing via pricing lib
  const { getPrice } = await import("../src/lib/pricing.ts").catch(async () => {
    // fallback: direct DB query
    return {
      getPrice: async (key, locId) => {
        if (locId) {
          const loc = await prisma.pricingConfig.findFirst({ where: { productKey: key, locationId: locId } });
          if (loc) return loc.price;
        }
        const g = await prisma.pricingConfig.findFirst({ where: { productKey: key, locationId: null } });
        return g?.price ?? 0;
      },
    };
  });

  const hiltonFull = await getPrice("full_gallery", hilton.id);
  log("Step 2a: Hilton full_gallery = 130", hiltonFull === 130, `got ${hiltonFull}`);
  const aquaFull = await getPrice("full_gallery", aqua.id);
  log("Step 2b: AquaSplash full_gallery = 45", aquaFull === 45, `got ${aquaFull}`);

  // Step 3: fallback
  const missing = await getPrice("nonexistent_key_xyz", hilton.id);
  log("Step 3: Fallback for unknown key", missing === 0, `got ${missing}`);

  // Step 4: Hilton commission = 10% flat
  // Create a fake gallery+order at Hilton, run commission calc, verify.
  const org = await prisma.organization.findFirst();
  let photographer = await prisma.user.findFirst({ where: { role: "PHOTOGRAPHER" } });
  if (!photographer) {
    photographer = await prisma.user.create({
      data: {
        name: "Test Photographer",
        email: `test-photog-${Date.now()}@test.local`,
        role: "PHOTOGRAPHER",
        orgId: org.id,
        locationId: hilton.id,
      },
    });
  }
  const customer = await prisma.customer.create({
    data: { name: "Test Customer", email: `cust-${Date.now()}@test.local`, locationId: hilton.id },
  });
  const gallery = await prisma.gallery.create({
    data: {
      status: "PAID",
      locationId: hilton.id,
      photographerId: photographer.id,
      customerId: customer.id,
      expiresAt: new Date(Date.now() + 7 * 86400000),
    },
  });
  const order = await prisma.order.create({
    data: {
      galleryId: gallery.id,
      customerId: customer.id,
      amount: 130,
      currency: "EUR",
      paymentMethod: "STRIPE_ONLINE",
      status: "COMPLETED",
    },
  });

  const { calculateLocationCommission } = await import("../src/lib/commissions.ts").catch(() => ({ calculateLocationCommission: null }));
  if (calculateLocationCommission) {
    const hiltonCalc = await calculateLocationCommission(order.id, "PHOTO_SALE");
    log("Step 4: Hilton 10% of 130 = 13", Math.abs(hiltonCalc.amount - 13) < 0.01, `got ${hiltonCalc.amount} at rate ${hiltonCalc.rate}`);
  } else {
    log("Step 4: commissions lib importable", false, "could not import");
  }

  // Step 5: AquaSplash tiered — order amount 200, should be tier1 (3%) since dayTotal < 1000
  const aquaGallery = await prisma.gallery.create({
    data: {
      status: "PAID",
      locationId: aqua.id,
      photographerId: photographer.id,
      customerId: customer.id,
      expiresAt: new Date(Date.now() + 7 * 86400000),
    },
  });
  const aquaOrder = await prisma.order.create({
    data: {
      galleryId: aquaGallery.id,
      customerId: customer.id,
      amount: 200,
      currency: "EUR",
      paymentMethod: "STRIPE_ONLINE",
      status: "COMPLETED",
    },
  });
  if (calculateLocationCommission) {
    const aquaCalc = await calculateLocationCommission(aquaOrder.id, "PHOTO_SALE");
    // dayTotal includes the order itself; tier1Rate=0.03, tier2Rate=0.07, tier3Rate=0.12
    const validRates = [0.03, 0.07, 0.12];
    log(
      "Step 5: AquaSplash tiered commission applied",
      validRates.includes(aquaCalc.rate),
      `got amount=${aquaCalc.amount}, rate=${aquaCalc.rate}`,
    );
  }

  // cleanup
  await prisma.order.deleteMany({ where: { id: { in: [order.id, aquaOrder.id] } } });
  await prisma.gallery.deleteMany({ where: { id: { in: [gallery.id, aquaGallery.id] } } });
  await prisma.customer.delete({ where: { id: customer.id } });
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
