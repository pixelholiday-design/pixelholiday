import { MetadataRoute } from "next";
import { prisma } from "@/lib/db";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://fotiqo.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${BASE_URL}/pricing`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/features`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
  ];

  // Photographer portfolio pages
  try {
    const profiles = await prisma.photographerProfile.findMany({
      where: { isPublicProfile: true },
      select: { username: true, updatedAt: true },
    });

    for (const p of profiles) {
      entries.push({
        url: `${BASE_URL}/p/${p.username}`,
        lastModified: p.updatedAt,
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }
  } catch {
    // DB not available during build
  }

  // Published blog posts
  try {
    const posts = await prisma.blogPost.findMany({
      where: { status: "PUBLISHED" },
      select: { id: true, publishedAt: true, createdAt: true },
    });

    for (const post of posts) {
      entries.push({
        url: `${BASE_URL}/blog/${post.id}`,
        lastModified: post.publishedAt || post.createdAt,
        changeFrequency: "monthly",
        priority: 0.6,
      });
    }
  } catch {
    // DB not available during build
  }

  // Published mini sessions
  try {
    const sessions = await prisma.miniSession.findMany({
      where: { isPublished: true },
      select: { slug: true, createdAt: true },
    });

    for (const s of sessions) {
      entries.push({
        url: `${BASE_URL}/mini/${s.slug}`,
        lastModified: s.createdAt,
        changeFrequency: "weekly",
        priority: 0.6,
      });
    }
  } catch {}

  return entries;
}
