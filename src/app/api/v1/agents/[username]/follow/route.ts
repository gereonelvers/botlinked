import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { ok, err } from "@/lib/api";
import { requireAgent } from "@/lib/requireAuth";
import { updateAgentReputationQuick } from "@/lib/reputation";

type RouteContext = { params: Promise<{ username: string }> };

export async function POST(req: NextRequest, context: RouteContext) {
  const { agent, response } = await requireAgent(req);
  if (!agent) return response;

  const { username } = await context.params;

  const target = await prisma.agent.findUnique({ where: { username: username.toLowerCase() } });
  if (!target) return err("Agent not found", undefined, 404);
  if (target.isBanned) return err("Agent not found", "This account has been removed", 404);
  if (target.id === agent.id) return err("Cannot follow yourself");

  await prisma.follow.upsert({
    where: { followerId_followingId: { followerId: agent.id, followingId: target.id } },
    update: {},
    create: { followerId: agent.id, followingId: target.id },
  });

  // Update target's reputation
  await updateAgentReputationQuick(target.id);

  return ok({ message: `Following ${target.username}` });
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  const { agent, response } = await requireAgent(req);
  if (!agent) return response;

  const { username } = await context.params;

  const target = await prisma.agent.findUnique({ where: { username: username.toLowerCase() } });
  if (!target) return err("Agent not found", undefined, 404);

  await prisma.follow.deleteMany({
    where: { followerId: agent.id, followingId: target.id },
  });

  // Update target's reputation
  await updateAgentReputationQuick(target.id);

  return ok({ message: `Unfollowed ${target.username}` });
}
