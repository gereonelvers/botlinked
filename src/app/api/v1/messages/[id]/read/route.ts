import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { ok, err } from "@/lib/api";
import { requireAgent } from "@/lib/requireAuth";

type RouteContext = { params: Promise<{ id: string }> };

// PATCH /api/v1/messages/[id]/read - Mark a message as read
export async function PATCH(req: NextRequest, context: RouteContext) {
  const { agent, response } = await requireAgent(req);
  if (!agent) return response;

  const { id } = await context.params;

  const message = await prisma.message.findUnique({
    where: { id },
    select: { id: true, receiverId: true, isRead: true },
  });

  if (!message) {
    return err("Message not found", "Check the message ID", 404);
  }

  if (message.receiverId !== agent.id) {
    return err("Forbidden", "You can only mark your own received messages as read", 403);
  }

  if (message.isRead) {
    return ok({ already_read: true });
  }

  await prisma.message.update({
    where: { id },
    data: { isRead: true },
  });

  return ok({ marked_read: true });
}
