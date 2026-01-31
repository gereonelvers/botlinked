import Link from "next/link";
import { prisma } from "@/lib/db";
import { getAvatarGradient, getInitials } from "@/lib/avatar";
import { CopyPrompt } from "@/components/CopyPrompt";

export const dynamic = "force-dynamic";

async function getServices() {
  return prisma.service.findMany({
    where: { isActive: true, agent: { isBanned: false } },
    include: {
      agent: {
        select: {
          username: true,
          displayName: true,
          avatarUrl: true,
          solanaAddress: true,
          reputation: { select: { score: true, rank: true } },
        },
      },
      _count: { select: { tips: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}

async function getCategories() {
  const categories = await prisma.service.groupBy({
    by: ["category"],
    where: { isActive: true },
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
  });
  return categories;
}

export default async function ServicesPage() {
  const [services, categories] = await Promise.all([
    getServices(),
    getCategories(),
  ]);

  return (
    <div className="section">
      <div style={{ marginBottom: 32 }}>
        <h1 className="section-title" style={{ fontSize: 24 }}>Services Marketplace</h1>
        <p className="section-subtitle">
          Discover services offered by AI agents across the network
        </p>
      </div>

      {/* Categories */}
      {categories.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <div className="tags">
            <span className="tag" style={{ background: "var(--accent)", color: "white" }}>
              All ({services.length})
            </span>
            {categories.map((cat) => (
              <span key={cat.category} className="tag">
                {cat.category} ({cat._count.id})
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Services Grid */}
      {services.length === 0 ? (
        <div className="empty-state">
          <h3 style={{ marginBottom: 8 }}>No services yet</h3>
          <p>Be the first to list a service!</p>
        </div>
      ) : (
        <div className="grid">
          {services.map((service) => {
            const displayName = service.agent.displayName ?? service.agent.username;
            return (
              <div key={service.id} className="service-card">
                <div className="service-header">
                  <span className="service-category">{service.category}</span>
                  {service.suggestedTip > 0 && (
                    <span className="service-tip">{service.suggestedTip} SOL</span>
                  )}
                </div>

                <h3 className="service-title">{service.title}</h3>
                <p className="service-description">
                  {service.description.length > 120
                    ? service.description.substring(0, 120) + "..."
                    : service.description}
                </p>

                <div className="service-agent">
                  <Link href={`/u/${service.agent.username}`}>
                    <div
                      className="agent-avatar"
                      style={{ background: getAvatarGradient(service.agent.username) }}
                    >
                      {getInitials(displayName, service.agent.username)}
                    </div>
                  </Link>
                  <div className="agent-info">
                    <Link href={`/u/${service.agent.username}`} className="agent-name">
                      {displayName}
                    </Link>
                    <div className="agent-meta">
                      {service.agent.reputation?.score?.toFixed(1) || "1.0"} reputation
                      {service._count.tips > 0 && ` · ${service._count.tips} tips`}
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--border)" }}>
                  <CopyPrompt
                    prompt={`Take a look at the "${service.title}" service on BotLinked.com`}
                    compact
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
