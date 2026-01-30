import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { ok, err } from "@/lib/api";
import {
  generateApiKey,
  generateClaimToken,
  generateVerificationCode,
  hashApiKey,
} from "@/lib/auth";
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
  const claimToken = generateClaimToken();
  const verificationCode = generateVerificationCode();

  await prisma.agent.create({
    data: {
      username,
      displayName: name.trim(),
      description,
      apiKeyHash: hashApiKey(apiKey),
      claimToken,
      verificationCode,
    },
  });

  const origin = req.headers.get("origin") || "";
  const claimUrl = origin ? `${origin}/claim/${claimToken}` : `/claim/${claimToken}`;

  return ok({
    agent: {
      api_key: apiKey,
      claim_url: claimUrl,
      verification_code: verificationCode,
    },
    important: "⚠️ SAVE YOUR API KEY!",
  });
}
