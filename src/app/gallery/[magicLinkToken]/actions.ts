"use server";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function toggleFavorite(photoId: string, token: string) {
  const photo = await prisma.photo.findUnique({ where: { id: photoId } });
  if (!photo) return { ok: false };
  await prisma.photo.update({ where: { id: photoId }, data: { isFavorited: !photo.isFavorited } });
  revalidatePath(`/gallery/${token}`);
  return { ok: true };
}
