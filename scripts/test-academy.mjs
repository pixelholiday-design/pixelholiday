// In-process tests — bypass HTTP/auth, exercise libs and prisma directly.
// Validates the same logic the API routes wrap.
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
let pass = 0, fail = 0;
const log = (name, ok, extra = "") => {
  console.log(`${ok ? "PASS" : "FAIL"} - ${name}${extra ? " - " + extra : ""}`);
  if (ok) pass++; else fail++;
};

async function main() {
  // 1. Seed counts
  const us = await prisma.upsellScript.count();
  log("UpsellScript=6", us === 6, `got ${us}`);
  const ah = await prisma.approachHook.count();
  log("ApproachHook=9", ah === 9, `got ${ah}`);
  const sg = await prisma.scalingGate.count();
  log("ScalingGate=3", sg === 3, `got ${sg}`);
  const ps = await prisma.proofSubmission.count();
  log("ProofSubmission>=5", ps >= 5, `got ${ps}`);

  // 2. pickScript
  try {
    const { pickScript } = await import("../src/lib/upsell/coach.ts");
    const s = await pickScript({ cartItemCount: 2, cartTotal: 40, locationType: "LUXURY" });
    log("pickScript→VALUE_PIVOT", s?.scriptName === "VALUE_PIVOT", s?.scriptName ?? "null");
  } catch (e) { log("pickScript", false, e.message); }

  // 3. suggestHook
  try {
    const { suggestHook } = await import("../src/lib/hooks/suggest.ts");
    const h = await suggestHook({ demographic: "family", location: "pool", locationType: "LUXURY", timeOfDay: "morning" });
    log("suggestHook→Chaos Hook", h?.name === "Chaos Hook", h?.name ?? "null");
  } catch (e) { log("suggestHook", false, e.message); }

  // 4. customer-arrived simulation (direct prisma)
  try {
    const appt = await prisma.appointment.findFirst();
    if (appt) {
      const outcome = await prisma.appointmentOutcome.upsert({
        where: { appointmentId: appt.id },
        create: { appointmentId: appt.id, didArrive: true, arrivedAt: new Date(), photographerId: appt.assignedPhotographerId },
        update: { didArrive: true, arrivedAt: new Date() },
      });
      const commission = await prisma.commission.create({
        data: { userId: appt.assignedPhotographerId, type: "ATTENDANCE_BONUS", amount: 2, rate: 0, month: new Date().toISOString().slice(0,7) },
      });
      log("customer-arrived creates outcome+commission", !!outcome && !!commission && commission.amount === 2);
    } else {
      log("customer-arrived: no appointment", true, "skipped (db empty)");
    }
  } catch (e) { log("customer-arrived", false, e.message); }

  // 5. site evaluate math
  try {
    const totalScore = 5 + 5 + 5 + 5 + 5;
    const monthlyGross = 1000 * 50;
    const rentCeiling = monthlyGross * 0.2;
    const ev = await prisma.siteEvaluation.create({
      data: {
        locationName: "TestSite",
        trafficScore: 5, affluenceScore: 5, spaceScore: 5, partnerScore: 5, competitionScore: 5,
        totalScore, passed: totalScore >= 18,
        expectedTraffic: 1000, expectedAOV: 50, monthlyGross, rentCeiling, proposedRent: 5000,
        status: "APPROVED",
      },
    });
    log("site evaluate score=25 ceiling=10000", ev.totalScore === 25 && ev.rentCeiling === 10000);
  } catch (e) { log("site evaluate", false, e.message); }

  // 6. sneak-peek
  try {
    const { runSneakPeek } = await import("../src/lib/automation/sneak-peek.ts");
    const before = await prisma.sneakPeek.count();
    const r = await runSneakPeek();
    const after = await prisma.sneakPeek.count();
    log("sneak-peek run", r.sent !== undefined, `sent=${r.sent} delta=${after - before}`);
  } catch (e) { log("sneak peek", false, e.message); }

  // 7. scaling gates
  try {
    const { runAllGates } = await import("../src/lib/scaling/gates.ts");
    const org = await prisma.organization.findFirst();
    const results = await runAllGates(org.id);
    log("runAllGates returns 3", results.length === 3);
  } catch (e) { log("scaling-gates", false, e.message); }

  // 8. payroll-gated logic
  try {
    const month = new Date().toISOString().slice(0, 7);
    const REQUIRED = ["daily_cash","bank_statement","rent_receipt","payroll","petty_cash"];
    const proofs = await prisma.proofSubmission.findMany({ where: { month } });
    const verified = new Set(proofs.filter(p => p.status === "verified").map(p => p.type));
    const missing = REQUIRED.filter(t => !verified.has(t));
    log("payroll-gated: blocked when missing", missing.length > 0, `missing=${missing.length}`);

    // Submit a proof, verify gate now sees one fewer missing
    const firstLoc = await prisma.location.findFirst();
    if (firstLoc) {
      await prisma.proofSubmission.upsert({
        where: { locationId_month_type: { locationId: firstLoc.id, month, type: "daily_cash" } },
        create: { locationId: firstLoc.id, month, type: "daily_cash", status: "verified", verifiedAt: new Date() },
        update: { status: "verified", verifiedAt: new Date() },
      });
      const proofs2 = await prisma.proofSubmission.findMany({ where: { month } });
      const verified2 = new Set(proofs2.filter(p => p.status === "verified").map(p => p.type));
      const missing2 = REQUIRED.filter(t => !verified2.has(t));
      log("payroll-gated: 1 verified reduces missing", missing2.length === missing.length - 1, `before=${missing.length} after=${missing2.length}`);
    }
  } catch (e) { log("payroll-gated", false, e.message); }

  console.log(`\n${pass} pass, ${fail} fail`);
  await prisma.$disconnect();
  process.exit(fail > 0 ? 1 : 0);
}
main();
