import { createHmac, createHash, timingSafeEqual } from "crypto";

function getPassphrase(): string {
  const p = process.env.AUTH_PASSPHRASE;
  if (!p) throw new Error("AUTH_PASSPHRASE is not set");
  return p;
}

function b64url(buf: Buffer): string {
  return buf.toString("base64url");
}

function unb64url(s: string): Buffer {
  return Buffer.from(s, "base64url");
}

function versionOf(passphrase: string): string {
  return b64url(createHash("sha256").update(passphrase).digest().subarray(0, 8));
}

function hmacOf(sessionId: string, passphrase: string): Buffer {
  return createHmac("sha256", passphrase).update(sessionId).digest();
}

export function sign(sessionId: string): string {
  const passphrase = getPassphrase();
  const hmac = b64url(hmacOf(sessionId, passphrase));
  const sid = b64url(Buffer.from(sessionId, "utf8"));
  const ver = versionOf(passphrase);
  return `${hmac}.${sid}.${ver}`;
}

export function verify(cookie: string): string | null {
  try {
    const passphrase = getPassphrase();
    const parts = cookie.split(".");
    if (parts.length !== 3) return null;

    const [hmacPart, sidPart, verPart] = parts;

    if (verPart !== versionOf(passphrase)) return null;

    const sessionId = unb64url(sidPart).toString("utf8");
    const expected = hmacOf(sessionId, passphrase);
    const actual = unb64url(hmacPart);

    if (actual.length !== expected.length) return null;
    if (!timingSafeEqual(actual, expected)) return null;

    return sessionId;
  } catch {
    return null;
  }
}
