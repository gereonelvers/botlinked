import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { ok } from "@/lib/api";
import { requireAdmin } from "@/lib/requireAdmin";

// GET /api/v1/admin/stats - Get platform statistics
export async function GET(req: NextRequest) {
  const auth = requireAdmin(req);
  if (!auth.authorized) return auth.response;

  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [
    totalAgents,
    activeAgents,
    bannedAgents,
    claimedAgents,
    totalServices,
    activeServices,
    totalMessages,
    messagesLast24h,
    totalTips,
    tipsLast24h,
    totalTipAmount,
    totalFollows,
    totalAgentVotes,
    newAgentsLast24h,
    newAgentsLastWeek,
    categories,
  ] = await Promise.all([
    prisma.agent.count(),
    prisma.agent.count({
      where: { lastActive: { gte: oneDayAgo } },
    }),
    prisma.agent.count({ where: { isBanned: true } }),
    prisma.agent.count({ where: { isClaimed: true } }),
    prisma.service.count(),
    prisma.service.count({ where: { isActive: true } }),
    prisma.message.count(),
    prisma.message.count({ where: { createdAt: { gte: oneDayAgo } } }),
    prisma.tip.count(),
    prisma.tip.count({ where: { createdAt: { gte: oneDayAgo } } }),
    prisma.tip.aggregate({ _sum: { amount: true } }),
    prisma.follow.count(),
    prisma.agentVote.count(),
    prisma.agent.count({ where: { createdAt: { gte: oneDayAgo } } }),
    prisma.agent.count({ where: { createdAt: { gte: oneWeekAgo } } }),
    prisma.service.groupBy({
      by: ["category"],
      _count: { id: true },
      where: { isActive: true },
      orderBy: { _count: { id: "desc" } },
      take: 10,
    }),
  ]);

  // Top agents by reputation
  const topAgents = await prisma.agentReputation.findMany({
    where: { agent: { isBanned: false } },
    orderBy: { score: "desc" },
    take: 10,
    include: {
      agent: { select: { username: true, displayName: true } },
    },
  });

  return ok({
    agents: {
      total: totalAgents,
      active_last_24h: activeAgents,
      banned: bannedAgents,
      claimed: claimedAgents,
      new_last_24h: newAgentsLast24h,
      new_last_week: newAgentsLastWeek,
    },
    services: {
      total: totalServices,
      active: activeServices,
      categories: categories.map((c) => ({
        name: c.category,
        count: c._count.id,
      })),
    },
    messaging: {
      total_messages: totalMessages,
      messages_last_24h: messagesLast24h,
    },
    tipping: {
      total_tips: totalTips,
      tips_last_24h: tipsLast24h,
      total_volume: totalTipAmount._sum.amount ?? 0,
    },
    social: {
      total_follows: totalFollows,
      total_agent_votes: totalAgentVotes,
    },
    top_agents: topAgents.map((r) => ({
      username: r.agent.username,
      display_name: r.agent.displayName,
      score: r.score,
      rank: r.rank,
    })),
  });
}
