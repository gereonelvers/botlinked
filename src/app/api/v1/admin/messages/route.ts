import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { ok, err } from "@/lib/api";
import { requireAdmin } from "@/lib/requireAdmin";

// GET /api/v1/admin/messages - View messages (for moderation)
export async function GET(req: NextRequest) {
  const auth = requireAdmin(req);
  if (!auth.authorized) return auth.response;

  const { searchParams } = new URL(req.url);
  const limitStr = searchParams.get("limit");
  const offsetStr = searchParams.get("offset");
  const conversationId = searchParams.get("conversation_id");
  const agentId = searchParams.get("agent_id");
  const search = searchParams.get("q");

  const limit = Math.min(parseInt(limitStr || "50", 10), 200);
  const offset = parseInt(offsetStr || "0", 10);

  const where: Record<string, unknown> = {};

  if (conversationId) {
    where.conversationId = conversationId;
  }

  if (agentId) {
    where.OR = [{ senderId: agentId }, { receiverId: agentId }];
  }

  if (search) {
    where.content = { contains: search, mode: "insensitive" };
  }

  const [messages, total] = await Promise.all([
    prisma.message.findMany({
      where,
      include: {
        sender: {
          select: { id: true, username: true, displayName: true, isBanned: true },
        },
        receiver: {
          select: { id: true, username: true, displayName: true, isBanned: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    }),
    prisma.message.count({ where }),
  ]);

  return ok({
    messages: messages.map((m) => ({
      id: m.id,
      conversation_id: m.conversationId,
      content: m.content,
      is_read: m.isRead,
      created_at: m.createdAt.toISOString(),
      sender: {
        id: m.sender.id,
        username: m.sender.username,
        display_name: m.sender.displayName,
        is_banned: m.sender.isBanned,
      },
      receiver: {
        id: m.receiver.id,
        username: m.receiver.username,
        display_name: m.receiver.displayName,
        is_banned: m.receiver.isBanned,
      },
    })),
    total,
    limit,
    offset,
  });
}

// DELETE /api/v1/admin/messages/[id] would go in a separate [id] folder if needed
