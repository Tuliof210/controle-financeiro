# A spec that fails when the divisor goes missing

## Outcome
- A spec drives the dashboard for an owner whose projected balances are known
  by construction, and asserts the ceiling the card displays.
- Deleting the `(i + 1)` divisor from the ceiling formula turns it red, and
  that is demonstrated, not assumed.
- The empty state is covered too: an owner whose projection goes underwater
  gets the named month and shortfall, not a generic sentence.

## Context
This is the first spec that touches the dashboard — `grep -rn "dashboard"
e2e/` returns nothing today, so there is no precedent to copy for the seeding
or the navigation, only for the style.

- **CLAUDE.md and `.squad/ARCHITECTURE.md` are both wrong about this** — they
  say specs live in `e2e/` *"empty for now, so the run passes with
  `--pass-with-no-tests`"*. There are 4 specs and 51 tests, and the flag is set
  nowhere. Trust `npx playwright test --list`, not the docs.
- **Imitate the seeding contract in `e2e/seed.helper.ts`.** Seeding goes over
  HTTP against the app's own routes, never through Prisma, and every spec opens
  with `test.beforeAll(seed)`. The cross-worker lock is a DB constraint, not a
  mutex — `Person.name` is the only `@unique` column, so the first worker to
  `POST /api/people` writes everything and the losers poll:

  ```ts
  const owner = await post("/api/people", { name: SHORT_PERSON, color: "violet" });
  if (!owner) return waitFor("/api/goals", SHORT_GOAL);
  ```

  A new dashboard fixture must join that same lock, or two workers will race
  and the balances the assertions depend on will not be the balances on screen.
- **The dashboard is per-owner** — `DashboardScreen/hook.ts` fetches
  `/api/dashboard?owner=${encodeURIComponent(profile)}`. Adding a dedicated
  person with a known set of movements isolates the fixture from the existing
  seed. How `profile` gets chosen in the UI is not written down anywhere:
  read `DashboardScreen/hook.ts` and drive it, do not guess a selector.
- **Pick balances that make the bug visible.** The old formula and the new one
  must disagree loudly on the fixture — three months of projected cumulative
  in a rising shape (the story's `1000 / 1200 / 1500` gives `800` before and
  `400` after). A fixture where both formulas agree proves nothing.
- **Imitate the falsification note in `e2e/row-hit-target.spec.ts`**, which
  states its own recipe in a comment: *"To prove this spec is not vacuous:
  delete the `&::after` block from `src/components/IconButton/style.module.scss`
  and every case here must fail."* Write the equivalent for the divisor, and
  actually run it once before committing.
- **Selectors are user-visible only.** The whole suite uses
  `getByRole("button", { name })`, `getByRole("listitem").filter({ hasText })`,
  `getByText(name, { exact: true })`, `getByLabel(...)`. There are no testids
  and no class selectors anywhere; the two raw `page.locator` calls that exist
  carry an inline comment justifying themselves.
- **Every first wait pays for a cold Turbopack compile** — the suite's
  convention is `{ timeout: 15_000 }` with the reason in a comment, factored
  into `const SLOW = { timeout: 15_000 }` in `ofx-import.spec.ts`. The
  dashboard compiles the page *and* its API route on first hit.
- **Watch out for the money format.** `formatMoney` emits `R$ 1.234,56` with a
  non-breaking space and U+2212 for the minus sign, not a hyphen. And
  `.squad/learnings.md`: *"a regex like `/^R\$/` matches the wrapper too once
  the wrapper's own text starts there"* — anchor on the exact string.
- **`playwright.config.ts` facts that bite**: port 3100 on `localhost` (never
  `127.0.0.1`, Next 16 blocks it as a cross-origin dev resource), a throwaway
  `e2e.db` deleted and re-migrated per run, and `reuseExistingServer: false` —
  so a `next dev` running in this directory makes the whole run fail.

## Scope
- In: `e2e/` — a new `*.spec.ts` and, if the fixture needs new rows, an
  addition to `e2e/seed.helper.ts`.
- Out: `src/`. If a selector is unreachable without a markup change, that is a
  finding to report, not a licence to edit the card. Existing specs and
  `row.helper.ts` are read, not modified.

## Verify
- `npm run lint`
- `npx playwright test --list` — the new tests appear, and the total is higher
  than the 51 that exist today.
- `npm run test` green, with no `next dev` running in this directory.
- Then prove it can fail: remove the `(i + 1)` divisor from the ceiling
  formula, re-run, watch the new spec go red, and restore. Record in the task's
  commit message that this was done.

## Forbidden
- Seeding through Prisma or by writing `e2e.db` directly. HTTP only.
- A `data-testid`, or any selector reaching for a class name.
- Asserting on the `/api/dashboard` response instead of the screen. The repo
  tests what a user can see — an API assertion here would pin the payload
  shape, which is exactly the implementation detail this suite stopped paying
  for.
- Reusing the existing seed's person for the fixture. Its balances are set by
  other specs' needs and will drift.
- `test.only`, `test.skip`, or a hardcoded `http://localhost:3100` in the spec
  itself — navigation is relative, `baseURL` comes from the config.
