import { PrismaClient } from '@prisma/client';
import { analyzePhoto } from '../src/lib/ai/photo-analyzer';
import { calculateSkillProfile } from '../src/lib/ai/skill-profile';
import { autoAssignTraining } from '../src/lib/ai/auto-training';

const prisma = new PrismaClient();

const POSES: Array<{
  name: string;
  subjectType: string;
  difficulty: string;
  description: string;
}> = [
  // individual (10)
  { name: 'Classic Standing', subjectType: 'individual', difficulty: 'beginner', description: 'Subject standing, relaxed posture.' },
  { name: 'Walking Toward Camera', subjectType: 'individual', difficulty: 'beginner', description: 'Candid forward walk.' },
  { name: 'Leaning Casual', subjectType: 'individual', difficulty: 'beginner', description: 'Leaning against railing or wall.' },
  { name: 'Sitting Relaxed', subjectType: 'individual', difficulty: 'beginner', description: 'Seated, looking at camera or away.' },
  { name: 'Action Splash', subjectType: 'individual', difficulty: 'intermediate', description: 'Mid-water splash action.' },
  { name: 'Silhouette Sunset', subjectType: 'individual', difficulty: 'advanced', description: 'Silhouetted against a sunset.' },
  { name: 'Looking Away', subjectType: 'individual', difficulty: 'beginner', description: 'Profile, gaze off-camera.' },
  { name: 'Hands in Hair', subjectType: 'individual', difficulty: 'beginner', description: 'Classic fashion-style pose.' },
  { name: 'Laughing Candid', subjectType: 'individual', difficulty: 'intermediate', description: 'Authentic laugh, unposed.' },
  { name: 'Under Water', subjectType: 'individual', difficulty: 'advanced', description: 'Submerged pose with clarity.' },
  // couple (10)
  { name: 'Walking Hand in Hand', subjectType: 'couple', difficulty: 'beginner', description: 'Holding hands walking.' },
  { name: 'Forehead Touch', subjectType: 'couple', difficulty: 'intermediate', description: 'Intimate forehead-to-forehead.' },
  { name: 'Piggyback', subjectType: 'couple', difficulty: 'beginner', description: 'Playful piggyback ride.' },
  { name: 'Dip Kiss', subjectType: 'couple', difficulty: 'advanced', description: 'Classic cinematic dip.' },
  { name: 'Sunset Silhouette Couple', subjectType: 'couple', difficulty: 'advanced', description: 'Two silhouettes, sunset.' },
  { name: 'Back Hug', subjectType: 'couple', difficulty: 'beginner', description: 'Hug from behind.' },
  { name: 'Sitting Together', subjectType: 'couple', difficulty: 'beginner', description: 'Seated intimate pose.' },
  { name: 'Splash Fight', subjectType: 'couple', difficulty: 'intermediate', description: 'Water splash play.' },
  { name: 'Champagne Toast', subjectType: 'couple', difficulty: 'beginner', description: 'Toasting with drinks.' },
  { name: 'Dancing', subjectType: 'couple', difficulty: 'intermediate', description: 'Dancing together.' },
  // family (10)
  { name: 'Classic Family Lineup', subjectType: 'family', difficulty: 'beginner', description: 'Straight-line family portrait.' },
  { name: 'Parents Lifting Child', subjectType: 'family', difficulty: 'intermediate', description: 'Parents lift child high.' },
  { name: 'Walking Together', subjectType: 'family', difficulty: 'beginner', description: 'Family walking as unit.' },
  { name: 'Piggyback Parade', subjectType: 'family', difficulty: 'intermediate', description: 'Multiple piggybacks.' },
  { name: 'Pyramid', subjectType: 'family', difficulty: 'advanced', description: 'Human pyramid formation.' },
  { name: 'Running Toward Camera', subjectType: 'family', difficulty: 'intermediate', description: 'Family runs in.' },
  { name: 'Family Splash', subjectType: 'family', difficulty: 'intermediate', description: 'Group water splash.' },
  { name: 'Sand Castle', subjectType: 'family', difficulty: 'beginner', description: 'Building together on beach.' },
  { name: 'Group Hug', subjectType: 'family', difficulty: 'beginner', description: 'Close group embrace.' },
  { name: 'Silly Faces', subjectType: 'family', difficulty: 'beginner', description: 'Playful expressions.' },
  // kids (8)
  { name: 'Jumping', subjectType: 'kids', difficulty: 'beginner', description: 'Mid-air jump.' },
  { name: 'Running in Water', subjectType: 'kids', difficulty: 'beginner', description: 'Splashing through water.' },
  { name: 'Ice Cream', subjectType: 'kids', difficulty: 'beginner', description: 'Enjoying ice cream.' },
  { name: 'With Floatie', subjectType: 'kids', difficulty: 'beginner', description: 'Posing with pool float.' },
  { name: 'Sandbox Play', subjectType: 'kids', difficulty: 'beginner', description: 'Beach sand play.' },
  { name: 'Peek-a-Boo', subjectType: 'kids', difficulty: 'beginner', description: 'Peeking out playfully.' },
  { name: 'Super Hero', subjectType: 'kids', difficulty: 'intermediate', description: 'Superhero pose.' },
  { name: 'On Shoulders', subjectType: 'kids', difficulty: 'beginner', description: 'Child on adult shoulders.' },
  // action (8)
  { name: 'Water Slide Exit', subjectType: 'action', difficulty: 'intermediate', description: 'Exit spray of water slide.' },
  { name: 'Cannonball', subjectType: 'action', difficulty: 'intermediate', description: 'Mid-air cannonball.' },
  { name: 'Diving', subjectType: 'action', difficulty: 'advanced', description: 'Mid-dive capture.' },
  { name: 'Wave Jump', subjectType: 'action', difficulty: 'intermediate', description: 'Jumping a wave.' },
  { name: 'Ball Catch', subjectType: 'action', difficulty: 'intermediate', description: 'Catching mid-air ball.' },
  { name: 'Surfing/Boogie Board', subjectType: 'action', difficulty: 'advanced', description: 'Riding a board.' },
  { name: 'Zip Line', subjectType: 'action', difficulty: 'intermediate', description: 'Mid-zip capture.' },
  { name: 'Roller Coaster', subjectType: 'action', difficulty: 'intermediate', description: 'On-ride reaction.' },
  // portrait (4)
  { name: 'Headshot with Hat', subjectType: 'portrait', difficulty: 'beginner', description: 'Classic headshot wearing hat.' },
  { name: 'Sunglasses Reflection', subjectType: 'portrait', difficulty: 'intermediate', description: 'Scene reflection in glasses.' },
  { name: 'Wet Hair', subjectType: 'portrait', difficulty: 'intermediate', description: 'Post-swim portrait.' },
  { name: 'Profile with Horizon', subjectType: 'portrait', difficulty: 'intermediate', description: 'Side profile against ocean.' },
];

const MODULES: Array<{ title: string; description: string }> = [
  { title: 'Mastering Couple Poses', description: 'Learn the most engaging couple pose variations.' },
  { title: 'Family Group Photography', description: 'Compose and direct family groups effectively.' },
  { title: 'Capturing Kids in Motion', description: 'Freeze action with kids while keeping energy alive.' },
  { title: 'Action & Dynamic Shots', description: 'Shutter, tracking, and anticipation for action scenes.' },
  { title: 'Technical Excellence: Focus & Sharpness', description: 'Focus modes, pre-focus, and sharpness technique.' },
  { title: 'Lighting for Resort Photography', description: 'Golden hour, shade reflections, fill flash.' },
  { title: 'Composition & Framing', description: 'Rule of thirds, leading lines, headroom.' },
  { title: 'Creating Hook Photos That Sell', description: 'Emotion, action, and the decisive moment.' },
  { title: 'Shooting for the Sale', description: 'How to compose for kiosk conversion.' },
  { title: 'Posing Confidence Builder', description: 'Directing guests without making them self-conscious.' },
];

async function main() {
  console.log('Seeding PoseCategory...');
  for (let i = 0; i < POSES.length; i++) {
    const p = POSES[i];
    await prisma.poseCategory.upsert({
      where: { name: p.name },
      create: {
        name: p.name,
        description: p.description,
        subjectType: p.subjectType,
        difficulty: p.difficulty,
        tags: p.subjectType + ',' + p.difficulty,
        exampleDescription: p.description,
        sortOrder: i,
      },
      update: {},
    });
  }
  console.log(`  → ${POSES.length} pose categories`);

  console.log('Seeding AcademyModule...');
  let mCreated = 0;
  for (let i = 0; i < MODULES.length; i++) {
    const m = MODULES[i];
    const existing = await prisma.academyModule.findFirst({ where: { title: m.title } });
    if (!existing) {
      await prisma.academyModule.create({
        data: {
          title: m.title,
          description: m.description,
          type: 'PHOTOGRAPHY_TECHNIQUE',
          sortOrder: 100 + i,
          isRequired: false,
        },
      });
      mCreated++;
    }
  }
  console.log(`  → ${mCreated} new academy modules (${MODULES.length - mCreated} already existed)`);

  console.log('Analyzing photos per photographer...');
  const photographers = await prisma.user.findMany({ where: { role: 'PHOTOGRAPHER' } });
  console.log(`  → Found ${photographers.length} photographers`);

  let totalAnalyses = 0;
  let profilesCreated = 0;
  let assignmentsCreated = 0;

  for (const u of photographers) {
    const photos = await prisma.photo.findMany({
      where: { gallery: { photographerId: u.id } },
      take: 25,
    });
    for (const p of photos) {
      const res = await analyzePhoto({ photoId: p.id, photographerId: u.id });
      if (res) totalAnalyses++;
    }
    const profile = await calculateSkillProfile(u.id);
    if (profile) profilesCreated++;
    const assigns = await autoAssignTraining(u.id);
    assignmentsCreated += assigns.length;
  }

  console.log('\nSummary:');
  console.log(`  Photographers: ${photographers.length}`);
  console.log(`  PhotoAnalysis rows: ${totalAnalyses}`);
  console.log(`  Skill profiles: ${profilesCreated}`);
  console.log(`  Training assignments: ${assignmentsCreated}`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
