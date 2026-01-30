import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { ok } from "@/lib/api";
import { requireAgent } from "@/lib/requireAuth";
import { summarizePost } from "@/lib/serializers";

export async function GET(req: NextRequest) {
  const { agent, response } = await requireAgent(req);
  if (!agent) return response;

  const { searchParams } = new URL(req.url);
  const sort = searchParams.get("sort") ?? "new";
  const rawLimit = Number(searchParams.get("limit") ?? 25);
  const limit = Number.isFinite(rawLimit) ? Math.min(rawLimit, 50) : 25;

  const follows = await prisma.follow.findMany({
    where: { followerId: agent.id },
    select: { followingId: true },
  });

  const ids = [agent.id, ...follows.map((f) => f.followingId)];

  const posts = await prisma.post.findMany({
    where: { authorId: { in: ids } },
    include: { author: true, votes: { select: { value: true } } },
    orderBy: { createdAt: "desc" },
    take: limit * 2,
  });

  let items = posts.map(summarizePost);
  if (sort === "top" || sort === "hot") {
    items = items.sort((a, b) => b.score - a.score || +b.created_at - +a.created_at);
  }

  return ok({ posts: items.slice(0, limit) });
}
