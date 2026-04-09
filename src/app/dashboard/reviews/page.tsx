import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import ReviewsClient from "./ReviewsClient";

export default async function ReviewsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  // Find the photographer's profile
  const profile = await prisma.photographerProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!profile) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8 text-center max-w-md">
          <h2 className="text-lg font-semibold text-slate-900 mb-2">No Photographer Profile</h2>
          <p className="text-sm text-slate-500">
            You need to create a photographer profile before you can view reviews.
          </p>
        </div>
      </div>
    );
  }

  const reviews = await prisma.photographerReview.findMany({
    where: { profileId: profile.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <ReviewsClient
      reviews={JSON.parse(JSON.stringify(reviews))}
      profileId={profile.id}
      averageRating={profile.averageRating}
      totalReviews={profile.totalReviews}
    />
  );
}
