import { NextRequest, NextResponse } from "next/server";
import { verify } from "@/lib/auth";

const VALID_Q = /^[\w\s'\-.]+$/;
const MAX_Q_LEN = 100;
const RATE_LIMIT = 60;
const RATE_WINDOW_MS = 60_000;

const rateLimitMap = new Map<string, { count: number; windowStart: number }>();

export function validateQ(q: string): string | null {
  const trimmed = q.trim();
  if (!trimmed) return null;
  if (trimmed.length > MAX_Q_LEN) return null;
  if (!VALID_Q.test(trimmed)) return null;
  return trimmed;
}

type CatalogueCard = {
  id: string;
  name: string;
  set: { name: string };
  number: string;
};

type DbCopy = {
  id: string;
  card_id: string;
  condition: string;
  location: string;
  created_at: string;
};

type MergedCopy = {
  id: string;
  condition: string;
  location: string;
};

type MergedResult = {
  card: CatalogueCard;
  copies: MergedCopy[];
  copyCount: number;
};

export function mergeResults(
  cards: CatalogueCard[],
  copies: DbCopy[]
): MergedResult[] {
  return cards.map((card) => {
    const cardCopies = copies
      .filter((c) => c.card_id === card.id)
      .map(({ id, condition, location }) => ({ id, condition, location }));
    return { card, copies: cardCopies, copyCount: cardCopies.length };
  });
}

function checkRateLimit(sessionId: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(sessionId);
  if (!entry || now - entry.windowStart >= RATE_WINDOW_MS) {
    rateLimitMap.set(sessionId, { count: 1, windowStart: now });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count++;
  return true;
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  const cookieValue = req.cookies.get("session")?.value ?? "";
  const sessionId = verify(cookieValue);
  if (!sessionId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!checkRateLimit(sessionId)) {
    return NextResponse.json(
      { error: "Too many searches — wait a moment and try again" },
      { status: 429 }
    );
  }

  const q = validateQ(req.nextUrl.searchParams.get("q") ?? "");
  if (!q) {
    return NextResponse.json({ error: "Invalid or missing query" }, { status: 400 });
  }

  const ptcgUrl = `https://api.pokemontcg.io/v2/cards?q=name:%22*${encodeURIComponent(q)}*%22&pageSize=20`;

  let cards: CatalogueCard[];
  try {
    const ptcgRes = await fetch(ptcgUrl, {
      headers: { Authorization: `Bearer ${process.env.PTCG_API_KEY ?? ""}` },
    });
    if (!ptcgRes.ok) {
      return NextResponse.json(
        { error: "Search is unavailable. Try again." },
        { status: 502 }
      );
    }
    const data = (await ptcgRes.json()) as { data?: CatalogueCard[] };
    cards = data.data ?? [];
  } catch {
    return NextResponse.json(
      { error: "Search is unavailable. Try again." },
      { status: 502 }
    );
  }

  let dbCopies: DbCopy[];
  try {
    if (cards.length === 0) {
      dbCopies = [];
    } else {
      const { db } = await import("@/lib/db");
      const placeholders = cards.map(() => "?").join(", ");
      const result = await db.execute({
        sql: `SELECT * FROM copies WHERE card_id IN (${placeholders})`,
        args: cards.map((c) => c.id),
      });
      dbCopies = result.rows as unknown as DbCopy[];
    }
  } catch (err) {
    console.error("Turso read failed:", (err as Error).message);
    return NextResponse.json(
      { error: "Couldn't load your collection. Try again." },
      { status: 500 }
    );
  }

  return NextResponse.json({ results: mergeResults(cards, dbCopies) });
}
