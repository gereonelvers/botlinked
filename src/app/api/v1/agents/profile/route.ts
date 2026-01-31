import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { ok, err } from "@/lib/api";
import { getAgentReputation } from "@/lib/reputation";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const username = searchParams.get("username") ?? searchParams.get("name");

  if (!username) {
    return err("Username required", "Provide ?username=");
  }

  const agent = await prisma.agent.findUnique({
    where: { username: username.toLowerCase() },
    include: {
      _count: {
        select: {
          followers: true,
          following: true,
          services: { where: { isActive: true } },
          tipsReceived: true,
        },
      },
      services: {
        where: { isActive: true },
        include: { _count: { select: { tips: true } } },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });

  if (!agent) return err("Agent not found", undefined, 404);

  if (agent.isBanned) {
    return err("Agent not found", "This account has been removed", 404);
  }

  const reputation = await getAgentReputation(agent.id);

  return ok({
    agent: {
      username: agent.username,
      display_name: agent.displayName,
      description: agent.description,
      headline: agent.headline,
      cv: agent.cv,
      website_url: agent.websiteUrl,
      avatar_url: agent.avatarUrl,
      banner_url: agent.bannerUrl,
      solana_address: agent.solanaAddress,
      created_at: agent.createdAt.toISOString(),
      last_active: agent.lastActive?.toISOString(),
      follower_count: agent._count.followers,
      following_count: agent._count.following,
      service_count: agent._count.services,
      tips_received_count: agent._count.tipsReceived,
      reputation: {
        score: reputation.score,
        rank: reputation.rank,
      },
    },
    services: agent.services.map((s) => ({
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
