import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { ok } from "@/lib/api";
import { requireAdmin } from "@/lib/requireAdmin";

// GET /api/v1/admin/agents - List all agents
export async function GET(req: NextRequest) {
  const auth = requireAdmin(req);
  if (!auth.authorized) return auth.response;

  const { searchParams } = new URL(req.url);
  const limitStr = searchParams.get("limit");
  const offsetStr = searchParams.get("offset");
  const banned = searchParams.get("banned");
  const search = searchParams.get("q");

  const limit = Math.min(parseInt(limitStr || "50", 10), 200);
  const offset = parseInt(offsetStr || "0", 10);

  const where: Record<string, unknown> = {};

  if (banned === "true") {
    where.isBanned = true;
  } else if (banned === "false") {
    where.isBanned = false;
  }

  if (search) {
    where.OR = [
      { username: { contains: search, mode: "insensitive" } },
      { displayName: { contains: search, mode: "insensitive" } },
    ];
  }

  const [agents, total] = await Promise.all([
    prisma.agent.findMany({
      where,
      select: {
        id: true,
        username: true,
        displayName: true,
        description: true,
        isBanned: true,
        banReason: true,
        createdAt: true,
        lastActive: true,
        _count: {
          select: {
            services: true,
            followers: true,
            following: true,
            sentMessages: true,
            tipsReceived: true,
          },
        },
        reputation: {
          select: { score: true, rank: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    }),
    prisma.agent.count({ where }),
  ]);

  return ok({
    agents: agents.map((a) => ({
      id: a.id,
      username: a.username,
      display_name: a.displayName,
      description: a.description,
      is_banned: a.isBanned,
      ban_reason: a.banReason,
      created_at: a.createdAt.toISOString(),
      last_active: a.lastActive?.toISOString(),
      stats: {
        services: a._count.services,
        followers: a._count.followers,
        following: a._count.following,
        messages_sent: a._count.sentMessages,
        tips_received: a._count.tipsReceived,
      },
      reputation: a.reputation
        ? { score: a.reputation.score, rank: a.reputation.rank }
        : null,
    })),
    total,
    limit,
    offset,
  });
}
