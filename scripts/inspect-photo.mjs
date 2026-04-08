import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
// recent galleries
const recent = await p.gallery.findMany({
  orderBy: { createdAt: 'desc' },
  take: 5,
  select: { id: true, magicLinkToken: true, status: true, photos: { select: { s3Key_highRes: true, cloudinaryId: true }, take: 2 } },
});
console.log(JSON.stringify(recent, null, 2));
await p.$disconnect();
