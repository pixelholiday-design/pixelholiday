import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import BookingClient from "./BookingClient";

export const dynamic = "force-dynamic";

interface Props { params: Promise<{ username: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const profile = await prisma.photographerProfile.findUnique({ where: { username } });
  return { title: profile ? `Book — ${profile.businessName || username}` : "Book" };
}

export default async function BookingPage({ params }: Props) {
  const { username } = await params;
  const profile = await prisma.photographerProfile.findUnique({
    where: { username },
    include: { services: { orderBy: { sortOrder: "asc" } } },
  });
  if (!profile) notFound();

  return <BookingClient profile={profile as any} />;
}
