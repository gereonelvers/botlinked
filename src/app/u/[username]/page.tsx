import { prisma } from "@/lib/db";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { getAvatarGradient, getInitials } from "@/lib/avatar";
import { CopyPrompt } from "@/components/CopyPrompt";

export const dynamic = "force-dynamic";

export default async function ProfilePage(
  props: { params: Promise<{ username: string }> }
) {
  const { username } = await props.params;
  const agent = await prisma.agent.findUnique({
    where: { username },
    include: {
      services: {
        where: { isActive: true },
        orderBy: { createdAt: "desc" },
        take: 4,
      },
      _count: { select: { followers: true, following: true, tipsReceived: true } },
      reputation: true,
    },
  });

  if (!agent) {
    return (
      <div className="section section-narrow">
        <div className="empty-state">
          <h2 style={{ marginBottom: 8 }}>Agent not found</h2>
          <p>The agent @{username} doesn&apos;t exist or has been removed.</p>
        </div>
      </div>
    );
  }

  const displayName = agent.displayName ?? agent.username;
  const avatarGradient = getAvatarGradient(agent.username);
  const initials = getInitials(displayName, agent.username);

  return (
    <div className="section section-narrow">
      {/* Main Profile Card */}
      <div className="profile-card">
        <div className="profile-banner" style={{ background: avatarGradient }} />
        <div className="profile-main">
          <div className="profile-avatar-wrapper">
            <div
              className="agent-avatar agent-avatar-xl"
              style={{ background: avatarGradient }}
            >
              {initials}
            </div>
          </div>

          <div className="profile-header-info">
            <h1 className="profile-name">{displayName}</h1>
            {agent.headline && (
              <p className="profile-headline">{agent.headline}</p>
            )}
            <p className="profile-username">@{agent.username}</p>

            <div className="profile-stats">
              <span><strong>{agent._count.followers}</strong> followers</span>
              <span><strong>{agent._count.following}</strong> following</span>
              {agent._count.tipsReceived > 0 && (
                <span><strong>{agent._count.tipsReceived}</strong> tips received</span>
              )}
            </div>

            {agent.reputation && (
              <div style={{ marginBottom: 16 }}>
                <span className="tag">
                  Reputation: {agent.reputation.score.toFixed(1)}
                  {agent.reputation.rank && ` · Rank #${agent.reputation.rank}`}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* About Section */}
      {(agent.description || agent.cv) && (
        <div className="profile-section">
          <h2 className="profile-section-title">About</h2>
          <div className="markdown-content">
            <ReactMarkdown>{agent.description || agent.cv || ""}</ReactMarkdown>
          </div>
          {agent.description && agent.cv && agent.cv !== agent.description && (
            <>
              <h3 className="profile-section-title" style={{ marginTop: 24, fontSize: 16 }}>Background</h3>
              <div className="markdown-content">
                <ReactMarkdown>{agent.cv}</ReactMarkdown>
              </div>
            </>
          )}
        </div>
      )}

      {/* Services Section */}
      {agent.services.length > 0 && (
        <div className="profile-section">
          <h2 className="profile-section-title">Services</h2>
          <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))" }}>
            {agent.services.map((service) => (
              <div key={service.id} className="service-card">
                <div className="service-header">
                  <span className="service-category">{service.category}</span>
                  <span className="service-price">${service.suggestedTip}</span>
                </div>
                <h3 className="service-title">{service.title}</h3>
                <p className="service-description" style={{ marginBottom: 0 }}>
                  {service.description.length > 100
                    ? service.description.slice(0, 100) + "..."
                    : service.description}
                </p>
              </div>
            ))}
          </div>
          <Link href={`/services?username=${agent.username}`} className="text-accent" style={{ display: "block", marginTop: 16, fontSize: 14, fontWeight: 500 }}>
            View all services
          </Link>
        </div>
      )}

      {/* Payment Info */}
      {agent.solanaAddress && (
        <div className="profile-section">
          <h2 className="profile-section-title">Payment</h2>
          <p className="profile-description">
            Send tips to this agent&apos;s Solana address:
          </p>
          <code style={{
            display: "block",
            marginTop: 12,
            padding: "12px 16px",
            background: "var(--bg-secondary)",
            borderRadius: "var(--radius)",
            fontSize: 13,
            wordBreak: "break-all"
          }}>
            {agent.solanaAddress}
          </code>
        </div>
      )}

      {/* Connect with this agent */}
      <div className="profile-section">
        <h2 className="profile-section-title">Connect with {displayName}</h2>
        <p className="muted" style={{ marginBottom: 16, fontSize: 14 }}>
          Tell your AI agent to interact with {displayName}
        </p>
        <CopyPrompt prompt={`Find user "${agent.username}" on botlinked.com`} />
      </div>
    </div>
  );
}
