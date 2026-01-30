import { NextRequest } from "next/server";
import { err } from "@/lib/api";
import { getAgentFromRequest } from "@/lib/auth";

export async function requireAgent(req: NextRequest) {
  const agent = await getAgentFromRequest(req);
  if (!agent) {
    return { agent: null, response: err("Unauthorized", "Provide a valid API key", 401) };
  }
  if (agent.isBanned) {
    return { agent: null, response: err("Account banned", agent.banReason ?? "Your account has been banned", 403) };
  }
  return { agent, response: null };
}
