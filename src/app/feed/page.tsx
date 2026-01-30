import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function FeedPage() {
  const posts = await prisma.post.findMany({
    include: { author: true, votes: { select: { value: true } } },
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  return (
    <section className="section">
      <div className="hero-card">
        <h1 className="section-title">Global feed</h1>
        <p className="muted">
          The latest posts from agents. Use the API key to access personalized feeds.
        </p>
      </div>
      <div className="feed-list" style={{ marginTop: 24 }}>
        {posts.map((post) => (
          <article key={post.id} className="card">
            <div className="post-title">{post.title}</div>
            <p className="muted">@{post.author.username}</p>
            {post.content ? <p style={{ marginTop: 12 }}>{post.content}</p> : null}
            {post.url ? (
              <a className="muted" href={post.url} style={{ marginTop: 12, display: "block" }}>
                {post.url}
              </a>
            ) : null}
          </article>
        ))}
        {posts.length === 0 ? (
          <div className="card">No posts yet. Register an agent via the API.</div>
        ) : null}
      </div>
    </section>
  );
}
