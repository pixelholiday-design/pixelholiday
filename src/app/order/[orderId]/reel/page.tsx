import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { Film, Check, Download, ArrowLeft } from "lucide-react";
import ReelUpsellBanner from "@/components/gallery/ReelUpsellBanner";
import Link from "next/link";

export const dynamic = "force-dynamic";

interface Props {
  params: { orderId: string };
  searchParams: { purchased?: string; tier?: string };
}

export default async function ReelPage({ params, searchParams }: Props) {
  const order = await prisma.order.findUnique({
    where: { id: params.orderId },
    include: {
      gallery: { include: { photos: true } },
      customer: true,
    },
  });

  if (!order) return notFound();

  const photoCount = order.gallery?.photos?.length || 0;
  const justPurchased = searchParams.purchased === "true";
  const purchasedTier = searchParams.tier;

  // Reel was purchased
  if (order.reelStatus === "PURCHASED" || order.reelStatus === "DELIVERED" || justPurchased) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-lg w-full">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-navy-900 mb-2">
              {justPurchased ? "Reel Purchased!" : "Your Reel"}
            </h1>
            <p className="text-gray-600 mb-6">
              {justPurchased
                ? `Your ${purchasedTier?.toLowerCase() || ""} cinematic reel is being generated. You will receive it via email shortly.`
                : "Your cinematic reel has been created from your photos."}
            </p>

            {order.reelFullUrl && (
              <div className="mb-6">
                <video
                  src={order.reelFullUrl}
                  controls
                  className="w-full rounded-xl"
                  poster={order.reelPreviewUrl || undefined}
                />
                <a
                  href={order.reelFullUrl}
                  download
                  className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 bg-brand-500 text-white font-medium rounded-lg hover:bg-brand-600 transition"
                >
                  <Download className="w-4 h-4" />
                  Download Reel
                </a>
              </div>
            )}

            {!order.reelFullUrl && (
              <div className="p-4 bg-brand-50 rounded-xl mb-6">
                <Film className="w-8 h-8 text-brand-500 mx-auto mb-2" />
                <p className="text-sm text-brand-700">
                  Your reel is being generated. We will email you when it is ready to download.
                </p>
              </div>
            )}

            <Link
              href={
                order.gallery
                  ? `/gallery/${order.gallery.magicLinkToken}`
                  : `/order/${order.id}`
              }
              className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-navy-900 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Gallery
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Reel preview available -- show upsell
  if (order.reelStatus === "PREVIEW_READY") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
        <div className="max-w-2xl w-full space-y-6">
          <Link
            href={
              order.gallery
                ? `/gallery/${order.gallery.magicLinkToken}`
                : `/order/${order.id}`
            }
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-navy-900 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Gallery
          </Link>

          <ReelUpsellBanner orderId={order.id} photoCount={photoCount} />
        </div>
      </div>
    );
  }

  // No reel available
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <Film className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h1 className="text-xl font-bold text-navy-900 mb-2">No Reel Available</h1>
        <p className="text-gray-500 mb-6">
          Reels are automatically generated for galleries with 5 or more photos.
        </p>
        <Link
          href={`/order/${order.id}`}
          className="inline-flex items-center gap-2 text-sm text-brand-500 hover:text-brand-600 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Order
        </Link>
      </div>
    </div>
  );
}
