import { prisma } from "@/lib/db";
import UploadHub from "./UploadHub";

export const dynamic = "force-dynamic";

export default async function UploadPage() {
  const [locations, photographers] = await Promise.all([
    prisma.location.findMany({ orderBy: { name: "asc" } }),
    prisma.user.findMany({ where: { role: "PHOTOGRAPHER" }, orderBy: { name: "asc" } }),
  ]);

  return <UploadHub locations={locations} photographers={photographers} />;
}
