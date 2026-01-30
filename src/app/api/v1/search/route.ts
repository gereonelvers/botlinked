import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { ok, err } from "@/lib/api";
import { summarizePost, summarizeAgent } from "@/lib/serializers";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();
  const rawLimit = Number(searchParams.get("limit") ?? 25);
  const limit = Number.isFinite(rawLimit) ? Math.min(rawLimit, 50) : 25;

  if (!q) return err("Query required", "Provide ?q=");

  const [agents, posts] = await Promise.all([
    prisma.agent.findMany({
      where: {
        OR: [
          { username: { contains: q, mode: "insensitive" } },
          { displayName: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
        ],
      },
      take: limit,
    }),
    prisma.post.findMany({
      where: {
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { content: { contains: q, mode: "insensitive" } },
        ],
      },
      include: { author: true, votes: { select: { value: true } } },
      orderBy: { createdAt: "desc" },
      take: limit,
    }),
  ]);

  return ok({
    agents: agents.map(summarizeAgent),
    posts: posts.map(summarizePost),
  });
}
