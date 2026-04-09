import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import ProfileClient from "./ProfileClient";

export async function generateMetadata({
  params,
}: {
  params: { username: string };
}) {
  const p = await params;
  const profile = await prisma.photographerProfile.findUnique({
    where: { username: p.username },
    select: {
      user: { select: { name: true } },
      tagline: true,
      seoTitle: true,
      seoDescription: true,
    },
  });
  if (!profile) return { title: "Photographer Not Found" };
  return {
    title:
      profile.seoTitle ||
      `${profile.user.name} — Photographer | Fotiqo`,
    description:
      profile.seoDescription ||
      profile.tagline ||
      `Book a session with ${profile.user.name}`,
  };
}

export default async function PhotographerProfilePage({
  params,
}: {
  params: { username: string };
}) {
  const p = await params;
  const profile = await prisma.photographerProfile.findUnique({
    where: { username: p.username, isPublicProfile: true },
    include: {
      user: { select: { id: true, name: true, email: true } },
      services: { orderBy: { sortOrder: "asc" } },
      testimonials: {
        where: { isVisible: true },
        orderBy: { createdAt: "desc" },
        take: 20,
      },
      reviews: {
        where: { isPublic: true },
        orderBy: { createdAt: "desc" },
        take: 20,
      },
      portfolioPhotos: {
        orderBy: [{ isFeatured: "desc" }, { sortOrder: "asc" }],
        take: 30,
      },
      availability: {
        where: { isAvailable: true, date: { gte: new Date() } },
        orderBy: { date: "asc" },
        take: 90,
      },
    },
  });

  if (!profile) notFound();

  return <ProfileClient profile={JSON.parse(JSON.stringify(profile))} />;
}
