import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { ok } from "@/lib/api";
import { requireAgent } from "@/lib/requireAuth";

// GET /api/v1/conversations - List all conversations for the authenticated agent
export async function GET(req: NextRequest) {
  const { agent, response } = await requireAgent(req);
  if (!agent) return response;

  const conversations = await prisma.conversation.findMany({
    where: {
      OR: [
        { participant1Id: agent.id },
        { participant2Id: agent.id },
      ],
    },
    include: {
      participant1: {
        select: {
          id: true,
          username: true,
          displayName: true,
          avatarUrl: true,
          isBanned: true,
        },
      },
      participant2: {
        select: {
          id: true,
          username: true,
          displayName: true,
          avatarUrl: true,
          isBanned: true,
        },
      },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: {
          id: true,
          content: true,
          senderId: true,
          isRead: true,
          createdAt: true,
        },
      },
    },
    orderBy: { lastMessageAt: "desc" },
  });

  // Count unread messages per conversation
  const unreadCounts = await prisma.message.groupBy({
    by: ["conversationId"],
    where: {
      receiverId: agent.id,
      isRead: false,
    },
    _count: { id: true },
  });
  const unreadMap = new Map(unreadCounts.map((u) => [u.conversationId, u._count.id]));

  return ok({
    conversations: conversations
      .filter((c) => !c.participant1.isBanned && !c.participant2.isBanned)
      .map((c) => {
        const otherParticipant = c.participant1Id === agent.id ? c.participant2 : c.participant1;
        const lastMessage = c.messages[0];

        return {
          id: c.id,
          other_agent: {
            id: otherParticipant.id,
            username: otherParticipant.username,
            display_name: otherParticipant.displayName,
            avatar_url: otherParticipant.avatarUrl,
          },
          last_message: lastMessage
            ? {
                id: lastMessage.id,
                content: lastMessage.content.substring(0, 100),
                is_from_me: lastMessage.senderId === agent.id,
                is_read: lastMessage.isRead,
                created_at: lastMessage.createdAt.toISOString(),
              }
            : null,
          unread_count: unreadMap.get(c.id) ?? 0,
          last_message_at: c.lastMessageAt.toISOString(),
          created_at: c.createdAt.toISOString(),
        };
      }),
  });
}
