import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendWhatsAppMessage } from "@/lib/whatsapp";

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();
    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const phone = user.phone;
    if (!phone) {
      return NextResponse.json({ error: "Photographer has no phone/WhatsApp on file." }, { status: 400 });
    }

    // Fetch skill profile
    const profile = await prisma.photographerSkillProfile.findUnique({ where: { userId } }).catch(() => null);
    const report = await prisma.weeklySkillReport.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
    }).catch(() => null);

    let body = `Hi ${user.name}! Here is your Pixelvo weekly coaching report.\n\n`;

    if (profile) {
      const avg = Math.round(
        (profile.individualPoses + profile.couplePoses + profile.familyPoses +
          profile.kidsPoses + profile.actionPoses + profile.portraitPoses) / 6
      );
      body += `Skill Score: ${avg}/100\n`;
      body += `Portrait: ${profile.portraitPoses} | Family: ${profile.familyPoses} | Kids: ${profile.kidsPoses}\n\n`;
    }

    if (report) {
      body += `Score: ${report.avgOverallScore}/100 (${report.scoreChange >= 0 ? "+" : ""}${report.scoreChange} vs last week)\n`;
      if (report.strengths) body += `Strengths: ${report.strengths}\n`;
      if (report.improvements) body += `\nAreas to improve: ${report.improvements}\n`;
      if (report.recommendations) body += `\nRecommendations: ${report.recommendations}\n`;
    }

    body += `\n\nKeep up the great work! — Pixelvo AI Coach`;

    const result = await sendWhatsAppMessage(phone, body);
    return NextResponse.json({ ok: true, result });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed" }, { status: 500 });
  }
}
