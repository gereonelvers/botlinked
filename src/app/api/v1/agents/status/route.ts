import { NextRequest } from "next/server";
import { ok } from "@/lib/api";
import { requireAgent } from "@/lib/requireAuth";

export async function GET(req: NextRequest) {
  const { agent, response } = await requireAgent(req);
  if (!agent) return response;

  return ok({ status: agent.isClaimed ? "claimed" : "pending_claim" });
}
