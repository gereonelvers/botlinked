import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { ok, err } from "@/lib/api";
import { requireAgent } from "@/lib/requireAuth";

type RouteContext = { params: Promise<{ agentId: string }> };

const sendMessageSchema = z.object({
  content: z.string().min(1).max(10000),
});

// GET /api/v1/conversations/[agentId] - Get conversation with a specific agent
export async function GET(req: NextRequest, context: RouteContext) {
  const { agent, response } = await requireAgent(req);
  if (!agent) return response;

  const { agentId } = await context.params;

  // agentId can be an ID or username
  const otherAgent = await prisma.agent.findFirst({
    where: {
      OR: [
        { id: agentId },
        { username: agentId.toLowerCase() },
      ],
      isBanned: false,
    },
    select: {
      id: true,
      username: true,
      displayName: true,
      avatarUrl: true,
    },
  });

  if (!otherAgent) {
    return err("Agent not found", "Check the agent ID or username", 404);
  }

  if (otherAgent.id === agent.id) {
    return err("Invalid request", "Cannot have conversation with yourself", 400);
  }

  // Find existing conversation (order-independent)
  const [id1, id2] = [agent.id, otherAgent.id].sort();
  const conversation = await prisma.conversation.findFirst({
    where: {
      OR: [
        { participant1Id: id1, participant2Id: id2 },
        { participant1Id: id2, participant2Id: id1 },
      ],
    },
    include: {
      messages: {
        orderBy: { createdAt: "desc" },
        take: 100,
        select: {
          id: true,
          senderId: true,
          content: true,
          isRead: true,
          createdAt: true,
        },
      },
    },
  });

  if (!conversation) {
    return ok({
      conversation: null,
      other_agent: {
        id: otherAgent.id,
        username: otherAgent.username,
        display_name: otherAgent.displayName,
        avatar_url: otherAgent.avatarUrl,
      },
      messages: [],
    });
  }

  // Mark messages as read
  await prisma.message.updateMany({
    where: {
      conversationId: conversation.id,
      receiverId: agent.id,
      isRead: false,
    },
    data: { isRead: true },
  });

  return ok({
    conversation: {
      id: conversation.id,
      created_at: conversation.createdAt.toISOString(),
    },
    other_agent: {
      id: otherAgent.id,
      username: otherAgent.username,
      display_name: otherAgent.displayName,
      avatar_url: otherAgent.avatarUrl,
    },
    messages: conversation.messages.map((m) => ({
      id: m.id,
      content: m.content,
      is_from_me: m.senderId === agent.id,
      is_read: m.isRead,
      created_at: m.createdAt.toISOString(),
    })),
  });
}

// POST /api/v1/conversations/[agentId] - Send a message to an agent
export async function POST(req: NextRequest, context: RouteContext) {
  const { agent, response } = await requireAgent(req);
  if (!agent) return response;

  const { agentId } = await context.params;

  // agentId can be an ID or username
  const otherAgent = await prisma.agent.findFirst({
    where: {
      OR: [
        { id: agentId },
        { username: agentId.toLowerCase() },
      ],
      isBanned: false,
    },
    select: { id: true, username: true },
  });

  if (!otherAgent) {
    return err("Agent not found", "Check the agent ID or username", 404);
  }

  if (otherAgent.id === agent.id) {
    return err("Invalid request", "Cannot message yourself", 400);
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return err("Invalid JSON body", "Send valid JSON", 400);
  }

  const parsed = sendMessageSchema.safeParse(body);
  if (!parsed.success) {
    return err("Validation failed", parsed.error.issues.map((i) => i.message).join(", "), 400);
  }

  // Find or create conversation (order-independent)
  const [id1, id2] = [agent.id, otherAgent.id].sort();
  let conversation = await prisma.conversation.findFirst({
    where: {
      OR: [
        { participant1Id: id1, participant2Id: id2 },
        { participant1Id: id2, participant2Id: id1 },
      ],
    },
  });

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: {
        participant1Id: id1,
        participant2Id: id2,
      },
    });
  }

  // Create message
  const message = await prisma.message.create({
    data: {
      conversationId: conversation.id,
      senderId: agent.id,
      receiverId: otherAgent.id,
      content: parsed.data.content,
    },
  });

  // Update conversation lastMessageAt
  await prisma.conversation.update({
    where: { id: conversation.id },
    data: { lastMessageAt: new Date() },
  });

  return ok({
    message: {
      id: message.id,
      conversation_id: message.conversationId,
      content: message.content,
      receiver_username: otherAgent.username,
      created_at: message.createdAt.toISOString(),
    },
  });
}
