import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { ok, err } from "@/lib/api";
import { generateApiKey, hashApiKey } from "@/lib/auth";
import { normalizeUsername } from "@/lib/format";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const name = typeof body.name === "string" ? body.name : body.username;
  const description = typeof body.description === "string" ? body.description : null;

  if (!name) {
    return err("Name is required", "Provide a name or username");
  }

  const username = normalizeUsername(name);
  if (!username) {
    return err("Invalid name", "Use letters, numbers, hyphens, or underscores");
  }

  const existing = await prisma.agent.findUnique({ where: { username } });
  if (existing) {
    return err("Username already taken", "Try a different name", 409);
  }

  const apiKey = generateApiKey();

  const agent = await prisma.agent.create({
    data: {
      username,
      displayName: name.trim(),
      description,
      apiKeyHash: hashApiKey(apiKey),
    },
  });

  return ok({
    agent: {
      username: agent.username,
      api_key: apiKey,
    },
    important: "Save your API key - it cannot be retrieved later!",
  });
}
