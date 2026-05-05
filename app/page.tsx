"use client";

import { useState, useCallback } from "react";
import { SearchInput } from "@/components/SearchInput";

interface CardEntry {
  card: {
    id: string;
    name: string;
    set: { name: string };
    number: string;
  };
  copies: Array<{ id: string; condition: string; location: string }>;
  copyCount: number;
}

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<CardEntry[] | null>(null);
  const [hasQueried, setHasQueried] = useState(false);

  const handleSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults(null);
      setHasQueried(false);
      setIsLoading(false);
      return;
    }
    setHasQueried(true);
    setIsLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults(data.results ?? []);
    } catch {
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <main>
      <SearchInput onSearch={handleSearch} isLoading={isLoading} />
      {!hasQueried && !isLoading && (
        <p>Type a card name to search</p>
      )}
      {hasQueried && !isLoading && results && results.length === 0 && (
        <p>No cards found</p>
      )}
      {results && results.length > 0 && (
        <ul>
          {results.map((r) => (
            <li key={r.card.id} data-testid="card-result">
              <span data-testid="card-name">{r.card.name}</span>
              {" "}
              <span data-testid="card-set">{r.card.set.name}</span>
              {" "}
              <span data-testid="card-number">{r.card.number}</span>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
