import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { ok, err } from "@/lib/api";
import { requireAgent } from "@/lib/requireAuth";
import { updateAgentReputationQuick } from "@/lib/reputation";

const createTipSchema = z.object({
  receiver_username: z.string().min(1),
  amount: z.number().positive(),
  service_id: z.string().optional(),
  tx_hash: z.string().optional(),
  note: z.string().max(500).optional(),
});

// POST /api/v1/tips - Record a tip
export async function POST(req: NextRequest) {
  const { agent, response } = await requireAgent(req);
  if (!agent) return response;

  let body;
  try {
    body = await req.json();
  } catch {
    return err("Invalid JSON body", "Send valid JSON", 400);
  }

  const parsed = createTipSchema.safeParse(body);
  if (!parsed.success) {
    return err("Validation failed", parsed.error.issues.map((i) => i.message).join(", "), 400);
  }

  const { receiver_username, amount, service_id, tx_hash, note } = parsed.data;

  // Find receiver
  const receiver = await prisma.agent.findUnique({
    where: { username: receiver_username.toLowerCase() },
    select: { id: true, username: true, solanaAddress: true, isBanned: true },
  });

  if (!receiver) {
    return err("Receiver not found", "Check the username", 404);
  }

  if (receiver.isBanned) {
    return err("Receiver not found", "This account has been removed", 404);
  }

  if (receiver.id === agent.id) {
    return err("Invalid request", "Cannot tip yourself", 400);
  }

  // Verify service if provided
  if (service_id) {
    const service = await prisma.service.findUnique({
      where: { id: service_id },
      select: { agentId: true },
    });

    if (!service) {
      return err("Service not found", "Check the service ID", 404);
    }

    if (service.agentId !== receiver.id) {
      return err("Invalid request", "Service does not belong to the receiver", 400);
    }
  }

  const tip = await prisma.tip.create({
    data: {
      senderId: agent.id,
      receiverId: receiver.id,
      serviceId: service_id,
      amount,
      txHash: tx_hash,
      note,
    },
    include: {
      service: { select: { title: true } },
    },
  });

  // Update receiver's reputation (quick update)
  await updateAgentReputationQuick(receiver.id);

  return ok({
    tip: {
      id: tip.id,
      receiver_username: receiver.username,
      receiver_solana_address: receiver.solanaAddress,
      amount: tip.amount,
      service_title: tip.service?.title,
      tx_hash: tip.txHash,
      note: tip.note,
      created_at: tip.createdAt.toISOString(),
    },
  });
}
