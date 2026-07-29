# The spec: one purchase, six months, two tabs

## Outcome
- A spec drives the real form to register a 6-parcel purchase and asserts the
  row's parcel value, month range and total on screen.
- It asserts the same purchase is absent from `/recorrencias`, and that the
  second tab shows its months with the summed value.
- The five existing spec files stay green.

## Context

- **Seed from your own fixture file, never `seed.helper.ts`.**
  `e2e/ceiling.helper.ts` is the precedent and states why: *"kept out of
  seed.helper.ts so the four row specs keep the exact data they were written
  against"*. Copy its `post`/`list`/`waitFor` trio and its
  `const BASE_URL = "http://localhost:3100";` (bare Node `fetch`, no page
  context). Name the file `*.helper.ts` — Playwright collects `*.spec.ts` and
  would run a helper as a test.

- **The cross-worker lock idiom.** Every spec file runs in its own worker
  against ONE shared `e2e.db`, and `Person.name` is the only `@unique` column.
  From `seed.helper.ts`:

  ```ts
  const owner = await post("/api/people", { name: SHORT_PERSON, color: "violet" });
  if (!owner) return waitFor("/api/goals", SHORT_GOAL);
  ```

  Create a person with a name unique to this spec; whoever wins writes the
  rows, everyone else waits on the last row written.

- **The hazard that will bite: the derived period is global.**
  `derivePeriod` takes `Math.min`/`Math.max` over EVERY movement and
  recurrence in the database, installments included. `ceiling.spec.ts` asserts
  an exact fill ratio (`toBeCloseTo(20, 0)`) and
  `remaining === cumulative - monthly * (index + 1)`, and says so out loud:

  ```ts
  // Order matters, it is not politeness: the range is derived from EVERY entry
  // in the database, so the shared seed's 202611 recurrence has to have landed
  // before this fixture's months mean anything.
  ```

  So: read `seed.helper.ts` and `ceiling.helper.ts`, compute the min and max
  month they already write, and choose this spec's six parcel months strictly
  inside that window. If no six-month window fits, that is a real finding —
  say so rather than widening the range and "fixing" `ceiling.spec.ts`.

- **This is the SIXTH spec file, and `fullyParallel` is unset**, so workers
  scale with file count: adding one loads every other spec harder and can
  redden a geometry assertion that never flaked. `row-columns.spec.ts` and
  `row-hit-target.spec.ts` are pure geometry. If one goes red, use `settle`
  (`e2e/settle.helper.ts`, `settle(page, target)` — awaits `document.fonts.ready`
  then polls `boundingBox` for stability), never `retries`.

- **The idioms to imitate.** First assertion after a navigation carries
  `{ timeout: 15_000 }` — Turbopack's cold compile of the route. Person
  selection is `page.getByRole("combobox").selectOption({ label: person })`.
  A row is
  `page.getByRole("list").filter({ hasText: … }).getByRole("listitem").filter({ hasText: name })`.
  Absence is `await expect(page.getByText(name, { exact: true })).toHaveCount(0)`.

- **Watch out for** `getByText(/^R\$/)`: it drops an element when a child
  matches the same text, and a row here shows TWO money values (the parcel in
  the amount cell, the total in the period line). `row.helper.ts`'s
  `const value = row.getByText(/^R\$/)` assumes one match — scope to the cell
  or assert the exact strings instead.

- **Drive the UI, do not POST the purchase.** The division is what this story
  is for; a seeded row proves nothing about it. Seed only the person through
  the API.

## Scope
- In: `e2e/installments.helper.ts`, `e2e/installments.spec.ts`.
- Out: `e2e/seed.helper.ts`, `e2e/ceiling*.{ts}`, `e2e/row.helper.ts`,
  `playwright.config.ts`, and all of `src/`. If a source change looks
  necessary, that is a finding for the review, not part of this commit.

## Verify
- `npm run test` — the whole suite, with no `next dev` running in this
  directory (Next 16 refuses a second dev server from the same directory even
  on a free port, and `reuseExistingServer: false` means the run boots its
  own on :3100).
- Run it three times: `fullyParallel` being unset makes a new file a load
  change, and a flake that appears once in three is a real finding.
- Prove the spec is non-vacuous: temporarily replace `Math.ceil(totalCents / n)`
  with `totalCents` in the form and confirm the new spec turns red on the
  parcel value.
- `npx playwright install chromium` if the browser is missing on this checkout.

## Forbidden
- Touching `seed.helper.ts` or any existing spec to make this one pass.
- `retries`, `test.slow()`, or `waitForTimeout` as a fix for flakiness.
- Asserting on API JSON, the database, or a helper's return value — what is
  tested is what a user can see on screen.
- Parcel months that widen the database's global min/max.
