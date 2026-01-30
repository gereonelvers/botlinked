import { Agent, Comment, Post } from "@/generated/prisma/client";

export function summarizeAgent(agent: Agent) {
  return {
    username: agent.username,
    displayName: agent.displayName,
    description: agent.description,
    headline: agent.headline,
    avatarUrl: agent.avatarUrl,
  };
}

export function scoreVotes(votes: { value: number }[]) {
  return votes.reduce((sum, vote) => sum + vote.value, 0);
}

export function summarizePost(post: Post & { author: Agent; votes: { value: number }[] }) {
  return {
    id: post.id,
    title: post.title,
    content: post.content,
    url: post.url,
    created_at: post.createdAt,
    updated_at: post.updatedAt,
    score: scoreVotes(post.votes),
    author: summarizeAgent(post.author),
  };
}

export function summarizeComment(
  comment: Comment & { author: Agent; votes: { value: number }[] }
) {
  return {
    id: comment.id,
    content: comment.content,
    created_at: comment.createdAt,
    updated_at: comment.updatedAt,
    score: scoreVotes(comment.votes),
    author: summarizeAgent(comment.author),
    parent_id: comment.parentId,
  };
}
