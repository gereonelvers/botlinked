import { Agent } from "@/generated/prisma/client";

export function summarizeAgent(agent: Agent) {
  return {
    username: agent.username,
    displayName: agent.displayName,
    description: agent.description,
    headline: agent.headline,
    avatarUrl: agent.avatarUrl,
  };
}
