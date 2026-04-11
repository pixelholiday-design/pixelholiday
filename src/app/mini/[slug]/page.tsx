import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import MiniSessionBooking from "./MiniSessionBooking";

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const session = await prisma.miniSession.findFirst({
    where: { slug: params.slug, isPublished: true },
  });
  if (!session) return { title: "Mini Session Not Found" };
  return {
    title: `${session.title} — Book Your Session`,
    description: session.description || `Book a ${session.slotDuration}-minute photo session`,
    openGraph: {
      title: session.title,
      description: session.description || undefined,
      images: session.coverImage ? [session.coverImage] : [],
    },
  };
}

export default async function MiniSessionPage({ params }: Props) {
  const session = await prisma.miniSession.findFirst({
    where: { slug: params.slug, isPublished: true },
    include: {
      bookings: { select: { slotTime: true } },
    },
  });

  if (!session) notFound();

  // Generate available time slots from HH:MM strings
  const [startH, startM] = session.startTime.split(":").map(Number);
  const [endH, endM] = session.endTime.split(":").map(Number);
  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;
  const bookedSet = new Set(session.bookings.map((b) => b.slotTime));

  const slots: { time: string; iso: string; available: boolean }[] = [];
  for (let m = startMinutes; m + session.slotDuration <= endMinutes; m += session.slotDuration) {
    const h = Math.floor(m / 60);
    const min = m % 60;
    const timeStr = `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
    const ampm = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 || 12;
    slots.push({
      time: `${h12}:${String(min).padStart(2, "0")} ${ampm}`,
      iso: timeStr,
      available: !bookedSet.has(timeStr),
    });
  }

  return (
    <div className="min-h-screen bg-cream-50">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-cream-200 overflow-hidden">
          {session.coverImage && (
            <img src={session.coverImage} alt={session.title} className="w-full h-64 object-cover" />
          )}
          <div className="p-8">
            <h1 className="text-3xl font-bold text-navy-900 mb-2">{session.title}</h1>
            <div className="flex items-center gap-4 text-sm text-navy-500 mb-4">
              <span>{new Date(session.date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</span>
              <span>{session.slotDuration} min</span>
              {session.location && <span>{session.location}</span>}
            </div>
            {session.description && (
              <p className="text-navy-600 mb-6">{session.description}</p>
            )}
            <div className="text-2xl font-bold text-brand-600 mb-8">
              {session.currency === "EUR" ? "€" : "$"}{session.price}
            </div>

            <MiniSessionBooking
              sessionId={session.id}
              slug={session.slug}
              slots={slots}
              price={session.price}
              currency={session.currency}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
