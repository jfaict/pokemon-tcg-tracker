"use client";

import { useState, useCallback } from "react";
import { SearchInput } from "@/components/SearchInput";
import { CardResult } from "@/components/CardResult";

interface CardEntry {
  card: {
    id: string;
    name: string;
    set: { name: string };
    number: string;
  };
  copies: Array<{ id: string; condition: "NM" | "LP" | "MP" | "HP" | "DMG"; location: string }>;
  copyCount: number;
}

type SearchError = "search-unavailable" | "collection-error" | "rate-limited";

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<CardEntry[] | null>(null);
  const [hasQueried, setHasQueried] = useState(false);
  const [error, setError] = useState<SearchError | null>(null);
  const [lastQuery, setLastQuery] = useState("");

  const doSearch = useCallback(async (q: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      if (res.status === 429) {
        setError("rate-limited");
        setResults(null);
      } else if (res.status === 500) {
        setError("collection-error");
        setResults(null);
      } else if (!res.ok) {
        setError("search-unavailable");
        setResults(null);
      } else {
        const data = await res.json();
        setResults(data.results ?? []);
      }
    } catch {
      setError("search-unavailable");
      setResults(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSearch = useCallback(
    async (q: string) => {
      if (!q.trim()) {
        setResults(null);
        setHasQueried(false);
        setIsLoading(false);
        setError(null);
        setLastQuery("");
        return;
      }
      setHasQueried(true);
      setLastQuery(q);
      await doSearch(q);
    },
    [doSearch]
  );

  const handleRetry = useCallback(() => {
    if (lastQuery) doSearch(lastQuery);
  }, [lastQuery, doSearch]);

  return (
    <main>
      <SearchInput onSearch={handleSearch} isLoading={isLoading} />

      {!hasQueried && !isLoading && <p>Type a card name to search</p>}

      {hasQueried && !isLoading && error === "rate-limited" && (
        <p>Too many searches — wait a moment and try again</p>
      )}

      {hasQueried && !isLoading && error === "collection-error" && (
        <p>{"Couldn't load your collection. Try again."}</p>
      )}

      {hasQueried && !isLoading && error === "search-unavailable" && (
        <div>
          <p>Search is unavailable. Try again.</p>
          <button type="button" onClick={handleRetry}>
            Try again
          </button>
        </div>
      )}

      {hasQueried && !isLoading && !error && results !== null && results.length === 0 && (
        <p>{`No cards found for '${lastQuery}'`}</p>
      )}

      {!error && results && results.length > 0 && (
        <>
          <ul>
            {results.map((r) => (
              <li key={r.card.id}>
                <CardResult
                  card={r.card}
                  copies={r.copies}
                  copyCount={r.copyCount}
                />
              </li>
            ))}
          </ul>
          {results.length === 20 && <p>Refine your search to see more</p>}
        </>
      )}
    </main>
  );
}
