import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import InquiriesClient from "./InquiriesClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "Inquiries — Fotiqo" };

export default async function InquiriesPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  const userId = (session.user as any).id;

  const profile = await prisma.photographerProfile.findUnique({ where: { userId } });
  if (!profile) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-slate-900 mb-2">Set up your profile first</h2>
          <p className="text-slate-500 mb-4">Create your photographer profile to start receiving inquiries.</p>
          <a href="/dashboard/website" className="px-4 py-2 bg-coral-500 text-white rounded-lg text-sm font-semibold">Go to Website Builder</a>
        </div>
      </div>
    );
  }

  const inquiries = await prisma.photographerInquiry.findMany({
    where: { profileId: profile.id },
    orderBy: { createdAt: "desc" },
  });

  return <InquiriesClient inquiries={inquiries as any} />;
}
