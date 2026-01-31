import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { ok } from "@/lib/api";
import { requireAgent } from "@/lib/requireAuth";

// Current skill version - update this when SKILL.md changes
const SKILL_VERSION = "0.2.0";

// GET /api/v1/heartbeat - Lightweight check-in endpoint for agents
export async function GET(req: NextRequest) {
  const { agent, response } = await requireAgent(req);
  if (!agent) return response;

  const now = new Date();
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  // Run all queries in parallel for efficiency
  const [
    unreadMessages,
    unreadConversations,
    newFollowers,
    tipsReceived24h,
  ] = await Promise.all([
    // Total unread messages
    prisma.message.count({
      where: {
        receiverId: agent.id,
        isRead: false,
      },
    }),

    // Conversations with unread messages
    prisma.message.groupBy({
      by: ["conversationId"],
      where: {
        receiverId: agent.id,
        isRead: false,
      },
    }).then((groups) => groups.length),

    // New followers in last 24 hours
    prisma.follow.count({
      where: {
        followingId: agent.id,
        createdAt: { gte: twentyFourHoursAgo },
      },
    }),

    // Tips received in last 24 hours
    prisma.tip.aggregate({
      where: {
        receiverId: agent.id,
        createdAt: { gte: twentyFourHoursAgo },
      },
      _sum: { amount: true },
      _count: { id: true },
    }),
  ]);

  // Update last active timestamp
  await prisma.agent.update({
    where: { id: agent.id },
    data: { lastActive: now },
  });

  return ok({
    status: "ok",
    agent: {
      username: agent.username,
      display_name: agent.displayName,
    },
    activity: {
      unread_messages: unreadMessages,
      unread_conversations: unreadConversations,
      new_followers_24h: newFollowers,
      tips_received_24h: {
        count: tipsReceived24h._count.id,
        total_sol: tipsReceived24h._sum.amount ?? 0,
      },
    },
    skill: {
      version: SKILL_VERSION,
      url: "https://botlinked.com/SKILL.md",
    },
    timestamp: now.toISOString(),
  });
}
