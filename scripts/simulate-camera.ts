/* eslint-disable */
/**
 * Speed-camera simulator.
 *
 *   npx tsx scripts/simulate-camera.ts [externalId] [count]
 *
 * Defaults to externalId="SIM-CAM-1", count=10. Registers the camera if needed,
 * then sends `count` capture requests in rapid succession with different timestamps.
 */
import { PrismaClient, CameraType } from "@prisma/client";

const prisma = new PrismaClient();
const BASE = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

async function main() {
  const externalId = process.argv[2] || "SIM-CAM-1";
  const count = parseInt(process.argv[3] || "10", 10);

  // Pick the water-park location for realism, fall back to any.
  const location =
    (await prisma.location.findFirst({ where: { type: "WATER_PARK" } })) ||
    (await prisma.location.findFirst());
  if (!location) throw new Error("No location seeded — run prisma db seed first");

  // Register or update camera
  console.log(`📷 Registering ${externalId} at ${location.name}…`);
  const reg = await fetch(`${BASE}/api/camera/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      externalId,
      name: `Simulator ${externalId}`,
      locationId: location.id,
      type: "SPEED_CAM" as CameraType,
    }),
  }).then((r) => r.json());
  if (!reg.ok) {
    console.error("Register failed:", reg);
    process.exit(1);
  }

  // Heartbeat
  await fetch(`${BASE}/api/camera/heartbeat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ externalId }),
  });

  // Find an existing customer with a wristband for one of the captures
  const matched = await prisma.customer.findFirst({ where: { wristbandCode: { not: null } } });

  let matchedCount = 0;
  let unclaimedCount = 0;
  const start = Date.now();
  for (let i = 0; i < count; i++) {
    const useWristband = matched && i % 4 === 0; // every 4th frame is "matched"
    const res = await fetch(`${BASE}/api/camera/capture`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        externalId,
        locationId: location.id,
        timestamp: new Date(start + i * 200).toISOString(),
        s3Key: `cam/${externalId}/sim-${start}-${i}.jpg`,
        wristbandCode: useWristband ? matched!.wristbandCode : undefined,
      }),
    });
    const j = await res.json();
    if (j.success) {
      if (j.matched) matchedCount++;
      else unclaimedCount++;
      console.log(
        `  ${i + 1}/${count} → photo=${j.photoId.slice(0, 8)} ${j.matched ? "MATCHED" : "unclaimed"} (gallery=${j.galleryId.slice(0, 8)})`
      );
    } else {
      console.warn(`  ${i + 1}/${count} FAILED:`, j);
    }
  }

  console.log(`\n✅ Done — ${matchedCount} matched, ${unclaimedCount} unclaimed`);

  const cam = await prisma.camera.findUnique({ where: { externalId } });
  console.log(`Camera capture count now: ${cam?.captureCount}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
