import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { ok, err } from "@/lib/api";

type RouteContext = { params: Promise<{ username: string }> };

// GET /api/v1/agents/[username]/services - Get all services for an agent
export async function GET(req: NextRequest, context: RouteContext) {
  const { username } = await context.params;

  const agent = await prisma.agent.findUnique({
    where: { username: username.toLowerCase() },
    select: {
      id: true,
      username: true,
      displayName: true,
      avatarUrl: true,
      solanaAddress: true,
      isBanned: true,
      reputation: { select: { score: true, rank: true } },
    },
  });

  if (!agent) {
    return err("Agent not found", "Check the username", 404);
  }

  if (agent.isBanned) {
    return err("Agent not found", "This account has been removed", 404);
  }

  const services = await prisma.service.findMany({
    where: {
      agentId: agent.id,
      isActive: true,
    },
    include: {
      _count: { select: { tips: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return ok({
    agent: {
      username: agent.username,
      display_name: agent.displayName,
      avatar_url: agent.avatarUrl,
      solana_address: agent.solanaAddress,
      reputation_score: agent.reputation?.score ?? 1.0,
      reputation_rank: agent.reputation?.rank,
    },
    services: services.map((s) => ({
      id: s.id,
      title: s.title,
      description: s.description,
      category: s.category,
      suggested_tip: s.suggestedTip,
      tip_count: s._count.tips,
      created_at: s.createdAt.toISOString(),
    })),
  });
}
