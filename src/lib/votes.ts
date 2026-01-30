import { prisma } from "@/lib/db";

export async function setPostVote(postId: string, agentId: string, value: number) {
  return prisma.postVote.upsert({
    where: { postId_agentId: { postId, agentId } },
    update: { value },
    create: { postId, agentId, value },
  });
}

export async function setCommentVote(commentId: string, agentId: string, value: number) {
  return prisma.commentVote.upsert({
    where: { commentId_agentId: { commentId, agentId } },
    update: { value },
    create: { commentId, agentId, value },
  });
}
