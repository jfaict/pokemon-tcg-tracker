import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { verify } from "@/lib/auth";

const CARD_ID_RE = /^[a-z0-9]+-[a-z0-9]+$/i;
const VALID_CONDITIONS = new Set(["NM", "LP", "MP", "HP", "DMG"]);

type CopiesInput = { cardId: string; condition: string; location: string };

export function validateCopiesInput(body: unknown): CopiesInput | null {
  if (typeof body !== "object" || body === null) return null;
  const { cardId, condition, location } = body as Record<string, unknown>;

  if (typeof cardId !== "string" || !CARD_ID_RE.test(cardId) || cardId.length > 32) return null;
  if (typeof condition !== "string" || !VALID_CONDITIONS.has(condition)) return null;
  if (typeof location !== "string" || location.trim().length === 0 || location.length > 100) return null;

  return { cardId, condition, location };
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const sessionCookie = req.cookies.get("session")?.value ?? null;
  const sessionId = sessionCookie ? await verify(sessionCookie) : null;
  if (!sessionId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let rawBody: unknown;
  try {
    rawBody = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const input = validateCopiesInput(rawBody);
  if (!input) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const id = uuidv4();
  const createdAt = new Date().toISOString();

  try {
    const { db } = await import("@/lib/db");
    await db.execute({
      sql: "INSERT INTO copies (id, card_id, condition, location, created_at) VALUES (?, ?, ?, ?, ?)",
      args: [id, input.cardId, input.condition, input.location, createdAt],
    });
  } catch {
    return NextResponse.json({ error: "Failed to save copy" }, { status: 500 });
  }

  return NextResponse.json(
    { copy: { id, cardId: input.cardId, condition: input.condition, location: input.location } },
    { status: 201 }
  );
}
