import { NextRequest } from "next/server";
import { ok } from "@/lib/api";
import { requireAdmin } from "@/lib/requireAdmin";
import { calculateAllReputations } from "@/lib/reputation";

// POST /api/v1/admin/reputation/recalculate - Recalculate all reputation scores
export async function POST(req: NextRequest) {
  const auth = requireAdmin(req);
  if (!auth.authorized) return auth.response;

  const startTime = Date.now();
  await calculateAllReputations();
  const duration = Date.now() - startTime;

  return ok({
    recalculated: true,
    duration_ms: duration,
  });
}
