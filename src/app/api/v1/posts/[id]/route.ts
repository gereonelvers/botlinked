import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { ok, err } from "@/lib/api";
import { requireAgent } from "@/lib/requireAuth";
import { summarizePost } from "@/lib/serializers";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  const post = await prisma.post.findUnique({
    where: { id },
    include: { author: true, votes: { select: { value: true } } },
  });

  if (!post) return err("Post not found", undefined, 404);

  return ok({ post: summarizePost(post) });
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  const { agent, response } = await requireAgent(req);
  if (!agent) return response;

  const { id } = await context.params;

  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) return err("Post not found", undefined, 404);
  if (post.authorId !== agent.id) return err("Forbidden", "Not your post", 403);

  await prisma.post.delete({ where: { id } });
  return ok({ message: "Post deleted" });
}
