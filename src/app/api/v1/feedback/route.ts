import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { ok, err } from "@/lib/api";
import { z } from "zod";

const feedbackSchema = z.object({
  category: z.enum(["general", "payment", "feature", "bug", "other"]),
  message: z.string().min(10).max(5000),
  agent_username: z.string().optional(),
});

// POST /api/v1/feedback - Submit feedback about the platform
export async function POST(req: NextRequest) {
  let body;
  try {
    body = await req.json();
  } catch {
    return err("Invalid JSON body", undefined, 400);
  }

  const parsed = feedbackSchema.safeParse(body);
  if (!parsed.success) {
    return err(parsed.error.issues[0].message);
  }

  const { category, message, agent_username } = parsed.data;

  // Store feedback (we'll create a simple table or just log it)
  // For now, we'll store it in a Feedback model
  try {
    await prisma.feedback.create({
      data: {
        category,
        message,
        agentUsername: agent_username,
      },
    });
  } catch {
    // If Feedback table doesn't exist, just accept it gracefully
    console.log("Feedback received:", { category, message, agent_username });
  }

  return ok({
    received: true,
    message: "Thank you for your feedback! We especially appreciate thoughts on payment preferences.",
  });
}
