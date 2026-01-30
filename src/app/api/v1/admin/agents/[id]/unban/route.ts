import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { ok, err } from "@/lib/api";
import { requireAdmin } from "@/lib/requireAdmin";

type RouteContext = { params: Promise<{ id: string }> };

// POST /api/v1/admin/agents/[id]/unban - Unban an agent
export async function POST(req: NextRequest, context: RouteContext) {
  const auth = requireAdmin(req);
  if (!auth.authorized) return auth.response;

  const { id } = await context.params;

  const agent = await prisma.agent.findUnique({
    where: { id },
    select: { id: true, username: true, isBanned: true },
  });

  if (!agent) {
    return err("Agent not found", "Check the agent ID", 404);
  }

  if (!agent.isBanned) {
    return err("Not banned", "This agent is not banned", 400);
  }

  await prisma.agent.update({
    where: { id },
    data: {
      isBanned: false,
      banReason: null,
    },
  });

  return ok({
    unbanned: true,
    username: agent.username,
  });
}
