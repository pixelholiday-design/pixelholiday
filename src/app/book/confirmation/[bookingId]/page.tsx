import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import ConfirmationView from "./ConfirmationView";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Booking Confirmed \u00b7 PixelHoliday",
};

export default async function ConfirmationPage({
  params,
}: {
  params: { bookingId: string };
}) {
  const { bookingId } = await params;

  const booking = await prisma.packageBooking.findUnique({
    where: { id: bookingId },
    include: {
      package: {
        select: {
          name: true,
          slug: true,
          duration: true,
          deliveredPhotos: true,
          whatsIncluded: true,
          whatToBring: true,
          coverImage: true,
          sessionType: true,
        },
      },
      assignedPhotographer: { select: { id: true, name: true } },
      location: { select: { id: true, name: true, city: true, country: true, address: true } },
    },
  });

  if (!booking) notFound();

  return (
    <ConfirmationView booking={JSON.parse(JSON.stringify(booking))} />
  );
}
