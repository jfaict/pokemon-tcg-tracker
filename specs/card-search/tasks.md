# Tasks: Card Search

---
references:
  - requirements.md
  - design.md
  - ../../decisions/card-search/ADR-001-use-pokemontcg-io-as-card-catalogue.md
  - ../../decisions/card-search/ADR-002-proxy-pokemontcg-via-api-route.md
  - ../../decisions/card-search/ADR-003-stub-auth-with-env-passphrase.md
  - ../../decisions/card-search/ADR-004-copies-table-schema.md
---

> Coding tasks only. Test-driven. Max 2 levels of nesting (1.1 ✓, 1.1.1 ✗).
> Each sub-task references the requirement it satisfies.
> `[fresh-ctx]` marks tasks that should be started in a new context window (`/execute card-search N`).

---

- [x] 1. Project scaffold + database migration
  - [x] 1.1 Initialise Next.js project (App Router, TypeScript strict) with `npx create-next-app@latest`; confirm `app/`, `public/`, `tsconfig.json` are present
        - References: Constitution: TypeScript, Next.js
  - [x] 1.2 Add runtime dependencies (`@libsql/client`, `uuid`) and dev dependencies (`@playwright/test`); add `.env.local.example` with `TURSO_DB_URL`, `TURSO_AUTH_TOKEN`, `AUTH_PASSPHRASE`, `PTCG_API_KEY`; wire all four as server-only env vars in `next.config.ts` (must not leak to client bundle)
        - References: NFR: Access model (credentials server-side only), NFR: Hosting cost
  - [x] 1.3 Configure Playwright (`playwright.config.ts`): single project named `mobile` using viewport 375×812, baseURL `http://localhost:3000`
        - References: REQ 3.3, 3.4
  - [x] 1.4 Write migration test (`lib/migrations/migrations.test.ts`): runs `001_create_copies.sql` against an in-memory SQLite DB, then asserts via `PRAGMA table_info(copies)` that columns `id`, `card_id`, `condition`, `location`, `created_at` exist with correct types, and that `idx_copies_card_id` is present [RED]
        - References: REQ 2.1, 2.3 (copies need condition, location)
  - [x] 1.5 Write `lib/migrations/001_create_copies.sql` (copies table + index per ADR-004) and `lib/db.ts` (Turso libsql client, read/write token); add `npm run db:migrate` script that runs all `lib/migrations/*.sql` files in order; wire script into Vercel build step in `package.json` [GREEN for 1.4]
        - References: REQ 2.1, 2.3, NFR: Hosting cost

- [ ] 2. Auth layer (stub passphrase, ADR-003)
  - [x] 2.1 Write unit tests for `lib/auth.ts` (`auth.test.ts`): `sign()` produces a base64url string; `verify()` returns the sessionId for a valid cookie; `verify()` returns null for a tampered cookie; `verify()` returns null when the version claim does not match the current `AUTH_PASSPHRASE` hash [RED]
        - References: NFR: Access model
  - [x] 2.2 Implement `lib/auth.ts`: `sign(sessionId)` → HMAC-SHA256 cookie with version claim; `verify(cookie)` → sessionId or null [GREEN for 2.1]
        - References: NFR: Access model
  - [x] 2.3 Write tests for `middleware.ts` using Next.js test utilities: unauthenticated `GET /` → 302 redirect to `/login`; unauthenticated `GET /api/search` → 401; authenticated `GET /` (valid signed cookie) → passes through [RED]
        - References: NFR: Access model
  - [x] 2.4 Implement `middleware.ts`: verify signed cookie on all routes except `/login`; redirect page routes to `/login`, return 401 for API routes on failure [GREEN for 2.3]
        - References: NFR: Access model
  - [x] 2.5 Implement `app/login/page.tsx` (passphrase input form) and `POST /api/login` route (compare passphrase with `AUTH_PASSPHRASE`, set signed `HttpOnly` session cookie, redirect to `/`; return 401 on mismatch)
        - References: NFR: Access model
  - [x] 2.6 Implement `POST /api/logout/route.ts`: clear session cookie, return 200; middleware will redirect to `/login` on the next request
        - References: NFR: Access model

- [ ] 3. Search API + basic search page + first E2E happy path [fresh-ctx]
  - [x] 3.1 Write failing E2E test (`e2e/search-happy-path.spec.ts`, 375×812 viewport): authenticate → load `/` → assert "Type a card name to search" prompt visible; type "Pikachu" → debounce fires → assert at least one result card with name, set name, and collector number visible within 3 s [RED — search page does not exist yet]
        - References: REQ 1.1, 1.3, 1.4, 1.6, 3.1, 3.2, 3.3, 3.5
  - [x] 3.2 Write unit tests for `GET /api/search` internals: `validateQ()` accepts `"Charizard"`, rejects empty string, rejects whitespace-only, rejects `"<script>"` (invalid chars), rejects string >100 chars; merge function: given catalogue array and copies array, output has correct `copyCount` and nested `copies` for each card [RED]
        - References: REQ 1.3, 1.7, 2.1
  - [x] 3.3 Implement `app/api/search/route.ts`: validate `q`, check per-session rate limit (in-memory Map, 60 req/min), proxy `GET /v2/cards?q=name:*{q}*&pageSize=20` to pokemontcg.io with `Authorization: Bearer PTCG_API_KEY`, `SELECT * FROM copies WHERE card_id IN (…)` from Turso, merge inline, return merged JSON [GREEN for 3.2]
        - References: REQ 1.1, 1.3, 1.6, 1.7, 2.1, 2.3, 2.5
  - [x] 3.4 Write integration tests for `GET /api/search` error paths (using pokemontcg.io mock and real in-memory SQLite): 400 on empty `q`, 400 on invalid chars, 401 on missing cookie, 429 on rate limit exceeded, 502 when pokemontcg.io is unreachable, 500 when Turso read fails (assert response is not a 0-copy result — REQ 2.5) [RED → GREEN via 3.3]
        - References: REQ 1.4, 2.5, 3.6, NFR: Access model
  - [x] 3.5 Implement `hooks/useDebounce.ts` (300 ms delay, resets on every call) with unit tests (`useDebounce.test.ts`): value updates after 300 ms; intermediate calls do not fire; returns immediately on unmount; implement `components/SearchInput.tsx` (controlled input, calls `useDebounce`, shows loading spinner immediately when fetch fires); implement `app/page.tsx` skeleton: search input as primary element, "Type a card name to search" empty state, plain result list (name / set / collector number) with no CardResult yet [GREEN for 3.1 E2E — capture screenshot]
        - References: REQ 1.1, 1.2, 1.4, 1.6, 3.1, 3.2, 3.3, 3.5

- [ ] 4. CardResult component + inline copy display [fresh-ctx]
  - [x] 4.1 Write unit tests for `components/CardResult.tsx` (`CardResult.test.tsx`): renders name, set name, collector number; `copyCount = 0` → copy count shows "0" as text and "Add to collection" button is present; `copyCount = 0` → no copy detail rows; `copyCount = 3` → three rows each showing condition and location; no "Add to collection" button when `copyCount > 0`; `copies.length = 6` → first 5 rows visible, "show more" control present [RED]
        - References: REQ 2.1, 2.2, 2.3, 2.4, 4.1, 4.6
  - [x] 4.2 Implement `components/CardResult.tsx`: renders catalogue card header + copy count as numeric text + conditional copy detail rows (max 5, inline "show more") + conditional "Add to collection" button [GREEN for 4.1]
        - References: REQ 2.1, 2.2, 2.3, 2.4, 4.1, 4.6
  - [x] 4.3 Replace plain result list in `app/page.tsx` with `CardResult`; write E2E test (`e2e/copy-details.spec.ts`): seed DB with one owned copy of a Pikachu card → search "Pikachu" → assert copy count "1", condition, and location visible inline on a single screen (no navigation) → capture screenshot [RED → GREEN]
        - References: REQ 2.1, 2.2, 2.3, 3.2
  - [ ] 4.4 Write E2E test (`e2e/layout.spec.ts`): search a card with a name longer than 30 chars → assert no `text-overflow: ellipsis` and no horizontal scroll at 375 px width (use Playwright `evaluate` to check computed styles) [RED → GREEN — fix CSS if needed]
        - References: REQ 1.8

- [ ] 5. Copies API + AddCopyForm (quick-add flow) [fresh-ctx]
  - [ ] 5.1 Write unit tests for `POST /api/copies` input validation: `cardId` matching `/^[a-z0-9]+-[a-z0-9]+$/i` (max 32 chars) passes; invalid formats (`""`, `"../etc"`, too-long string) rejected with 400; condition not in `NM|LP|MP|HP|DMG` → 400; location empty after trim → 400; location 100 chars → accepted [RED]
        - References: REQ 4.5
  - [ ] 5.2 Write integration tests for `POST /api/copies`: valid body → 201 with `{ copy: { id, cardId, condition, location } }`; confirm row inserted in DB; `created_at` stored but not returned; 401 with no cookie; 500 when Turso write fails (assert error message in response, not silent discard) [RED]
        - References: REQ 4.3, 4.4, 4.5
  - [ ] 5.3 Implement `app/api/copies/route.ts`: validate body fields, generate UUID v4 server-side, `INSERT INTO copies`, return 201 with copy (excluding `created_at`) [GREEN for 5.1, 5.2]
        - References: REQ 4.2, 4.3, 4.4, 4.5
  - [ ] 5.4 Write unit tests for `components/AddCopyForm.tsx` (`AddCopyForm.test.tsx`): renders condition `<select>` with options NM/LP/MP/HP/DMG and location `<input>`; Save button disabled when either field is empty; Save button disabled and spinner visible while `onSave` promise is pending; inline error text visible when `onSave` rejects [RED]
        - References: REQ 4.2, 4.4, 4.5
  - [ ] 5.5 Implement `components/AddCopyForm.tsx` (inline condition select + location text input + Save/spinner/error); wire into `CardResult`: form renders only when `copyCount === 0`, closes on save success and increments count to 1 locally, shows inline error on failure [GREEN for 5.4]
        - References: REQ 4.1, 4.2, 4.3, 4.4, 4.5, 4.6
  - [ ] 5.6 Write E2E test (`e2e/add-copy.spec.ts`): search card with 0 copies → "Add to collection" button visible → tap → form opens with condition and location fields → fill NM + "Binder 1" → Save → copy count updates to "1" without page reload → capture screenshot; also assert Add button absent after success [RED → GREEN]
        - References: REQ 4.1, 4.2, 4.3, 4.4, 4.5, 4.6

- [ ] 6. Error states + remaining edge cases
  - [ ] 6.1 Write E2E tests (`e2e/error-states.spec.ts`): (a) search unknown term → "No cards found for '…'" message visible, no blank screen; (b) mock pokemontcg.io to return 500 → "Search is unavailable. Try again." banner + retry button visible; (c) mock Turso read to fail → distinct "Couldn't load your collection. Try again." banner visible (not a zero-copy result); (d) trigger rate limit (61 requests) → "Too many searches — wait a moment and try again" message; (e) search returning exactly 20 results → "Refine your search to see more" prompt visible [RED]
        - References: REQ 1.5, 1.7, 2.5, 3.6
  - [ ] 6.2 Write unit test: `useDebounce` does not call fetch when the debounced value is whitespace-only; `app/page.tsx` does not call `/api/search` when query is empty or whitespace [RED]
        - References: REQ 1.4
  - [ ] 6.3 Implement all missing UI states in `app/page.tsx`: no-results message, search error banner with retry action, DB-read error banner (distinct copy), rate-limit message, 20-result refine prompt (when `results.length === 20`); suppress search call on whitespace [GREEN for 6.1, 6.2]
        - References: REQ 1.4, 1.5, 1.7, 2.5, 3.6
  - [ ] 6.4 Write E2E test (`e2e/add-copy-failure.spec.ts`): mock `POST /api/copies` to return 500 → tap Save → "Couldn't save. Try again." visible inline in form; save button re-enabled; form stays open [RED → GREEN — fix AddCopyForm if needed]
        - References: REQ 4.4

- [ ] 7. E2E screenshot suite + user-docs
  - [ ] 7.1 Verify portrait orientation at 375×812: run full E2E suite; assert no horizontal scrollbar and all interactive elements tappable in portrait layout
        - References: REQ 3.4
  - [ ] 7.2 Capture all required user-docs screenshots with Playwright (`page.screenshot()`): (a) owned card with copy details visible, (b) unowned card with "Add to collection" button, (c) add form open with fields, (d) after save with copy count updated; save under `e2e/screenshots/card-search/`
        - References: REQ 1.6, 2.3, 4.3
  - [ ] 7.3 Run `/doc card-search` to generate `user-docs/card-search.md` from acceptance criteria + screenshots; verify front-matter includes `spec: specs/card-search/requirements.md`, `adrs: [ADR-001, ADR-002, ADR-003, ADR-004]`, `last-verified: <today>`
        - References: REQ 1.1–4.6 (user-docs covers full feature)

---

## Coverage table

Every EARS acceptance criterion is referenced by at least one test sub-task.

| Criterion | Test sub-tasks |
|---|---|
| 1.1 Results within 3 s of keystroke pause | 3.1 (E2E timing assertion), 3.3 |
| 1.2 Debounce — no per-keystroke search | 3.5 (useDebounce unit), 6.2 (unit) |
| 1.3 Case-insensitive partial match | 3.1 (E2E: "Pikachu"), 3.2 (unit), 3.3 |
| 1.4 Empty / whitespace → no search, show prompt | 3.1 (E2E), 6.2 (unit), 6.3 |
| 1.5 No results → "no cards found" message | 6.1a (E2E), 6.3 |
| 1.6 Name, set name, collector number in results | 3.1 (E2E), 3.5 |
| 1.7 >20 results capped at 20 + refine prompt | 3.2 (unit), 3.3, 6.1e (E2E), 6.3 |
| 1.8 Long card name no overflow at 375 px | 4.4 (E2E) |
| 2.1 Copy count displayed per result | 4.1 (unit), 4.2, 4.3 (E2E) |
| 2.2 Copy count as number (not colour/icon) | 4.1 (unit: asserts text "0" / "3") |
| 2.3 Copy details inline (condition, location) | 4.1 (unit), 4.3 (E2E) |
| 2.4 >5 copies → first 5 + "show more" | 4.1 (unit), 4.2 |
| 2.5 DB read error → distinct message, not 0 | 3.4 (integration), 6.1c (E2E), 6.3 |
| 3.1 Search input is primary element on load | 3.1 (E2E), 3.5 |
| 3.2 Full lookup on single screen | 3.1 (E2E), 4.3 (E2E) |
| 3.3 Renders correctly at 375 px+ | 3.1 (E2E), 4.3 (E2E), 4.4 (E2E) |
| 3.4 Usable in portrait orientation | 7.1 (E2E) |
| 3.5 Loading indicator within 300 ms | 3.1 (E2E: spinner visible), 3.5 |
| 3.6 Network error → readable message + retry | 3.4 (integration: 502), 6.1b (E2E), 6.3 |
| 4.1 "Add" action shown at 0 copies | 4.1 (unit), 5.6 (E2E) |
| 4.2 Add in-progress indicator visible | 5.4 (unit), 5.6 (E2E) |
| 4.3 Add success → count updates without reload | 5.2 (integration), 5.6 (E2E) |
| 4.4 Add failure → inline error, no silent discard | 5.2 (integration), 5.4 (unit), 6.4 (E2E) |
| 4.5 Condition + location required before save | 5.1 (unit), 5.4 (unit), 5.2 (integration) |
| 4.6 No "Add" action when copies > 0 | 4.1 (unit: asserts button absent), 5.6 (E2E: absent after save) |

---

## Definition of done

- [ ] All task boxes checked
- [ ] All tests green (`npm test` + `npx playwright test`)
- [ ] TypeScript strict mode — zero errors (`npm run typecheck`)
- [ ] Linter clean (`npm run lint`)
- [ ] Decision log updated for any choices made during execution (e.g. "show more" UX for >5 copies — inline expand vs. modal)
- [ ] All required E2E screenshots captured under `e2e/screenshots/card-search/`
- [ ] `user-docs/card-search.md` generated with correct front-matter and screenshot links

---

_v1 — generated by `/tasks card-search`, 2026-05-04_
