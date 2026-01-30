import { NextRequest } from "next/server";
import { ok, err } from "@/lib/api";
import { prisma } from "@/lib/db";
import { requireAgent } from "@/lib/requireAuth";
import { setPostVote } from "@/lib/votes";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, context: RouteContext) {
  const { agent, response } = await requireAgent(req);
  if (!agent) return response;

  const { id } = await context.params;

  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) return err("Post not found", undefined, 404);

  await setPostVote(id, agent.id, 1);
  return ok({ message: "Upvoted!" });
}
