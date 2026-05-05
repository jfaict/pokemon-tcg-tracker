"use client";

import { useState } from "react";

interface Card {
  id: string;
  name: string;
  set: { name: string };
  number: string;
}

interface Copy {
  id: string;
  condition: "NM" | "LP" | "MP" | "HP" | "DMG";
  location: string;
}

interface Props {
  card: Card;
  copies: Copy[];
  copyCount: number;
}

export function CardResult({ card, copies, copyCount }: Props) {
  const [showAll, setShowAll] = useState(false);

  const visibleCopies = showAll ? copies : copies.slice(0, 5);
  const hasMore = copies.length > 5 && !showAll;

  return (
    <div data-testid="card-result">
      <div>
        <span data-testid="card-name">{card.name}</span>
        {" "}
        <span data-testid="card-set">{card.set.name}</span>
        {" "}
        <span data-testid="card-number">{card.number}</span>
        {" "}
        <span data-testid="copy-count">{copyCount}</span>
      </div>

      {copyCount > 0 && (
        <ul>
          {visibleCopies.map((copy) => (
            <li key={copy.id} data-testid="copy-row">
              <span>{copy.condition}</span>
              {" "}
              <span>{copy.location}</span>
            </li>
          ))}
        </ul>
      )}

      {hasMore && (
        <button
          data-testid="show-more"
          onClick={() => setShowAll(true)}
        >
          Show more
        </button>
      )}

      {copyCount === 0 && (
        <button>Add to collection</button>
      )}
    </div>
  );
}
