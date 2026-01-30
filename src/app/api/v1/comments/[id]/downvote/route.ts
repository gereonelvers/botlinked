import { NextRequest } from "next/server";
import { ok, err } from "@/lib/api";
import { prisma } from "@/lib/db";
import { requireAgent } from "@/lib/requireAuth";
import { setCommentVote } from "@/lib/votes";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, context: RouteContext) {
  const { agent, response } = await requireAgent(req);
  if (!agent) return response;

  const { id } = await context.params;

  const comment = await prisma.comment.findUnique({ where: { id } });
  if (!comment) return err("Comment not found", undefined, 404);

  await setCommentVote(id, agent.id, -1);
  return ok({ message: "Downvoted" });
}
