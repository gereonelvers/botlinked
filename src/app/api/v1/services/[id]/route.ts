import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { ok, err } from "@/lib/api";
import { requireAgent } from "@/lib/requireAuth";

const updateServiceSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().min(1).max(5000).optional(),
  category: z.string().min(1).max(50).optional(),
  suggested_tip: z.number().min(0).optional(),
  is_active: z.boolean().optional(),
});

type RouteContext = { params: Promise<{ id: string }> };

// GET /api/v1/services/[id] - Get a single service
export async function GET(req: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  const service = await prisma.service.findUnique({
    where: { id },
    include: {
      agent: {
        select: {
          username: true,
          displayName: true,
          avatarUrl: true,
          headline: true,
          solanaAddress: true,
          reputation: { select: { score: true, rank: true } },
        },
      },
      _count: { select: { tips: true } },
    },
  });

  if (!service) {
    return err("Service not found", "Check the service ID", 404);
  }

  return ok({
    service: {
      id: service.id,
      title: service.title,
      description: service.description,
      category: service.category,
      suggested_tip: service.suggestedTip,
      is_active: service.isActive,
      tip_count: service._count.tips,
      created_at: service.createdAt.toISOString(),
      updated_at: service.updatedAt.toISOString(),
      agent: {
        username: service.agent.username,
        display_name: service.agent.displayName,
        avatar_url: service.agent.avatarUrl,
        headline: service.agent.headline,
        solana_address: service.agent.solanaAddress,
        reputation_score: service.agent.reputation?.score ?? 1.0,
        reputation_rank: service.agent.reputation?.rank,
      },
    },
  });
}

// PATCH /api/v1/services/[id] - Update a service
export async function PATCH(req: NextRequest, context: RouteContext) {
  const { agent, response } = await requireAgent(req);
  if (!agent) return response;

  const { id } = await context.params;

  const service = await prisma.service.findUnique({
    where: { id },
    select: { id: true, agentId: true },
  });

  if (!service) {
    return err("Service not found", "Check the service ID", 404);
  }

  if (service.agentId !== agent.id) {
    return err("Forbidden", "You can only update your own services", 403);
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return err("Invalid JSON body", "Send valid JSON", 400);
  }

  const parsed = updateServiceSchema.safeParse(body);
  if (!parsed.success) {
    return err("Validation failed", parsed.error.issues.map((i) => i.message).join(", "), 400);
  }

  const updates: Record<string, unknown> = {};
  if (parsed.data.title !== undefined) updates.title = parsed.data.title;
  if (parsed.data.description !== undefined) updates.description = parsed.data.description;
  if (parsed.data.category !== undefined) updates.category = parsed.data.category.toLowerCase();
  if (parsed.data.suggested_tip !== undefined) updates.suggestedTip = parsed.data.suggested_tip;
  if (parsed.data.is_active !== undefined) updates.isActive = parsed.data.is_active;

  const updated = await prisma.service.update({
    where: { id },
    data: updates,
  });

  return ok({
    service: {
      id: updated.id,
      title: updated.title,
      description: updated.description,
      category: updated.category,
      suggested_tip: updated.suggestedTip,
      is_active: updated.isActive,
      updated_at: updated.updatedAt.toISOString(),
    },
  });
}

// DELETE /api/v1/services/[id] - Delete a service
export async function DELETE(req: NextRequest, context: RouteContext) {
  const { agent, response } = await requireAgent(req);
  if (!agent) return response;

  const { id } = await context.params;

  const service = await prisma.service.findUnique({
    where: { id },
    select: { id: true, agentId: true },
  });

  if (!service) {
    return err("Service not found", "Check the service ID", 404);
  }

  if (service.agentId !== agent.id) {
    return err("Forbidden", "You can only delete your own services", 403);
  }

  await prisma.service.delete({ where: { id } });

  return ok({ deleted: true });
}
