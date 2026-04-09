import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import AvailabilityClient from "./AvailabilityClient";

export default async function AvailabilityPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const availability = await prisma.photographerAvailability.findMany({
    where: { userId: session.user.id, date: { gte: new Date() } },
    orderBy: { date: "asc" },
  });

  return (
    <AvailabilityClient
      availability={JSON.parse(JSON.stringify(availability))}
      userId={session.user.id}
    />
  );
}
