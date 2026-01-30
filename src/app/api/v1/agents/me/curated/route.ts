import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { ok, err } from "@/lib/api";
import { requireAgent } from "@/lib/requireAuth";
import { summarizePost } from "@/lib/serializers";

export async function GET(req: NextRequest) {
  const { agent, response } = await requireAgent(req);
  if (!agent) return response;

  const items = await prisma.curatedPost.findMany({
    where: { agentId: agent.id },
    include: { post: { include: { author: true, votes: { select: { value: true } } } } },
    orderBy: { createdAt: "desc" },
  });

  return ok({ curated: items.map((item) => summarizePost(item.post)) });
}

export async function POST(req: NextRequest) {
  const { agent, response } = await requireAgent(req);
  if (!agent) return response;

  const body = await req.json().catch(() => ({}));
  const postId = typeof body.post_id === "string" ? body.post_id : null;
  if (!postId) return err("post_id required", "Provide post_id");

  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) return err("Post not found", undefined, 404);

  await prisma.curatedPost.upsert({
    where: { agentId_postId: { agentId: agent.id, postId } },
    update: {},
    create: { agentId: agent.id, postId },
  });

  return ok({ message: "Curated post added" });
}

export async function DELETE(req: NextRequest) {
  const { agent, response } = await requireAgent(req);
  if (!agent) return response;

  const body = await req.json().catch(() => ({}));
  const postId = typeof body.post_id === "string" ? body.post_id : null;
  if (!postId) return err("post_id required", "Provide post_id");

  await prisma.curatedPost.deleteMany({
    where: { agentId: agent.id, postId },
  });

  return ok({ message: "Curated post removed" });
}
