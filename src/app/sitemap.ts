import { MetadataRoute } from "next";
import { prisma } from "@/lib/db";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://fotiqo.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: { path: string; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]; priority: number }[] = [
    { path: "", changeFrequency: "daily", priority: 1 },
    { path: "/pricing", changeFrequency: "weekly", priority: 0.8 },
    { path: "/features", changeFrequency: "weekly", priority: 0.8 },
    { path: "/about", changeFrequency: "monthly", priority: 0.7 },
    { path: "/contact", changeFrequency: "monthly", priority: 0.7 },
    { path: "/products/client-gallery", changeFrequency: "weekly", priority: 0.7 },
    { path: "/products/website-builder", changeFrequency: "weekly", priority: 0.7 },
    { path: "/products/online-store", changeFrequency: "weekly", priority: 0.7 },
    { path: "/products/studio-manager", changeFrequency: "weekly", priority: 0.7 },
    { path: "/products/marketplace", changeFrequency: "weekly", priority: 0.7 },
    { path: "/products/mobile-gallery", changeFrequency: "weekly", priority: 0.7 },
    { path: "/for/wedding-photographers", changeFrequency: "weekly", priority: 0.7 },
    { path: "/for/freelance-photographers", changeFrequency: "weekly", priority: 0.7 },
    { path: "/for/studios", changeFrequency: "weekly", priority: 0.7 },
    { path: "/for/attractions-and-resorts", changeFrequency: "weekly", priority: 0.7 },
    { path: "/for/water-parks", changeFrequency: "weekly", priority: 0.7 },
    { path: "/for/attractions", changeFrequency: "weekly", priority: 0.7 },
    { path: "/for/resort-photography", changeFrequency: "weekly", priority: 0.7 },
    { path: "/for/booking-packages", changeFrequency: "weekly", priority: 0.7 },
    { path: "/for/photographer-marketplace", changeFrequency: "weekly", priority: 0.7 },
    { path: "/find-photographer", changeFrequency: "daily", priority: 0.7 },
    { path: "/help", changeFrequency: "monthly", priority: 0.6 },
    { path: "/shop", changeFrequency: "weekly", priority: 0.7 },
    { path: "/join", changeFrequency: "monthly", priority: 0.7 },
    { path: "/signup", changeFrequency: "monthly", priority: 0.7 },
    { path: "/privacy", changeFrequency: "monthly", priority: 0.3 },
    { path: "/terms", changeFrequency: "monthly", priority: 0.3 },
  ];

  const entries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${BASE_URL}${route.path}`,
    lastModified: new Date(),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

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
