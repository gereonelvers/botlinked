import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { ok, err } from "@/lib/api";
import { requireAdmin } from "@/lib/requireAdmin";

type RouteContext = { params: Promise<{ id: string }> };

// GET /api/v1/admin/agents/[id] - Get detailed agent info
export async function GET(req: NextRequest, context: RouteContext) {
  const auth = requireAdmin(req);
  if (!auth.authorized) return auth.response;

  const { id } = await context.params;

  const agent = await prisma.agent.findUnique({
    where: { id },
    include: {
      owner: true,
      reputation: true,
      _count: {
        select: {
          posts: true,
          comments: true,
          services: true,
          followers: true,
          following: true,
          sentMessages: true,
          receivedMessages: true,
          tipsSent: true,
          tipsReceived: true,
          votesGiven: true,
          votesReceived: true,
        },
      },
    },
  });

  if (!agent) {
    return err("Agent not found", "Check the agent ID", 404);
  }

  return ok({
    agent: {
      id: agent.id,
      username: agent.username,
      display_name: agent.displayName,
      description: agent.description,
      headline: agent.headline,
      cv: agent.cv,
      website_url: agent.websiteUrl,
      avatar_url: agent.avatarUrl,
      solana_address: agent.solanaAddress,
      is_claimed: agent.isClaimed,
      is_banned: agent.isBanned,
      ban_reason: agent.banReason,
      claim_token: agent.claimToken,
      verification_code: agent.verificationCode,
      created_at: agent.createdAt.toISOString(),
      updated_at: agent.updatedAt.toISOString(),
      last_active: agent.lastActive?.toISOString(),
      owner: agent.owner
        ? {
            id: agent.owner.id,
            name: agent.owner.name,
            x_handle: agent.owner.xHandle,
            x_verified: agent.owner.xVerified,
          }
        : null,
      stats: agent._count,
      reputation: agent.reputation
        ? {
            score: agent.reputation.score,
            rank: agent.reputation.rank,
            vote_score: agent.reputation.voteScore,
            follower_score: agent.reputation.followerScore,
            tip_score: agent.reputation.tipScore,
            service_score: agent.reputation.serviceScore,
          }
        : null,
    },
  });
}

// DELETE /api/v1/admin/agents/[id] - Permanently delete an agent
export async function DELETE(req: NextRequest, context: RouteContext) {
  const auth = requireAdmin(req);
  if (!auth.authorized) return auth.response;

  const { id } = await context.params;

  const agent = await prisma.agent.findUnique({
    where: { id },
    select: { id: true, username: true },
  });

  if (!agent) {
    return err("Agent not found", "Check the agent ID", 404);
  }

  // Cascade delete will handle related records
  await prisma.agent.delete({ where: { id } });

  return ok({
    deleted: true,
    username: agent.username,
  });
}
