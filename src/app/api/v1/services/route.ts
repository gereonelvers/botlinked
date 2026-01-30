import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { ok, err } from "@/lib/api";
import { requireAgent } from "@/lib/requireAuth";

const createServiceSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(5000),
  category: z.string().min(1).max(50),
  suggested_tip: z.number().min(0),
});

// POST /api/v1/services - Create a new service
export async function POST(req: NextRequest) {
  const { agent, response } = await requireAgent(req);
  if (!agent) return response;

  let body;
  try {
    body = await req.json();
  } catch {
    return err("Invalid JSON body", "Send valid JSON", 400);
  }

  const parsed = createServiceSchema.safeParse(body);
  if (!parsed.success) {
    return err("Validation failed", parsed.error.issues.map((i) => i.message).join(", "), 400);
  }

  const { title, description, category, suggested_tip } = parsed.data;

  const service = await prisma.service.create({
    data: {
      agentId: agent.id,
      title,
      description,
      category: category.toLowerCase(),
      suggestedTip: suggested_tip,
    },
  });

  return ok({
    service: {
      id: service.id,
      title: service.title,
      description: service.description,
      category: service.category,
      suggested_tip: service.suggestedTip,
      is_active: service.isActive,
      created_at: service.createdAt.toISOString(),
    },
  });
}

// GET /api/v1/services - List services (with optional filters)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category")?.toLowerCase();
  const username = searchParams.get("username");
  const limitStr = searchParams.get("limit");
  const offsetStr = searchParams.get("offset");
  const search = searchParams.get("q");

  const limit = Math.min(parseInt(limitStr || "25", 10), 100);
  const offset = parseInt(offsetStr || "0", 10);

  const where: Record<string, unknown> = {
    isActive: true,
    agent: { isBanned: false },
  };

  if (category) {
    where.category = category;
  }

  if (username) {
    where.agent = { ...(where.agent as object), username };
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  const [services, total] = await Promise.all([
    prisma.service.findMany({
      where,
      include: {
        agent: {
          select: {
            username: true,
            displayName: true,
            avatarUrl: true,
            solanaAddress: true,
            reputation: { select: { score: true, rank: true } },
          },
        },
        _count: { select: { tips: true } },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    }),
    prisma.service.count({ where }),
  ]);

  return ok({
    services: services.map((s) => ({
      id: s.id,
      title: s.title,
      description: s.description,
      category: s.category,
      suggested_tip: s.suggestedTip,
      tip_count: s._count.tips,
      created_at: s.createdAt.toISOString(),
      agent: {
        username: s.agent.username,
        display_name: s.agent.displayName,
        avatar_url: s.agent.avatarUrl,
        solana_address: s.agent.solanaAddress,
        reputation_score: s.agent.reputation?.score ?? 1.0,
        reputation_rank: s.agent.reputation?.rank,
      },
    })),
    total,
    limit,
    offset,
  });
}
