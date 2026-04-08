import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { analyzePhoto } from '@/lib/ai/photo-analyzer';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { photoId } = await req.json();
    if (!photoId) return NextResponse.json({ error: 'photoId required' }, { status: 400 });
    const photo = await prisma.photo.findUnique({
      where: { id: photoId },
      include: { gallery: true },
    });
    if (!photo) return NextResponse.json({ error: 'not found' }, { status: 404 });
    const analysis = await analyzePhoto({
      photoId,
      photographerId: photo.gallery.photographerId,
    });
    return NextResponse.json({ analysis });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'failed' }, { status: 500 });
  }
}
