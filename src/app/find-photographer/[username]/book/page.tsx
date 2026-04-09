import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import BookingClient from "./BookingClient";

export default async function BookPhotographerPage({
  params,
  searchParams,
}: {
  params: { username: string };
  searchParams: { service?: string };
}) {
  const p = await params;
  const sp = await searchParams;

  const profile = await prisma.photographerProfile.findUnique({
    where: { username: p.username, isPublicProfile: true },
    include: {
      user: { select: { id: true, name: true } },
      services: { orderBy: { sortOrder: "asc" } },
    },
  });

  if (!profile) notFound();

  // Availability lives on User, not PhotographerProfile, so query separately
  const availability = await prisma.photographerAvailability.findMany({
    where: {
      userId: profile.userId,
      isAvailable: true,
      date: { gte: new Date() },
    },
    orderBy: { date: "asc" },
    take: 90,
  });

  const data = {
    ...profile,
    availability,
  };

  return (
    <BookingClient
      profile={JSON.parse(JSON.stringify(data))}
      preselectedServiceId={sp.service}
    />
  );
}
