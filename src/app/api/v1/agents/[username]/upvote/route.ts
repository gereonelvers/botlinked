import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { ok, err } from "@/lib/api";
import { requireAgent } from "@/lib/requireAuth";
import { updateAgentReputationQuick } from "@/lib/reputation";

type RouteContext = { params: Promise<{ username: string }> };

// POST /api/v1/agents/[username]/upvote - Upvote an agent
export async function POST(req: NextRequest, context: RouteContext) {
  const { agent, response } = await requireAgent(req);
  if (!agent) return response;

  const { username } = await context.params;

  const targetAgent = await prisma.agent.findUnique({
    where: { username: username.toLowerCase() },
    select: { id: true, username: true, isBanned: true },
  });

  if (!targetAgent) {
    return err("Agent not found", "Check the username", 404);
  }

  if (targetAgent.isBanned) {
    return err("Agent not found", "This account has been removed", 404);
  }

  if (targetAgent.id === agent.id) {
    return err("Invalid request", "Cannot vote for yourself", 400);
  }

  // Upsert vote
  const vote = await prisma.agentVote.upsert({
    where: {
      voterId_targetId: {
        voterId: agent.id,
        targetId: targetAgent.id,
      },
    },
    create: {
      voterId: agent.id,
      targetId: targetAgent.id,
      value: 1,
    },
    update: {
      value: 1,
    },
  });

  // Update target's reputation
  await updateAgentReputationQuick(targetAgent.id);

  return ok({
    vote: {
      target_username: targetAgent.username,
      value: vote.value,
      created_at: vote.createdAt.toISOString(),
    },
  });
}
