import { PrismaClient } from "@prisma/client";
import { analyzeGalleryPhotos, analyzePhoto } from "../src/lib/ai/photo-analyzer";
import { calculateSkillProfile } from "../src/lib/ai/skill-profile";
import { autoAssignTraining } from "../src/lib/ai/auto-training";
import { generateWeeklyReport } from "../src/lib/ai/weekly-report";

const prisma = new PrismaClient();

function pass(name) {
  console.log(`PASS  ${name}`);
}
function fail(name, err) {
  console.log(`FAIL  ${name}${err ? " — " + err : ""}`);
}

async function main() {
  const photographer = await prisma.user.findFirst({ where: { role: "PHOTOGRAPHER" } });
  if (!photographer) {
    console.log("No photographer in DB — skipping");
    return;
  }
  console.log(`Testing with photographer ${photographer.name} (${photographer.id})`);

  const gallery = await prisma.gallery.findFirst({
    where: { photographerId: photographer.id },
  });
  if (!gallery) {
    fail("Step 1: find gallery", "none");
    return;
  }
  pass("Step 0: photographer + gallery present");

  try {
    const res = await analyzeGalleryPhotos(gallery.id);
    console.log(`  analyzed ${res.length} photos`);
    pass("Step 1: analyzeGalleryPhotos");
  } catch (e) {
    fail("Step 1: analyzeGalleryPhotos", e.message);
  }

  try {
    const profile = await calculateSkillProfile(photographer.id);
    console.log(`  skillProfile overall couple=${profile.couplePoses} family=${profile.familyPoses}`);
    pass("Step 2: calculateSkillProfile");
  } catch (e) {
    fail("Step 2: calculateSkillProfile", e.message);
  }

  try {
    const assigns = await autoAssignTraining(photographer.id);
    console.log(`  created ${assigns.length} training assignments`);
    pass("Step 3: autoAssignTraining");
  } catch (e) {
    fail("Step 3: autoAssignTraining", e.message);
  }

  const analysisCount = await prisma.photoAnalysis.count({
    where: { photographerId: photographer.id },
  });
  if (analysisCount > 0) pass(`Step 4: PhotoAnalysis rows exist (${analysisCount})`);
  else fail("Step 4: PhotoAnalysis rows exist");

  const profile = await prisma.photographerSkillProfile.findUnique({
    where: { userId: photographer.id },
  });
  if (profile) pass("Step 5: PhotographerSkillProfile exists");
  else fail("Step 5: PhotographerSkillProfile exists");

  try {
    const report = await generateWeeklyReport(photographer.id);
    console.log(`  weekly report avgOverall=${report.avgOverallScore} photos=${report.photosAnalyzed}`);
    pass("Step 6: generateWeeklyReport");
  } catch (e) {
    fail("Step 6: generateWeeklyReport", e.message);
  }

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
