# E2E spec for the single-month lock

## Outcome
- A Playwright spec drives the lock on /previsoes end to end: a new row comes up
  locked with one picker, unlocking reveals the Início/Fim pair, and locking again
  collapses it.
- Saving a forecast from a locked row persists that single month, and reopening
  the same forecast for edit shows the row locked again.
- `npm run test` is green with the spec included.

## Context
- **The suite's shape** (`playwright.config.ts`, `e2e/`): specs are `e2e/*.spec.ts`
  only — helper files deliberately end in `.helper.ts` so Playwright skips them.
  Existing specs: `ceiling`, `nav-drawer`, `ofx-import`, `row-columns`,
  `row-hit-target`, `row-overflow`. None of them opens the forecast form; they
  seed over the API and assert on rendered rows.
- **Reuse the seeding plumbing**, `e2e/api.helper.ts` — verbatim exports:
  ```ts
  export const BASE_URL = "http://localhost:3100";
  export async function post(path: string, body: unknown)
  export async function list(path: string): Promise<Named[]>
  export async function waitFor(path: string, name: string)
  ```
  `e2e/seed.helper.ts` shows the real call shape for a forecast, and is also the
  reason a person must exist first:
  ```ts
  const owner = await post("/api/people", { name: SHORT_PERSON, color: "violet" });
  await post("/api/forecasts", { name: LONG_NAME, valueCents: 123456,
    type: "expense", ownerId: owner.id, months: [202601, 202602, 202603] });
  ```
  Seed your own uniquely-named person + forecast rather than reusing
  `seed.helper.ts`'s fixtures — those rows are shared with the row-* specs and
  editing one from here would redden them.
- **Watch out for the adjacency merge.** `ForecastForm/intervals.helper.ts`'s
  `monthsToIntervals` collapses consecutive months into one interval:
  ```ts
  if (last && nextMonth(last.end) === month) { last.end = month; }
  ```
  So two locked rows on Jan and Feb round-trip through save + reopen as ONE
  unlocked Jan..Feb row. That is pre-existing, correct behaviour and not this
  story's to change — pick **non-adjacent** months (e.g. 202601 and 202603) for
  any multi-row assertion, or the spec will look broken while the app is right.
- **Locators**: this app has no `data-testid` convention; specs locate by role and
  accessible name. `MonthPicker` exposes its two `<select>`s as
  `aria-label={`${label} - mês`}` / `${label} - ano`, so the presence or absence
  of the **Fim** picker is the cleanest lock assertion. The screen's add button is
  labelled `Nova previsão` (`ForecastsScreen/index.tsx`), the form opens in a
  native `<dialog>` (`EntryScreen`) — note more than one `<dialog>` can exist on
  the page (the nav drawer), so `getByRole("dialog")` alone is a strict-mode
  hazard; scope by the dialog's accessible name or by a control inside it.
- **Watch out for** `computer`-style key presses being unreliable on selects — use
  Playwright's `selectOption`, which the existing specs and the picker's
  `<select>` markup support directly.
- **Watch out for** worker scaling: `fullyParallel` is unset, so worker count
  tracks spec-FILE count — adding this file makes every other spec run under more
  load. If a geometry assertion in `row-*.spec.ts` reddens after this lands, it is
  the load, and the fix is `settle` (`e2e/settle.helper.ts`), never `retries`.
  This spec asserts on presence/values, not coordinates, so it should not need
  `settle` itself.

## Scope
- In: a new `e2e/*.spec.ts` (and a small `e2e/*.helper.ts` beside it only if the
  setup is genuinely shared with another spec — one file is expected).
- Out: `src/**` — this task changes no application code. If the spec cannot be
  written without touching a component, that is a finding to report, not a fix to
  make here. Also out: `playwright.config.ts` and the existing specs/helpers.

## Verify
- `npm run test` — green, whole suite, not just the new file.
- Run it twice; a spec that passes once and fails once is the worker-load issue
  above, not a flake to retry away.
- `npm run lint` — clean (Biome covers `e2e/` too).
- `wc -l` the new file against the 100-line cap.

## Forbidden
- No `retries` in `playwright.config.ts`, no `waitForTimeout`, no
  `test.describe.serial` to paper over the shared DB.
- No new `data-testid` in `src/` to make locating easier.
- No edits to `e2e/seed.helper.ts`'s existing fixtures or to the row-* specs.
