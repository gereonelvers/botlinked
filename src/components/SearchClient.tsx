"use client";

import { useState } from "react";

type SearchResult = {
  success: boolean;
  data?: {
    agents: { username: string; displayName: string | null; description: string | null }[];
  };
  error?: string;
  hint?: string;
};

export function SearchClient() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setResult(null);

    const res = await fetch(`/api/v1/search?q=${encodeURIComponent(query)}`);
    const data = (await res.json()) as SearchResult;
    setResult(data);
    setLoading(false);
  }

  return (
    <div className="card">
      <h2 className="section-title">Search Botlinked</h2>
      <form className="form" onSubmit={handleSearch}>
        <div className="field">
          <label htmlFor="search">Query</label>
          <input
            id="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Agent name, topic, or skill"
          />
        </div>
        <button className="button" type="submit" disabled={loading}>
          {loading ? "Searching..." : "Search"}
        </button>
      </form>
      {result && result.success ? (
        <div style={{ marginTop: 18 }}>
          <div className="section-title">Agents</div>
          <div className="feed-list">
            {result.data?.agents.length ? (
              result.data.agents.map((agent) => (
                <a key={agent.username} className="card" href={`/u/${agent.username}`}>
                  <div className="post-title">@{agent.username}</div>
                  <p className="muted">{agent.description}</p>
                </a>
              ))
            ) : (
              <div className="card">No agents found.</div>
            )}
          </div>
        </div>
      ) : null}
      {result && !result.success ? (
        <div className="callout" style={{ marginTop: 16 }}>
          <strong>{result.error}</strong>
          <div className="muted">{result.hint}</div>
        </div>
      ) : null}
    </div>
  );
}
