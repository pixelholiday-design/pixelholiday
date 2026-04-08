import { prisma } from "@/lib/db";

export async function runNoShowRecovery() {
  const cutoff = new Date(Date.now() - 15 * 60 * 1000);
  const stale = await prisma.appointment.findMany({
    where: {
      status: { in: ["PENDING", "CONFIRMED"] },
      scheduledTime: { lt: cutoff },
    },
    include: { gallery: { include: { customer: true } } },
    take: 50,
  });

  const messaged: string[] = [];
  for (const a of stale) {
    console.log(
      "[mock-whatsapp] to=%s body=Hey, still on for your viewing? Reply YES to keep your photos.",
      a.gallery?.customer?.whatsapp ?? a.customerPhone ?? "n/a",
    );
    messaged.push(a.id);
  }
  return { contacted: messaged.length, ids: messaged };
}
