import { prisma } from "@/lib/db";
import type { Metadata } from "next";
import MarketplaceClient from "./MarketplaceClient";

export const dynamic = "force-dynamic";

type SearchParams = {
  q?: string;
  location?: string;
  date?: string;
  specialty?: string;
  minPrice?: string;
  maxPrice?: string;
  minRating?: string;
  language?: string;
  sort?: string;
  page?: string;
};

export const metadata: Metadata = {
  title: "Find a Photographer | Fotiqo",
  description:
    "Browse and book professional photographers near you. Portrait, wedding, event, and more.",
};

export default async function FindPhotographerPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;

  // Build Prisma where clause from search params
  const where: any = {
    isPublicProfile: true,
    user: { role: "PHOTOGRAPHER" },
  };

  if (sp.specialty) {
    where.specialties = { has: sp.specialty };
  }
  if (sp.location) {
    where.OR = [
      { city: { contains: sp.location, mode: "insensitive" } },
      { country: { contains: sp.location, mode: "insensitive" } },
    ];
  }
  if (sp.minRating) {
    where.averageRating = { gte: parseFloat(sp.minRating) };
  }
  if (sp.language) {
    where.languages = { has: sp.language };
  }
  if (sp.minPrice || sp.maxPrice) {
    where.hourlyRate = {};
    if (sp.minPrice) where.hourlyRate.gte = parseFloat(sp.minPrice);
    if (sp.maxPrice) where.hourlyRate.lte = parseFloat(sp.maxPrice);
  }

  // Sort
  let orderBy: any = { averageRating: "desc" };
  if (sp.sort === "price-asc") orderBy = { hourlyRate: "asc" };
  else if (sp.sort === "price-desc") orderBy = { hourlyRate: "desc" };
  else if (sp.sort === "rating") orderBy = { averageRating: "desc" };
  else if (sp.sort === "reviews") orderBy = { totalReviews: "desc" };

  const page = parseInt(sp.page || "1");
  const perPage = 12;

  const [photographers, total] = await Promise.all([
    prisma.photographerProfile.findMany({
      where,
      include: {
        user: { select: { name: true, id: true } },
        services: { take: 3, orderBy: { sortOrder: "asc" } },
      },
      orderBy,
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.photographerProfile.count({ where }),
  ]);

  // Aggregate filter options from public profiles
  const allProfiles = await prisma.photographerProfile.findMany({
    where: { isPublicProfile: true },
    select: { specialties: true, languages: true, city: true, country: true },
  });

  const specialties = Array.from(
    new Set(allProfiles.flatMap((p) => p.specialties))
  ).sort();
  const languages = Array.from(
    new Set(allProfiles.flatMap((p) => p.languages))
  ).sort();
  const cities = Array.from(
    new Set(allProfiles.map((p) => p.city).filter(Boolean) as string[])
  ).sort();

  return (
    <MarketplaceClient
      photographers={JSON.parse(JSON.stringify(photographers))}
      total={total}
      page={page}
      perPage={perPage}
      specialties={specialties}
      languages={languages}
      cities={cities}
      searchParams={sp}
    />
  );
}
