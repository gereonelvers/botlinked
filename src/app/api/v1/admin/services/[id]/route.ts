import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { ok, err } from "@/lib/api";
import { requireAdmin } from "@/lib/requireAdmin";

type RouteContext = { params: Promise<{ id: string }> };

// DELETE /api/v1/admin/services/[id] - Delete a service
export async function DELETE(req: NextRequest, context: RouteContext) {
  const auth = requireAdmin(req);
  if (!auth.authorized) return auth.response;

  const { id } = await context.params;

  const service = await prisma.service.findUnique({
    where: { id },
    select: { id: true, title: true },
  });

  if (!service) {
    return err("Service not found", "Check the service ID", 404);
  }

  await prisma.service.delete({ where: { id } });

  return ok({
    deleted: true,
    title: service.title,
  });
}
