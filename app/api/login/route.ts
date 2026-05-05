import { NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { sign } from "@/lib/auth";
import { v4 as uuidv4 } from "uuid";

const SESSION_COOKIE = "session";
const THIRTY_DAYS_SECONDS = 60 * 60 * 24 * 30;

export async function POST(req: Request): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (
    !body ||
    typeof body !== "object" ||
    !("passphrase" in body) ||
    typeof (body as { passphrase: unknown }).passphrase !== "string" ||
    (body as { passphrase: string }).passphrase.length === 0
  ) {
    return NextResponse.json({ error: "Missing passphrase" }, { status: 400 });
  }

  const { passphrase } = body as { passphrase: string };
  const expected = process.env.AUTH_PASSPHRASE;
  if (!expected) {
    return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
  }

  const passphraseBuffer = Buffer.from(passphrase);
  const expectedBuffer = Buffer.from(expected);
  const matches =
    passphraseBuffer.length === expectedBuffer.length &&
    timingSafeEqual(passphraseBuffer, expectedBuffer);

  if (!matches) {
    return NextResponse.json({ error: "Invalid passphrase" }, { status: 401 });
  }

  const sessionId = uuidv4();
  const cookieValue = await sign(sessionId);

  const res = NextResponse.json({ ok: true }, { status: 200 });
  res.cookies.set(SESSION_COOKIE, cookieValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: THIRTY_DAYS_SECONDS,
    path: "/",
  });

  return res;
}
