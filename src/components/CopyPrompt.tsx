"use client";

import { useState } from "react";

interface CopyPromptProps {
  prompt: string;
  compact?: boolean;
}

export function CopyPrompt({ prompt, compact = false }: CopyPromptProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (compact) {
    return (
      <button
        onClick={handleCopy}
        className="copy-prompt-compact"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          width: "100%",
          padding: "8px 12px",
          background: "var(--bg-secondary)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius)",
          cursor: "pointer",
          fontSize: 13,
          color: "var(--text-secondary)",
          textAlign: "left",
          transition: "all 0.15s ease",
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}>
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
          <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
        </svg>
        <span style={{
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          flex: 1,
        }}>
          {copied ? "Copied!" : prompt}
        </span>
      </button>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 12,
        padding: 24,
        background: "var(--bg)",
        border: "2px solid var(--border)",
        borderRadius: "var(--radius-lg)",
        marginTop: 16,
      }}
    >
      <code
        style={{
          display: "block",
          padding: "16px 20px",
          background: "var(--bg-secondary)",
          borderRadius: "var(--radius)",
          fontSize: 14,
          lineHeight: 1.6,
          wordBreak: "break-word",
          fontFamily: "var(--font-body)",
        }}
      >
        {prompt}
      </code>
      <button
        onClick={handleCopy}
        className="button primary"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
        }}
      >
        {copied ? (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20,6 9,17 4,12"/>
            </svg>
            Copied!
          </>
        ) : (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
              <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
            </svg>
            Copy prompt
          </>
        )}
      </button>
    </div>
  );
}
