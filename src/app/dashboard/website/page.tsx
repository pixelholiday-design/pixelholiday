import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import WebsiteBuilderClient from "./WebsiteBuilderClient";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const metadata = { title: "Website Builder — Fotiqo" };

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

  return (
    <div>
      {/* Build method chooser */}
      <div className="max-w-4xl mx-auto px-4 pt-8 pb-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">How would you like to build your website?</h2>
        <p className="text-sm text-gray-500 mb-4">Choose a method to get started, or continue editing below.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <Link
            href="/dashboard/website/ai-builder"
            className="group block bg-white border border-gray-200 rounded-xl p-6 hover:border-teal-400 hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-teal-50 text-teal-600 group-hover:bg-teal-100 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" /><path d="M20 3v4" /><path d="M22 5h-4" /></svg>
              </span>
              <h3 className="font-semibold text-gray-900">AI Builder</h3>
            </div>
            <p className="text-sm text-gray-500">Let AI create your website in seconds. Just answer a few questions about your business.</p>
          </Link>
          <Link
            href="/dashboard/website/editor"
            className="group block bg-white border border-gray-200 rounded-xl p-6 hover:border-teal-400 hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 text-gray-600 group-hover:bg-gray-200 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="7" x="3" y="3" rx="1" /><rect width="7" height="7" x="14" y="3" rx="1" /><rect width="7" height="7" x="14" y="14" rx="1" /><rect width="7" height="7" x="3" y="14" rx="1" /></svg>
              </span>
              <h3 className="font-semibold text-gray-900">Manual Editor</h3>
            </div>
            <p className="text-sm text-gray-500">Drag and drop blocks yourself. Full control over every section of your website.</p>
          </Link>
        </div>
      </div>

      {/* Existing builder */}
      <WebsiteBuilderClient profile={profile as any} galleries={galleries as any} user={user as any} />
    </div>
  );
}
