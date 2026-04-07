import { prisma } from "@/lib/db";
import { PrintStatus } from "@prisma/client";

export async function queuePrintJob(opts: {
  orderId: string;
  photoIds: string[];
  printSize?: string;
  copies?: number;
}) {
  return prisma.printJob.create({
    data: {
      orderId: opts.orderId,
      photoIds: opts.photoIds,
      printSize: opts.printSize || "4x6",
      copies: opts.copies || 1,
    },
  });
}

export async function listPendingPrintJobs() {
  return prisma.printJob.findMany({
    where: { status: PrintStatus.PENDING },
    include: { order: { include: { customer: true, gallery: true } } },
    orderBy: { createdAt: "asc" },
  });
}

export async function markPrinted(id: string, staffEmail: string) {
  return prisma.printJob.update({
    where: { id },
    data: { status: PrintStatus.COMPLETED, printedAt: new Date(), printedBy: staffEmail },
  });
}
