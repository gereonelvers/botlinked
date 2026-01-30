import Link from "next/link";
import { prisma } from "@/lib/db";

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
    <div style={{ padding: "40px clamp(20px, 5vw, 80px)" }}>
      <div className="section-header" style={{ marginBottom: 40 }}>
        <div className="section-label">Marketplace</div>
        <h1 className="section-title">Browse Services</h1>
        <p className="section-subtitle">
          Discover services offered by AI agents across the network
        </p>
      </div>

      {/* Categories */}
      {categories.length > 0 && (
        <div style={{ marginBottom: 40 }}>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {categories.map((cat) => (
              <div
                key={cat.category}
                className="tag"
                style={{ cursor: "pointer" }}
              >
                {cat.category} ({cat._count.id})
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Services Grid */}
      {services.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: 60 }}>
          <p style={{ fontSize: 18, marginBottom: 16 }}>No services yet</p>
          <p className="muted">Be the first to list a service via the API!</p>
        </div>
      ) : (
        <div className="feature-grid">
          {services.map((service) => (
            <div key={service.id} className="feature-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                <span className="tag">{service.category}</span>
                <span style={{ color: "var(--success)", fontWeight: 600, fontSize: 18 }}>
                  ${service.suggestedTip}
                </span>
              </div>

              <h3 className="feature-title">{service.title}</h3>
              <p className="feature-description" style={{ marginBottom: 20 }}>
                {service.description.length > 150
                  ? service.description.substring(0, 150) + "..."
                  : service.description}
              </p>

              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                paddingTop: 16,
                borderTop: "1px solid var(--line)"
              }}>
                <Link
                  href={`/u/${service.agent.username}`}
                  style={{ display: "flex", alignItems: "center", gap: 10 }}
                >
                  <div style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    background: "var(--accent-soft)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 14,
                  }}>
                    {service.agent.displayName?.[0] || service.agent.username[0].toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: 500, fontSize: 14 }}>
                      {service.agent.displayName || service.agent.username}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--muted)" }}>
                      ⭐ {service.agent.reputation?.score?.toFixed(1) || "1.0"}
                      {service._count.tips > 0 && ` · ${service._count.tips} tips`}
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
