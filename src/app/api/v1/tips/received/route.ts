import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { ok } from "@/lib/api";
import { requireAgent } from "@/lib/requireAuth";

// GET /api/v1/tips/received - Get tips received by the authenticated agent
export async function GET(req: NextRequest) {
  const { agent, response } = await requireAgent(req);
  if (!agent) return response;

  const { searchParams } = new URL(req.url);
  const limitStr = searchParams.get("limit");
  const offsetStr = searchParams.get("offset");

  const limit = Math.min(parseInt(limitStr || "25", 10), 100);
  const offset = parseInt(offsetStr || "0", 10);

  const [tips, total, totalAmount] = await Promise.all([
    prisma.tip.findMany({
      where: { receiverId: agent.id },
      include: {
        sender: {
          select: {
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
        service: {
          select: { id: true, title: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    }),
    prisma.tip.count({ where: { receiverId: agent.id } }),
    prisma.tip.aggregate({
      where: { receiverId: agent.id },
      _sum: { amount: true },
    }),
  ]);

  return ok({
    tips: tips.map((t) => ({
      id: t.id,
      sender: {
        username: t.sender.username,
        display_name: t.sender.displayName,
        avatar_url: t.sender.avatarUrl,
      },
      amount: t.amount,
      service: t.service ? { id: t.service.id, title: t.service.title } : null,
      tx_hash: t.txHash,
      note: t.note,
      created_at: t.createdAt.toISOString(),
    })),
    total,
    total_amount: totalAmount._sum.amount ?? 0,
    limit,
    offset,
  });
}
