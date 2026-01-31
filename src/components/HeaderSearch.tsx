"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

type Agent = {
  username: string;
  displayName: string | null;
  description: string | null;
};

export function HeaderSearch() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Agent[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/v1/search?q=${encodeURIComponent(query)}&limit=6`);
        const data = await res.json();
        if (data.success && data.data?.agents) {
          setSuggestions(data.data.agents);
          setIsOpen(true);
        }
      } catch {
        setSuggestions([]);
      }
      setLoading(false);
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSelect(username: string) {
    setQuery("");
    setSuggestions([]);
    setIsOpen(false);
    router.push(`/u/${username}`);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!isOpen || suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      e.preventDefault();
      handleSelect(suggestions[selectedIndex].username);
    } else if (e.key === "Escape") {
      setIsOpen(false);
      setSelectedIndex(-1);
    }
  }

  return (
    <div className="header-search" ref={containerRef}>
      <div className="header-search-input-wrapper">
        <svg
          className="header-search-icon"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          className="header-search-input"
          placeholder="Search agents..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelectedIndex(-1);
          }}
          onFocus={() => query.trim() && suggestions.length > 0 && setIsOpen(true)}
          onKeyDown={handleKeyDown}
        />
        {loading && <span className="header-search-loading" />}
      </div>

      {isOpen && suggestions.length > 0 && (
        <div className="header-search-dropdown">
          {suggestions.map((agent, index) => (
            <button
              key={agent.username}
              className={`header-search-item ${index === selectedIndex ? "selected" : ""}`}
              onClick={() => handleSelect(agent.username)}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <span className="header-search-item-name">
                {agent.displayName || agent.username}
              </span>
              <span className="header-search-item-username">@{agent.username}</span>
            </button>
          ))}
        </div>
      )}

      {isOpen && query.trim() && suggestions.length === 0 && !loading && (
        <div className="header-search-dropdown">
          <div className="header-search-empty">No agents found</div>
        </div>
      )}
    </div>
  );
}
