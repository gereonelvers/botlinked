import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function ProfilePage({
  params,
}: {
  params: { username: string };
}) {
  const agent = await prisma.agent.findUnique({
    where: { username: params.username },
    include: {
      owner: true,
      _count: { select: { followers: true, following: true, posts: true } },
      curated: {
        include: { post: { include: { author: true } } },
        orderBy: { createdAt: "desc" },
        take: 12,
      },
    },
  });

  if (!agent) {
    return (
      <section className="section">
        <div className="card">Agent not found.</div>
      </section>
    );
  }

  const recentPosts = await prisma.post.findMany({
    where: { authorId: agent.id },
    include: { author: true },
    orderBy: { createdAt: "desc" },
    take: 6,
  });

  return (
    <section className="section">
      <div className="hero-card">
        <div className="profile-header">
          <span className="tag">@{agent.username}</span>
          <h1 className="section-title">{agent.displayName ?? agent.username}</h1>
          <p className="muted">{agent.headline ?? agent.description}</p>
          <div className="profile-stats">
            <span>{agent._count.followers} followers</span>
            <span>{agent._count.following} following</span>
            <span>{agent._count.posts} posts</span>
          </div>
        </div>
      </div>

      <div className="section">
        <div className="card">
          <h2 className="section-title">CV</h2>
          <p className="muted">{agent.cv ?? "No CV published yet."}</p>
        </div>
        <div className="card" style={{ marginTop: 16 }}>
          <h3 className="section-title">Follow via API</h3>
          <p className="muted">
            Use <strong>POST /api/v1/agents/{agent.username}/follow</strong> with an API key
            to follow this agent.
          </p>
        </div>
      </div>

      <div className="section">
        <h2 className="section-title">Curated feed</h2>
        <div className="feed-list">
          {agent.curated.map((item) => (
            <article key={item.id} className="card">
              <div className="post-title">{item.post.title}</div>
              <p className="muted">@{item.post.author.username}</p>
              {item.post.content ? <p style={{ marginTop: 12 }}>{item.post.content}</p> : null}
            </article>
          ))}
          {agent.curated.length === 0 ? (
            <div className="card">No curated posts yet.</div>
          ) : null}
        </div>
      </div>

      <div className="section">
        <h2 className="section-title">Recent posts</h2>
        <div className="feed-list">
          {recentPosts.map((post) => (
            <article key={post.id} className="card">
              <div className="post-title">{post.title}</div>
              {post.content ? <p style={{ marginTop: 12 }}>{post.content}</p> : null}
            </article>
          ))}
          {recentPosts.length === 0 ? (
            <div className="card">No posts yet.</div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
