import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import FindGalleryClient from "./FindGalleryClient";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const profile = await prisma.photographerProfile.findUnique({ where: { username } });
  if (!profile) return { title: "Not Found" };
  return {
    title: `Find Your Photos — ${profile.businessName || username}`,
    description: `Search and access your photo gallery from ${profile.businessName || username}.`,
  };
}

export default async function GalleriesPage({ params }: Props) {
  const { username } = await params;
  const profile = await prisma.photographerProfile.findUnique({
    where: { username },
    select: {
      id: true,
      username: true,
      businessName: true,
      primaryColor: true,
      fontChoice: true,
      profilePhotoUrl: true,
      logoUrl: true,
    },
  });

  if (!profile) notFound();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6 flex items-center gap-4">
          {(profile.logoUrl || profile.profilePhotoUrl) && (
            <img
              src={profile.logoUrl || profile.profilePhotoUrl || ""}
              alt={profile.businessName || profile.username}
              className="w-10 h-10 rounded-full object-cover"
            />
          )}
          <div>
            <a href={`/p/${profile.username}`} className="text-lg font-semibold text-gray-900 hover:underline">
              {profile.businessName || profile.username}
            </a>
            <p className="text-sm text-gray-500">Find Your Photos</p>
          </div>
        </div>
      </header>

      <FindGalleryClient
        username={profile.username}
        brandColor={profile.primaryColor || "#0EA5A5"}
      />
    </div>
  );
}
