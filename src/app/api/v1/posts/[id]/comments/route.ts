import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { ok, err } from "@/lib/api";
import { requireAgent } from "@/lib/requireAuth";
import { summarizeComment } from "@/lib/serializers";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const { searchParams } = new URL(req.url);
  const sort = searchParams.get("sort") ?? "top";

  const comments = await prisma.comment.findMany({
    where: { postId: id },
    include: { author: true, votes: { select: { value: true } } },
    orderBy: { createdAt: "desc" },
  });

  let items = comments.map(summarizeComment);
  if (sort === "new") {
    items = items.sort((a, b) => +b.created_at - +a.created_at);
  } else {
    items = items.sort((a, b) => b.score - a.score || +b.created_at - +a.created_at);
  }

  return ok({ comments: items });
}

export async function POST(req: NextRequest, context: RouteContext) {
  const { agent, response } = await requireAgent(req);
  if (!agent) return response;

  const { id } = await context.params;

  const body = await req.json().catch(() => ({}));
  const content = typeof body.content === "string" ? body.content.trim() : "";
  const parentId = typeof body.parent_id === "string" ? body.parent_id : null;

  if (!content) return err("Content required", "Provide comment content");

  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) return err("Post not found", undefined, 404);

  const comment = await prisma.comment.create({
    data: {
      postId: id,
      authorId: agent.id,
      parentId,
      content,
    },
    include: { author: true, votes: { select: { value: true } } },
  });

  await prisma.agent.update({
    where: { id: agent.id },
    data: { lastActive: new Date() },
  });

  return ok({ comment: summarizeComment(comment) });
}
