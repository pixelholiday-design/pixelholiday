import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { evaluateSuggestion } from "@/lib/suggestion-ai";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const submitSchema = z.object({
  content: z.string().min(5).max(2000),
  category: z.string().optional(),
  page: z.string().optional(),
  product: z.string().optional(),
  name: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
});

/** POST /api/suggestions — Submit a suggestion (public, no auth required) */
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const parsed = submitSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  }
  const data = parsed.data;

  // Get session if logged in
  const session = await getServerSession(authOptions).catch(() => null);
  const userId = (session?.user as any)?.id || null;
  const userRole = (session?.user as any)?.role || "VISITOR";

  // AI evaluation
  const evaluation = await evaluateSuggestion({
    content: data.content,
    page: data.page,
    product: data.product,
    userRole,
  });

  // Create suggestion record
  const suggestion = await prisma.suggestion.create({
    data: {
      content: data.content,
      category: (evaluation.category as any) || "FEATURE",
      page: data.page,
      product: data.product,
      userId,
      customerEmail: data.email || null,
      customerName: data.name || (session?.user?.name) || null,
      userRole,
      aiEvaluation: JSON.stringify(evaluation),
      aiSummary: evaluation.summary,
      impactScore: evaluation.impactScore,
      feasibility: evaluation.feasibilityScore,
      priorityScore: evaluation.priorityScore,
      isDuplicate: evaluation.isDuplicate,
      status: "AI_REVIEWED",
      responseToUser: evaluation.responseToUser,
      respondedAt: new Date(),
    },
  });

  return NextResponse.json({
    ok: true,
    id: suggestion.id,
    evaluation: {
      category: evaluation.category,
      impactScore: evaluation.impactScore,
      feasibilityScore: evaluation.feasibilityScore,
      priorityScore: evaluation.priorityScore,
      summary: evaluation.summary,
    },
    responseToUser: evaluation.responseToUser,
    status: suggestion.status,
  });
}

/** GET /api/suggestions — List suggestions (admin or public roadmap) */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const category = searchParams.get("category");
  const product = searchParams.get("product");
  const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);

  const where: any = {};
  if (status) where.status = status;
  if (category) where.category = category;
  if (product) where.product = product;

  const suggestions = await prisma.suggestion.findMany({
    where,
    orderBy: { priorityScore: "desc" },
    take: limit,
    select: {
      id: true,
      content: true,
      category: true,
      product: true,
      page: true,
      customerName: true,
      userRole: true,
      impactScore: true,
      feasibility: true,
      priorityScore: true,
      status: true,
      autoImplemented: true,
      responseToUser: true,
      aiSummary: true,
      upvotes: true,
      createdAt: true,
    },
  });

  const stats = {
    total: await prisma.suggestion.count(),
    new: await prisma.suggestion.count({ where: { status: "NEW" } }),
    aiReviewed: await prisma.suggestion.count({ where: { status: "AI_REVIEWED" } }),
    autoApplied: await prisma.suggestion.count({ where: { status: "AUTO_APPLIED" } }),
    inProgress: await prisma.suggestion.count({ where: { status: "IN_PROGRESS" } }),
    completed: await prisma.suggestion.count({ where: { status: "COMPLETED" } }),
  };

  return NextResponse.json({ suggestions, stats });
}
