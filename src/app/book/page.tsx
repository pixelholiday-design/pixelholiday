import { prisma } from "@/lib/db";
import PackageListing from "./PackageListing";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Book a Photo Session \u00b7 Fotiqo",
  description: "Browse photography packages and book your session instantly. Family, couple, solo, group, kids, and event packages available.",
};

export default async function BookPage() {
  const [packages, locations] = await Promise.all([
    prisma.photoPackage
      .findMany({
        where: { isActive: true },
        include: { addOns: { orderBy: { sortOrder: "asc" } } },
        orderBy: [{ sortOrder: "asc" }, { price: "asc" }],
      })
      .catch(() => []),
    prisma.location
      .findMany({
        where: { isActive: true },
        select: { id: true, name: true, city: true, country: true },
        orderBy: { name: "asc" },
      })
      .catch(() => []),
  ]);

  return (
    <PackageListing
      packages={JSON.parse(JSON.stringify(packages))}
      locations={JSON.parse(JSON.stringify(locations))}
    />
  );
}
