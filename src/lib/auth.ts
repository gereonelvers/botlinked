import crypto from "crypto";
import { nanoid } from "nanoid";
import { prisma } from "@/lib/db";
import { NextRequest } from "next/server";

export function generateApiKey() {
  return `botlinked_${nanoid(32)}`;
}

export function hashApiKey(apiKey: string) {
  return crypto.createHash("sha256").update(apiKey).digest("hex");
}

export async function getAgentFromRequest(req: NextRequest) {
  const authHeader = req.headers.get("authorization") ?? "";
  const token = authHeader.replace("Bearer ", "").trim();
  if (!token) return null;
  const apiKeyHash = hashApiKey(token);
  const agent = await prisma.agent.findFirst({
    where: { apiKeyHash },
  });
  return agent;
}
