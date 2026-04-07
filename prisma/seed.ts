import { PrismaClient, GalleryStatus, LocationType, OrgType, StaffRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding PixelHoliday...");

  const org = await prisma.organization.create({
    data: { name: "PixelHoliday Tunisia", type: OrgType.HEADQUARTERS },
  });

  const hotel = await prisma.location.create({
    data: { name: "Hilton Monastir", type: LocationType.HOTEL, orgId: org.id, address: "Monastir, Tunisia" },
  });
  const park = await prisma.location.create({
    data: { name: "AquaSplash Water Park", type: LocationType.WATER_PARK, orgId: org.id, address: "Hammamet, Tunisia" },
  });

  const passwordHash = await bcrypt.hash("password123", 10);

  await prisma.user.create({
    data: { name: "Admin CEO", email: "admin@pixelholiday.local", password: passwordHash, role: StaffRole.CEO, orgId: org.id },
  });

  const photographers = await Promise.all(
    ["Yassine Ben", "Sara Trabelsi", "Karim Hamdi"].map((name, i) =>
      prisma.user.create({
        data: {
          name,
          email: `photog${i + 1}@pixelholiday.local`,
          password: passwordHash,
          role: StaffRole.PHOTOGRAPHER,
          orgId: org.id,
          locationId: i % 2 === 0 ? hotel.id : park.id,
          rating: 4 + Math.random(),
        },
      })
    )
  );

  const customers = await Promise.all(
    Array.from({ length: 5 }).map((_, i) =>
      prisma.customer.create({
        data: {
          name: `Guest ${i + 1}`,
          email: `guest${i + 1}@example.com`,
          whatsapp: `+216200000${i}${i}`,
          roomNumber: `${100 + i * 7}`,
        },
      })
    )
  );

  const statuses: GalleryStatus[] = [
    GalleryStatus.HOOK_ONLY,
    GalleryStatus.PREVIEW_ECOM,
    GalleryStatus.PAID,
    GalleryStatus.PARTIAL_PAID,
    GalleryStatus.DIGITAL_PASS,
    GalleryStatus.HOOK_ONLY,
    GalleryStatus.PREVIEW_ECOM,
    GalleryStatus.PREVIEW_ECOM,
    GalleryStatus.PAID,
    GalleryStatus.HOOK_ONLY,
  ];

  // Demo image (Picsum) — valid URLs without storing real keys
  const demoUrl = (i: number) => `https://picsum.photos/seed/pixel${i}/1200/800`;

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

  console.log("✅ Seed complete: 1 org, 2 locations, 1 admin + 3 photographers, 5 customers, 10 galleries, 50 photos");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
