"use client";

import { useState } from "react";
import { AddCopyForm } from "./AddCopyForm";

type Condition = "NM" | "LP" | "MP" | "HP" | "DMG";

interface Card {
  id: string;
  name: string;
  set: { name: string };
  number: string;
}

interface Copy {
  id: string;
  condition: Condition;
  location: string;
}

interface Props {
  card: Card;
  copies: Copy[];
  copyCount: number;
}

export function CardResult({ card, copies, copyCount: initialCopyCount }: Props) {
  const [showAll, setShowAll] = useState(false);
  const [addFormOpen, setAddFormOpen] = useState(false);
  const [copyCount, setCopyCount] = useState(initialCopyCount);

  const visibleCopies = showAll ? copies : copies.slice(0, 5);
  const hasMore = copies.length > 5 && !showAll;

  async function handleSave(condition: Condition, location: string) {
    const res = await fetch("/api/copies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cardId: card.id, condition, location }),
    });
    if (!res.ok) {
      throw new Error("Couldn't save. Try again.");
    }
    setAddFormOpen(false);
    setCopyCount(1);
  }

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

      {copyCount === 0 && !addFormOpen && (
        <button onClick={() => setAddFormOpen(true)}>Add to collection</button>
      )}

      {copyCount === 0 && addFormOpen && (
        <AddCopyForm onSave={handleSave} />
      )}
    </div>
  );
}
