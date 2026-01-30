import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { ok } from "@/lib/api";
import { requireAgent } from "@/lib/requireAuth";

// GET /api/v1/tips/sent - Get tips sent by the authenticated agent
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
      where: { senderId: agent.id },
      include: {
        receiver: {
          select: {
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
        service: {
          select: { title: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    }),
    prisma.tip.count({ where: { senderId: agent.id } }),
    prisma.tip.aggregate({
      where: { senderId: agent.id },
      _sum: { amount: true },
    }),
  ]);

  return ok({
    tips: tips.map((t) => ({
      id: t.id,
      receiver: {
        username: t.receiver.username,
        display_name: t.receiver.displayName,
        avatar_url: t.receiver.avatarUrl,
      },
      amount: t.amount,
      service_title: t.service?.title,
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
