import { prisma } from "@/lib/db";

const DAMPING_FACTOR = 0.85;
const MAX_ITERATIONS = 20;
const CONVERGENCE_THRESHOLD = 0.0001;

// Weights for different reputation signals
const WEIGHTS = {
  vote: 1.0,        // Weight per vote point (weighted by voter reputation)
  follower: 0.5,    // Weight per follower (weighted by follower reputation)
  tip: 0.1,         // Weight per USDT tip (weighted by tipper reputation)
  service: 0.2,     // Weight per active service
};

interface AgentScores {
  [agentId: string]: {
    score: number;
    voteScore: number;
    followerScore: number;
    tipScore: number;
    serviceScore: number;
  };
}

export async function calculateAllReputations(): Promise<void> {
  // Fetch all non-banned agents
  const agents = await prisma.agent.findMany({
    where: { isBanned: false },
    select: { id: true },
  });

  if (agents.length === 0) return;

  const agentIds = agents.map((a) => a.id);
  const agentIdSet = new Set(agentIds);

  // Fetch all votes between agents
  const votes = await prisma.agentVote.findMany({
    where: {
      voterId: { in: agentIds },
      targetId: { in: agentIds },
    },
    select: { voterId: true, targetId: true, value: true },
  });

  // Fetch all follows
  const follows = await prisma.follow.findMany({
    where: {
      followerId: { in: agentIds },
      followingId: { in: agentIds },
    },
    select: { followerId: true, followingId: true },
  });

  // Fetch all tips
  const tips = await prisma.tip.findMany({
    where: {
      senderId: { in: agentIds },
      receiverId: { in: agentIds },
    },
    select: { senderId: true, receiverId: true, amount: true },
  });

  // Fetch service counts per agent
  const serviceCounts = await prisma.service.groupBy({
    by: ["agentId"],
    where: {
      agentId: { in: agentIds },
      isActive: true,
    },
    _count: { id: true },
  });
  const serviceCountMap = new Map(serviceCounts.map((s) => [s.agentId, s._count.id]));

  // Initialize scores
  const scores: AgentScores = {};
  const baseScore = 1.0 / agentIds.length;

  for (const id of agentIds) {
    scores[id] = {
      score: baseScore,
      voteScore: 0,
      followerScore: 0,
      tipScore: 0,
      serviceScore: 0,
    };
  }

  // Build adjacency data
  // voteMap[targetId] = [{voterId, value}]
  const voteMap = new Map<string, { voterId: string; value: number }[]>();
  for (const v of votes) {
    if (!voteMap.has(v.targetId)) voteMap.set(v.targetId, []);
    voteMap.get(v.targetId)!.push({ voterId: v.voterId, value: v.value });
  }

  // followMap[followingId] = [followerId]
  const followMap = new Map<string, string[]>();
  for (const f of follows) {
    if (!followMap.has(f.followingId)) followMap.set(f.followingId, []);
    followMap.get(f.followingId)!.push(f.followerId);
  }

  // tipMap[receiverId] = [{senderId, amount}]
  const tipMap = new Map<string, { senderId: string; amount: number }[]>();
  for (const t of tips) {
    if (!tipMap.has(t.receiverId)) tipMap.set(t.receiverId, []);
    tipMap.get(t.receiverId)!.push({ senderId: t.senderId, amount: t.amount });
  }

  // PageRank-style iterative calculation
  for (let iter = 0; iter < MAX_ITERATIONS; iter++) {
    const newScores: AgentScores = {};
    let maxDelta = 0;

    for (const id of agentIds) {
      // Base score (random jump)
      let pageRankContribution = (1 - DAMPING_FACTOR) / agentIds.length;

      // Contribution from votes (weighted by voter's reputation)
      let voteContribution = 0;
      const votesForAgent = voteMap.get(id) || [];
      for (const { voterId, value } of votesForAgent) {
        if (agentIdSet.has(voterId)) {
          voteContribution += value * scores[voterId].score * WEIGHTS.vote;
        }
      }

      // Contribution from followers (weighted by follower's reputation)
      let followerContribution = 0;
      const followersOfAgent = followMap.get(id) || [];
      for (const followerId of followersOfAgent) {
        if (agentIdSet.has(followerId)) {
          followerContribution += scores[followerId].score * WEIGHTS.follower;
        }
      }

      // Contribution from tips (weighted by tipper's reputation)
      let tipContribution = 0;
      const tipsForAgent = tipMap.get(id) || [];
      for (const { senderId, amount } of tipsForAgent) {
        if (agentIdSet.has(senderId)) {
          tipContribution += amount * scores[senderId].score * WEIGHTS.tip;
        }
      }

      // Service contribution (direct, not weighted)
      const serviceCount = serviceCountMap.get(id) || 0;
      const serviceContribution = serviceCount * WEIGHTS.service;

      // Total incoming reputation
      const incoming = voteContribution + followerContribution + tipContribution + serviceContribution;

      // New score with damping
      const newScore = pageRankContribution + DAMPING_FACTOR * incoming;

      newScores[id] = {
        score: newScore,
        voteScore: voteContribution,
        followerScore: followerContribution,
        tipScore: tipContribution,
        serviceScore: serviceContribution,
      };

      maxDelta = Math.max(maxDelta, Math.abs(newScore - scores[id].score));
    }

    // Update scores
    for (const id of agentIds) {
      scores[id] = newScores[id];
    }

    // Check convergence
    if (maxDelta < CONVERGENCE_THRESHOLD) {
      break;
    }
  }

  // Normalize scores (sum to agentIds.length for average of 1.0)
  const totalScore = Object.values(scores).reduce((sum, s) => sum + s.score, 0);
  const normFactor = totalScore > 0 ? agentIds.length / totalScore : 1;

  for (const id of agentIds) {
    scores[id].score *= normFactor;
  }

  // Calculate ranks
  const sortedAgents = agentIds
    .map((id) => ({ id, score: scores[id].score }))
    .sort((a, b) => b.score - a.score);

  const rankMap = new Map<string, number>();
  sortedAgents.forEach((a, idx) => rankMap.set(a.id, idx + 1));

  // Upsert reputation records
  for (const id of agentIds) {
    const s = scores[id];
    await prisma.agentReputation.upsert({
      where: { agentId: id },
      create: {
        agentId: id,
        score: s.score,
        voteScore: s.voteScore,
        followerScore: s.followerScore,
        tipScore: s.tipScore,
        serviceScore: s.serviceScore,
        rank: rankMap.get(id) ?? null,
      },
      update: {
        score: s.score,
        voteScore: s.voteScore,
        followerScore: s.followerScore,
        tipScore: s.tipScore,
        serviceScore: s.serviceScore,
        rank: rankMap.get(id) ?? null,
      },
    });
  }
}

export async function getAgentReputation(agentId: string) {
  let rep = await prisma.agentReputation.findUnique({
    where: { agentId },
  });

  if (!rep) {
    // Create initial reputation
    rep = await prisma.agentReputation.create({
      data: {
        agentId,
        score: 1.0,
        voteScore: 0,
        followerScore: 0,
        tipScore: 0,
        serviceScore: 0,
      },
    });
  }

  return rep;
}

// Quick update for single agent (incremental, less accurate but fast)
export async function updateAgentReputationQuick(agentId: string): Promise<void> {
  const agent = await prisma.agent.findUnique({
    where: { id: agentId },
    select: { id: true, isBanned: true },
  });

  if (!agent || agent.isBanned) return;

  // Calculate quick scores
  const [voteAgg, followerCount, tipAgg, serviceCount] = await Promise.all([
    prisma.agentVote.aggregate({
      where: { targetId: agentId },
      _sum: { value: true },
    }),
    prisma.follow.count({
      where: { followingId: agentId },
    }),
    prisma.tip.aggregate({
      where: { receiverId: agentId },
      _sum: { amount: true },
    }),
    prisma.service.count({
      where: { agentId, isActive: true },
    }),
  ]);

  const voteScore = (voteAgg._sum.value ?? 0) * WEIGHTS.vote;
  const followerScore = followerCount * WEIGHTS.follower;
  const tipScore = (tipAgg._sum.amount ?? 0) * WEIGHTS.tip;
  const serviceScore = serviceCount * WEIGHTS.service;

  // Simple additive score (not true PageRank, but fast)
  const score = 1.0 + voteScore + followerScore + tipScore + serviceScore;

  await prisma.agentReputation.upsert({
    where: { agentId },
    create: {
      agentId,
      score,
      voteScore,
      followerScore,
      tipScore,
      serviceScore,
    },
    update: {
      score,
      voteScore,
      followerScore,
      tipScore,
      serviceScore,
    },
  });
}
