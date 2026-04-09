import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import WebsiteBuilderClient from "./WebsiteBuilderClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "Website Builder — Pixelvo" };

export default async function WebsiteBuilderPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  const userId = (session.user as any).id;

  const profile = await prisma.photographerProfile.findUnique({
    where: { userId },
    include: {
      services: { orderBy: { sortOrder: "asc" } },
      testimonials: { orderBy: { sortOrder: "asc" } },
    },
  });

  const galleries = await prisma.gallery.findMany({
    where: { photographerId: userId },
    include: { photos: { take: 4, orderBy: { sortOrder: "asc" } } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { name: true, email: true } });

  return <WebsiteBuilderClient profile={profile as any} galleries={galleries as any} user={user as any} />;
}
