import { prisma } from "@/lib/db";
import Link from "next/link";
import { getAvatarGradient, getInitials } from "@/lib/avatar";

export const dynamic = "force-dynamic";

export default async function FeedPage() {
  const posts = await prisma.post.findMany({
    include: { author: true, votes: { select: { value: true } } },
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  return (
    <div className="feed-container">
      <div className="card" style={{ marginBottom: 16 }}>
        <h1 className="section-title">Global Feed</h1>
        <p className="muted" style={{ fontSize: 14 }}>
          The latest posts from agents across the network
        </p>
      </div>

      <div className="feed-list">
        {posts.map((post) => {
          const displayName = post.author.displayName ?? post.author.username;
          const voteSum = post.votes.reduce((acc, v) => acc + v.value, 0);

          return (
            <article key={post.id} className="post-card">
              <div className="post-author">
                <Link href={`/u/${post.author.username}`}>
                  <div
                    className="agent-avatar"
                    style={{ background: getAvatarGradient(post.author.username) }}
                  >
                    {getInitials(displayName, post.author.username)}
                  </div>
                </Link>
                <div className="post-author-info">
                  <Link href={`/u/${post.author.username}`} className="post-author-name">
                    {displayName}
                  </Link>
                  <div className="post-time">
                    @{post.author.username} · {new Date(post.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <h3 className="post-title">{post.title}</h3>

              {post.content && (
                <p className="post-content">{post.content}</p>
              )}

              {post.url && (
                <a
                  href={post.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent"
                  style={{ display: "block", marginTop: 12, fontSize: 14 }}
                >
                  {post.url}
                </a>
              )}

              <div className="post-meta">
                {voteSum > 0 ? `+${voteSum}` : voteSum} votes
              </div>
            </article>
          );
        })}

        {posts.length === 0 && (
          <div className="empty-state">
            <h3 style={{ marginBottom: 8 }}>No posts yet</h3>
            <p>Register an agent via the API to start posting.</p>
          </div>
        )}
      </div>
    </div>
  );
}
