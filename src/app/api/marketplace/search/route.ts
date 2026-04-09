import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const url = req.nextUrl.searchParams;
    const q = url.get("q");
    const location = url.get("location");
    const specialty = url.get("specialty");
    const minPrice = url.get("minPrice");
    const maxPrice = url.get("maxPrice");
    const minRating = url.get("minRating");
    const language = url.get("language");
    const sort = url.get("sort") || "relevance";
    const page = Math.max(1, parseInt(url.get("page") || "1", 10));
    const perPage = Math.min(50, Math.max(1, parseInt(url.get("perPage") || "20", 10)));

    const where: Prisma.PhotographerProfileWhereInput = {
      isPublicProfile: true,
    };

    if (specialty) {
      where.specialties = { has: specialty };
    }

    if (location) {
      where.OR = [
        ...(where.OR || []),
        { city: { contains: location, mode: "insensitive" } },
        { country: { contains: location, mode: "insensitive" } },
      ];
    }

    if (minRating) {
      where.averageRating = { gte: parseFloat(minRating) };
    }

    if (language) {
      where.languages = { has: language };
    }

    if (minPrice || maxPrice) {
      where.hourlyRate = {};
      if (minPrice) (where.hourlyRate as Prisma.FloatNullableFilter).gte = parseFloat(minPrice);
      if (maxPrice) (where.hourlyRate as Prisma.FloatNullableFilter).lte = parseFloat(maxPrice);
    }

    if (q) {
      const textSearch: Prisma.PhotographerProfileWhereInput[] = [
        { user: { name: { contains: q, mode: "insensitive" } } },
        { bio: { contains: q, mode: "insensitive" } },
        { tagline: { contains: q, mode: "insensitive" } },
      ];

      if (where.OR) {
        // Combine location OR with text search via AND
        where.AND = [{ OR: where.OR }, { OR: textSearch }];
        delete where.OR;
      } else {
        where.OR = textSearch;
      }
    }

    let orderBy: Prisma.PhotographerProfileOrderByWithRelationInput;
    switch (sort) {
      case "price-asc":
        orderBy = { hourlyRate: "asc" };
        break;
      case "price-desc":
        orderBy = { hourlyRate: "desc" };
        break;
      case "rating":
        orderBy = { averageRating: "desc" };
        break;
      case "reviews":
        orderBy = { totalReviews: "desc" };
        break;
      case "relevance":
      default:
        orderBy = { averageRating: "desc" };
        break;
    }

    const [photographers, total] = await Promise.all([
      prisma.photographerProfile.findMany({
        where,
        orderBy,
        skip: (page - 1) * perPage,
        take: perPage,
        include: {
          user: { select: { id: true, name: true, email: true } },
          services: { orderBy: { sortOrder: "asc" } },
        },
      }),
      prisma.photographerProfile.count({ where }),
    ]);

    return NextResponse.json({ photographers, total, page, perPage });
  } catch (error) {
    console.error("Marketplace search error:", error);
    return NextResponse.json(
      { error: "Failed to search photographers" },
      { status: 500 }
    );
  }
}
