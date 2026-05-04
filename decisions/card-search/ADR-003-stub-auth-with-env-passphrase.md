# Decision log

> One entry per real choice. Append-only. Never edit past entries — if a decision changes, write a new ADR that supersedes the old one.

## ADR-003 · Protect API routes with a single env-var passphrase (stub auth)

- **Date:** 2026-05-04
- **Status:** accepted
- **Type:** technical
- **Context:** The requirements NFR states that unauthenticated access to collection data is not permitted. A full authentication system is explicitly deferred to a separate spec. The app is single-user (Jonas only). A design decision is needed for how the API routes are protected in the interim.
- **Decision:** Next.js middleware checks for a signed `HttpOnly` session cookie set by a simple login page. The login page accepts a single passphrase stored as a Vercel environment variable (`AUTH_PASSPHRASE`). On match, `lib/auth.ts` generates a cookie value: `HMAC-SHA256(sessionId, AUTH_PASSPHRASE)` concatenated with the sessionId, base64url-encoded, plus a version claim (`v=<hash of AUTH_PASSPHRASE>`). Middleware rejects cookies with a version claim that does not match the current passphrase hash — rotating `AUTH_PASSPHRASE` immediately invalidates all existing sessions. A `POST /api/logout` route clears the cookie. All `/api/*` routes and the root page require a valid cookie; missing or invalid cookie redirects to `/login`.
- **Assumptions:**
  - Jonas is the sole user and knows the passphrase.
  - A 30-day cookie lifetime is acceptable for personal use on a trusted device.
  - The passphrase is strong enough to resist guessing (enforced by Jonas choosing it, not by the app).
  - This mechanism is explicitly temporary and will be superseded by a proper auth spec before any multi-user use.
- **Alternatives considered:**
  - **No auth now:** simplest, but explicitly violates the NFR. Rejected.
  - **Full auth system (Auth.js / Clerk):** correct long-term, but a separate spec is needed; doing it now adds scope and a dependency. Rejected for this feature.
  - **Bearer token in Authorization header:** requires the frontend to store the token (localStorage or similar), which is less secure than an `HttpOnly` cookie. Rejected in favour of cookie.
- **Consequences:**
  - *Easier:* zero UX friction — Jonas logs in once per 30 days; no external service; no npm dependency beyond Next.js built-ins.
  - *Harder:* no multi-device session management; no "forgot passphrase" flow; passphrase rotation requires a Vercel env var update (no redeploy needed — sessions expire immediately via version claim).
  - *Commits us to:* replacing this with a real auth spec before the app is shared with anyone else. The superseding ADR must update middleware, `lib/auth.ts`, and all session handling.
- **Source:** derived from `specs/card-search/design.md` and `specs/card-search/requirements.md` NFR — decision follows from the single-user constraint and the deferred auth spec.
