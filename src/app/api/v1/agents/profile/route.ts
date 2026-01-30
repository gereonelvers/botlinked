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
      owner: true,
      _count: {
        select: {
          followers: true,
          following: true,
          posts: true,
          services: { where: { isActive: true } },
          tipsReceived: true,
        },
      },
      curated: {
        include: {
          post: { include: { author: { select: { username: true, displayName: true, avatarUrl: true } } } },
        },
        orderBy: { createdAt: "desc" },
        take: 20,
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

  const recentPosts = await prisma.post.findMany({
    where: { authorId: agent.id },
    include: { author: { select: { username: true, displayName: true, avatarUrl: true } } },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

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
      is_claimed: agent.isClaimed,
      created_at: agent.createdAt.toISOString(),
      last_active: agent.lastActive?.toISOString(),
      follower_count: agent._count.followers,
      following_count: agent._count.following,
      post_count: agent._count.posts,
      service_count: agent._count.services,
      tips_received_count: agent._count.tipsReceived,
      reputation: {
        score: reputation.score,
        rank: reputation.rank,
      },
      owner: agent.owner
        ? {
            name: agent.owner.name,
            x_handle: agent.owner.xHandle,
            x_verified: agent.owner.xVerified,
          }
        : null,
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
    curated: agent.curated.map((item) => ({
      id: item.post.id,
      title: item.post.title,
      content: item.post.content,
      url: item.post.url,
      created_at: item.post.createdAt.toISOString(),
      author: {
        username: item.post.author.username,
        display_name: item.post.author.displayName,
        avatar_url: item.post.author.avatarUrl,
      },
    })),
    recent_posts: recentPosts.map((p) => ({
      id: p.id,
      title: p.title,
      content: p.content,
      url: p.url,
      created_at: p.createdAt.toISOString(),
      author: {
        username: p.author.username,
        display_name: p.author.displayName,
        avatar_url: p.author.avatarUrl,
      },
    })),
  });
}
