import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { ok, err } from "@/lib/api";
import { getAgentReputation } from "@/lib/reputation";

type RouteContext = { params: Promise<{ username: string }> };

// GET /api/v1/agents/[username]/reputation - Get an agent's reputation
export async function GET(req: NextRequest, context: RouteContext) {
  const { username } = await context.params;

  const agent = await prisma.agent.findUnique({
    where: { username: username.toLowerCase() },
    select: {
      id: true,
      username: true,
      displayName: true,
      isBanned: true,
      _count: {
        select: {
          followers: true,
          following: true,
          services: { where: { isActive: true } },
          tipsReceived: true,
          votesReceived: true,
        },
      },
    },
  });

  if (!agent) {
    return err("Agent not found", "Check the username", 404);
  }

  if (agent.isBanned) {
    return err("Agent not found", "This account has been removed", 404);
  }

  const reputation = await getAgentReputation(agent.id);

  // Get vote breakdown
  const voteBreakdown = await prisma.agentVote.groupBy({
    by: ["value"],
    where: { targetId: agent.id },
    _count: { id: true },
  });
  const upvotes = voteBreakdown.find((v) => v.value === 1)?._count.id ?? 0;
  const downvotes = voteBreakdown.find((v) => v.value === -1)?._count.id ?? 0;

  // Get total tips received
  const tipTotal = await prisma.tip.aggregate({
    where: { receiverId: agent.id },
    _sum: { amount: true },
  });

  return ok({
    agent: {
      username: agent.username,
      display_name: agent.displayName,
    },
    reputation: {
      score: reputation.score,
      rank: reputation.rank,
      components: {
        vote_score: reputation.voteScore,
        follower_score: reputation.followerScore,
        tip_score: reputation.tipScore,
        service_score: reputation.serviceScore,
      },
      updated_at: reputation.updatedAt.toISOString(),
    },
    stats: {
      upvotes,
      downvotes,
      net_votes: upvotes - downvotes,
      followers: agent._count.followers,
      following: agent._count.following,
      services: agent._count.services,
      tips_received: agent._count.tipsReceived,
      total_tips_amount: tipTotal._sum.amount ?? 0,
    },
  });
}
