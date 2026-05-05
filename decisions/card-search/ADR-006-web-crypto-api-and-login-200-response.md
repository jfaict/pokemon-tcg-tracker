# Decision log

> One entry per real choice. Append-only. Never edit past entries — if a decision changes, write a new ADR that supersedes the old one.

## ADR-006 · Use Web Crypto API in lib/auth and return 200 from POST /api/login

- **Date:** 2026-05-05
- **Status:** accepted
- **Type:** technical
- **Context:** During task 3.5 (E2E test execution), two auth bugs were uncovered that had been invisible in the unit-test suite but broke the real browser flow:

  1. **Edge Runtime incompatibility.** Next.js middleware runs in the Edge Runtime (not Node.js), which does not support Node.js built-in modules. `lib/auth.ts` imported `createHmac`, `createHash`, and `timingSafeEqual` from Node.js's `crypto` module. The dev server emitted `A Node.js module is loaded ('crypto')` warnings and the middleware silently failed to verify session cookies, causing every authenticated request to redirect back to `/login`.

  2. **Safari fetch-redirect cookie persistence.** The original `POST /api/login` route returned a `302` redirect to `/` with a `Set-Cookie` header. The login page used `fetch` to call the route; `fetch` followed the redirect internally. In Safari/WebKit (used by Playwright's `mobile` project), cookies set on fetch-followed redirect responses are not applied to the browser's cookie jar for subsequent full-page navigations. As a result, `window.location.href = "/"` after a successful login landed at `/login` again because the session cookie was absent.

- **Decision:**
  1. Rewrite `lib/auth.ts` to use the Web Crypto API (`crypto.subtle`) exclusively. `sign()` and `verify()` become `async`. The passphrase version claim uses a synchronous djb2 hash (no crypto needed; purpose is rotation detection, not authentication). HMAC signing and verification use `crypto.subtle.sign` / `crypto.subtle.verify`, which are available in both Edge Runtime and Node.js 18+ without any polyfill.
  2. Change `POST /api/login` to return `200 { ok: true }` with `Set-Cookie` on the response body (not on a redirect). The login page's `fetch` call receives the cookie in a direct response; browsers reliably apply `Set-Cookie` from non-redirect responses. Client-side navigation (`window.location.href = "/"`) then carries the cookie as expected.

- **Assumptions:**
  - `globalThis.crypto.subtle` is available in Next.js Edge Runtime and in Node.js 18+ (used by Vitest's jsdom environment). This has been verified experimentally.
  - djb2 is collision-resistant enough for version-detection purposes (distinguishing one passphrase from another). It is not used for authentication.
  - Returning `200` from the login API (instead of `302`) is a deliberate SPA pattern; it does not weaken security because the cookie is `HttpOnly` and the redirect is handled client-side.
  - All callers that used `sign()` or `verify()` synchronously have been updated to `await` the calls.

- **Alternatives considered:**
  - **`experimental.nodeMiddleware: true` in next.config.ts:** Would let middleware import Node.js modules. Rejected: the flag is experimental and may be removed; it also conflicts with the Next.js 16 deprecation of `middleware.ts` in favour of `proxy.ts`. Fixing the library is more portable.
  - **Separate Edge-compatible auth module:** Keep the Node.js auth for API routes and write a second Web Crypto auth module for middleware only. Rejected: two implementations of the same signing logic would diverge silently; one implementation is simpler and the Web Crypto API works in both runtimes.
  - **Return `302` and set cookie via a meta-refresh or hidden form POST:** Workaround for the Safari redirect issue. Rejected: fragile, non-standard, and adds complexity to the login page.
  - **Keep `302`, use `credentials: "include"` on the fetch call:** Does not solve the problem; `SameSite=lax` with a same-origin fetch already includes credentials. The issue is specifically about cookies from redirect responses not being applied before the subsequent navigation.

- **Consequences:**
  - *Easier:* Auth code works in all Next.js runtimes without configuration; login flow works reliably in Safari, Chrome, and Firefox.
  - *Harder:* All callers of `sign` and `verify` must `await` them. Existing sync call sites (tests, API routes) were updated in this commit; future callers must do the same.
  - *Bug fixed alongside:* `middleware.ts` was not allowing `POST /api/login` through unauthenticated — it only exempted paths starting with `/login` (the page), not `/api/login` (the route). Fixed by adding `pathname === "/api/login"` to the bypass condition.
  - *Commits us to:* Web Crypto API for all future cryptographic operations in this project's auth layer.

- **Source:** Discovered and resolved during task 3.5 execution, 2026-05-05.
