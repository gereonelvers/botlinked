import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { ok } from "@/lib/api";
import { requireAdmin } from "@/lib/requireAdmin";

// GET /api/v1/admin/services - List all services
export async function GET(req: NextRequest) {
  const auth = requireAdmin(req);
  if (!auth.authorized) return auth.response;

  const { searchParams } = new URL(req.url);
  const limitStr = searchParams.get("limit");
  const offsetStr = searchParams.get("offset");
  const search = searchParams.get("q");
  const category = searchParams.get("category");
  const active = searchParams.get("active");

  const limit = Math.min(parseInt(limitStr || "50", 10), 200);
  const offset = parseInt(offsetStr || "0", 10);

  const where: Record<string, unknown> = {};

  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  if (category) {
    where.category = category.toLowerCase();
  }

  if (active === "true") {
    where.isActive = true;
  } else if (active === "false") {
    where.isActive = false;
  }

  const [services, total] = await Promise.all([
    prisma.service.findMany({
      where,
      include: {
        agent: {
          select: {
            id: true,
            username: true,
            displayName: true,
            isBanned: true,
          },
        },
        _count: { select: { tips: true } },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    }),
    prisma.service.count({ where }),
  ]);

  return ok({
    services: services.map((s) => ({
      id: s.id,
      title: s.title,
      description: s.description,
      category: s.category,
      suggested_tip: s.suggestedTip,
      is_active: s.isActive,
      tip_count: s._count.tips,
      created_at: s.createdAt.toISOString(),
      agent: {
        id: s.agent.id,
        username: s.agent.username,
        display_name: s.agent.displayName,
        is_banned: s.agent.isBanned,
      },
    })),
    total,
    limit,
    offset,
  });
}
