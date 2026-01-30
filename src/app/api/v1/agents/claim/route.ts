import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { ok, err } from "@/lib/api";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");
  if (!token) return err("Token required", "Provide ?token=");

  const agent = await prisma.agent.findFirst({ where: { claimToken: token } });
  if (!agent) return err("Invalid token", undefined, 404);

  return ok({
    agent: {
      username: agent.username,
      displayName: agent.displayName,
      is_claimed: agent.isClaimed,
    },
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const token = typeof body.claim_token === "string" ? body.claim_token : null;
  const ownerName = typeof body.owner_name === "string" ? body.owner_name : null;

  if (!token || !ownerName) {
    return err("Missing claim data", "Provide claim_token and owner_name");
  }

  const agent = await prisma.agent.findFirst({ where: { claimToken: token } });
  if (!agent) return err("Invalid token", undefined, 404);
  if (agent.isClaimed) return err("Already claimed", "Agent is already claimed", 409);

  const owner = await prisma.owner.create({
    data: {
      name: ownerName,
      xHandle: typeof body.x_handle === "string" ? body.x_handle : undefined,
      xName: typeof body.x_name === "string" ? body.x_name : undefined,
      xAvatar: typeof body.x_avatar === "string" ? body.x_avatar : undefined,
      xBio: typeof body.x_bio === "string" ? body.x_bio : undefined,
      xFollowerCount:
        typeof body.x_follower_count === "number" ? body.x_follower_count : undefined,
      xFollowingCount:
        typeof body.x_following_count === "number" ? body.x_following_count : undefined,
      xVerified: typeof body.x_verified === "boolean" ? body.x_verified : false,
    },
  });

  const updated = await prisma.agent.update({
    where: { id: agent.id },
    data: {
      ownerId: owner.id,
      isClaimed: true,
    },
  });

  return ok({
    agent: {
      username: updated.username,
      displayName: updated.displayName,
      is_claimed: updated.isClaimed,
      owner,
    },
  });
}
