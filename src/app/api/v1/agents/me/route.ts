import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { ok, err } from "@/lib/api";
import { requireAgent } from "@/lib/requireAuth";
import { getAgentReputation } from "@/lib/reputation";

export async function GET(req: NextRequest) {
  const { agent, response } = await requireAgent(req);
  if (!agent) return response;

  const full = await prisma.agent.findUnique({
    where: { id: agent.id },
    include: {
      owner: true,
      _count: {
        select: {
          followers: true,
          following: true,
          services: { where: { isActive: true } },
          tipsReceived: true,
          tipsSent: true,
        },
      },
    },
  });

  if (!full) return err("Agent not found", undefined, 404);

  const reputation = await getAgentReputation(agent.id);

  // Update last active
  await prisma.agent.update({
    where: { id: agent.id },
    data: { lastActive: new Date() },
  });

  return ok({
    agent: {
      username: full.username,
      display_name: full.displayName,
      description: full.description,
      headline: full.headline,
      cv: full.cv,
      website_url: full.websiteUrl,
      avatar_url: full.avatarUrl,
      banner_url: full.bannerUrl,
      solana_address: full.solanaAddress,
      is_claimed: full.isClaimed,
      created_at: full.createdAt.toISOString(),
      last_active: full.lastActive?.toISOString(),
      follower_count: full._count.followers,
      following_count: full._count.following,
      service_count: full._count.services,
      tips_received_count: full._count.tipsReceived,
      tips_sent_count: full._count.tipsSent,
      reputation: {
        score: reputation.score,
        rank: reputation.rank,
      },
      owner: full.owner
        ? {
            name: full.owner.name,
            x_handle: full.owner.xHandle,
            x_verified: full.owner.xVerified,
          }
        : null,
    },
  });
}

export async function PATCH(req: NextRequest) {
  const { agent, response } = await requireAgent(req);
  if (!agent) return response;

  const body = await req.json().catch(() => ({}));

  // Build update data with type safety
  const data: Record<string, string | undefined> = {};

  if (typeof body.description === "string") data.description = body.description;
  if (typeof body.headline === "string") data.headline = body.headline;
  if (typeof body.cv === "string") data.cv = body.cv;
  if (typeof body.website_url === "string") data.websiteUrl = body.website_url;
  if (typeof body.websiteUrl === "string") data.websiteUrl = body.websiteUrl; // Also accept camelCase
  if (typeof body.avatar_url === "string") data.avatarUrl = body.avatar_url;
  if (typeof body.avatarUrl === "string") data.avatarUrl = body.avatarUrl;
  if (typeof body.banner_url === "string") data.bannerUrl = body.banner_url;
  if (typeof body.bannerUrl === "string") data.bannerUrl = body.bannerUrl;
  if (typeof body.solana_address === "string") data.solanaAddress = body.solana_address;
  if (typeof body.solanaAddress === "string") data.solanaAddress = body.solanaAddress;
  if (typeof body.display_name === "string") data.displayName = body.display_name;
  if (typeof body.displayName === "string") data.displayName = body.displayName;

  const updated = await prisma.agent.update({
    where: { id: agent.id },
    data,
  });

  return ok({
    agent: {
      username: updated.username,
      display_name: updated.displayName,
      description: updated.description,
      headline: updated.headline,
      cv: updated.cv,
      website_url: updated.websiteUrl,
      avatar_url: updated.avatarUrl,
      banner_url: updated.bannerUrl,
      solana_address: updated.solanaAddress,
    },
  });
}
