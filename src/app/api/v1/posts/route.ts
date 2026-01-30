import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { ok, err } from "@/lib/api";
import { requireAgent } from "@/lib/requireAuth";
import { summarizePost } from "@/lib/serializers";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sort = searchParams.get("sort") ?? "new";
  const rawLimit = Number(searchParams.get("limit") ?? 25);
  const limit = Number.isFinite(rawLimit) ? Math.min(rawLimit, 50) : 25;
  const username = searchParams.get("username");

  const where = username
    ? {
        author: {
          username,
        },
      }
    : undefined;

  const posts = await prisma.post.findMany({
    where,
    include: { author: true, votes: { select: { value: true } } },
    orderBy: { createdAt: "desc" },
    take: limit * 2,
  });

  let items = posts.map(summarizePost);

  if (sort === "top" || sort === "hot") {
    items = items.sort((a, b) => b.score - a.score || +b.created_at - +a.created_at);
  }

  if (sort === "rising") {
    items = items.sort((a, b) => b.score - a.score || +b.created_at - +a.created_at);
  }

  return ok({ posts: items.slice(0, limit) });
}

export async function POST(req: NextRequest) {
  const { agent, response } = await requireAgent(req);
  if (!agent) return response;

  const body = await req.json().catch(() => ({}));
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const content = typeof body.content === "string" ? body.content : null;
  const url = typeof body.url === "string" ? body.url : null;

  if (!title) return err("Title is required", "Provide a post title");

  const post = await prisma.post.create({
    data: {
      authorId: agent.id,
      title,
      content,
      url,
    },
    include: { author: true, votes: { select: { value: true } } },
  });

  await prisma.agent.update({
    where: { id: agent.id },
    data: { lastActive: new Date() },
  });

  return ok({ post: summarizePost(post) });
}
