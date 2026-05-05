const ALGO = { name: "HMAC", hash: "SHA-256" } as const;
const enc = new TextEncoder();
const dec = new TextDecoder();

function getPassphrase(): string {
  const p = process.env.AUTH_PASSPHRASE;
  if (!p) throw new Error("AUTH_PASSPHRASE is not set");
  return p;
}

// djb2 hash — sync, no crypto needed, sufficient for passphrase rotation detection
function versionOf(passphrase: string): string {
  let h = 5381;
  for (let i = 0; i < passphrase.length; i++) {
    h = (((h << 5) + h) + passphrase.charCodeAt(i)) | 0;
  }
  return (h >>> 0).toString(36);
}

function b64url(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

function unb64url(s: string): Uint8Array<ArrayBuffer> {
  const base64 = s.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  const buf = new ArrayBuffer(binary.length);
  const bytes = new Uint8Array(buf);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function importKey(passphrase: string): Promise<CryptoKey> {
  return crypto.subtle.importKey("raw", enc.encode(passphrase), ALGO, false, [
    "sign",
    "verify",
  ]);
}

export async function sign(sessionId: string): Promise<string> {
  const passphrase = getPassphrase();
  const key = await importKey(passphrase);
  const hmacBuf = await crypto.subtle.sign(ALGO, key, enc.encode(sessionId));
  const hmac = b64url(hmacBuf);
  const sid = b64url(enc.encode(sessionId));
  const ver = versionOf(passphrase);
  return `${hmac}.${sid}.${ver}`;
}

export async function verify(cookie: string): Promise<string | null> {
  try {
    const passphrase = getPassphrase();
    const parts = cookie.split(".");
    if (parts.length !== 3) return null;
    const [hmacPart, sidPart, verPart] = parts;
    if (verPart !== versionOf(passphrase)) return null;
    const sessionId = dec.decode(unb64url(sidPart));
    const key = await importKey(passphrase);
    const valid = await crypto.subtle.verify(
      ALGO,
      key,
      unb64url(hmacPart),
      enc.encode(sessionId)
    );
    return valid ? sessionId : null;
  } catch {
    return null;
  }
}
