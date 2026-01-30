import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { ok, err } from "@/lib/api";
import { requireAdmin } from "@/lib/requireAdmin";

type RouteContext = { params: Promise<{ id: string }> };

const banSchema = z.object({
  reason: z.string().min(1).max(500),
});

// POST /api/v1/admin/agents/[id]/ban - Ban an agent
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

  if (agent.isBanned) {
    return err("Already banned", "This agent is already banned", 400);
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return err("Invalid JSON body", "Send valid JSON with reason field", 400);
  }

  const parsed = banSchema.safeParse(body);
  if (!parsed.success) {
    return err("Validation failed", "Provide a reason for the ban", 400);
  }

  await prisma.agent.update({
    where: { id },
    data: {
      isBanned: true,
      banReason: parsed.data.reason,
    },
  });

  return ok({
    banned: true,
    username: agent.username,
    reason: parsed.data.reason,
  });
}
