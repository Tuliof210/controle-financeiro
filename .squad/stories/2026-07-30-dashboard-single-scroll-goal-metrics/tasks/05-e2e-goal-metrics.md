# e2e: pin the three goal metrics against each other

## Outcome
- A Playwright spec drives `/` in a real browser and asserts the three metrics
  on the goal cards, plus the capacity figure they are derived from.
- The spec fails if metric B stops dividing by the goal count, if metric C
  stops queueing cheapest-first, or if the capacity stops being a quarter of
  the mean monthly ceiling.
- The whole suite (`npm run test`) is green.

## Context
- **Imitate** `e2e/ceiling.spec.ts` + `e2e/ceiling.helper.ts` +
  `e2e/ceiling-page.helper.ts`: seeding lives in a `*.helper.ts`, reaching and
  reading the screen lives in a `*-page.helper.ts`, and the spec file is
  assertions only. Playwright collects `*.spec.ts` only, so helpers are free.
  `ceiling.spec.ts` opens with a comment naming, per assertion, the source
  mutation it catches — do the same:
  > "- accumulator: drop `- authorised` from `gap` in `buildCeiling` […] and the
  > accumulator assertions fail from the second row on."
- **Reuse** `e2e/ceiling-page.helper.ts`'s `parseCents`, verbatim — it exists
  because `formatMoney` emits U+2212, not a hyphen:
  ```ts
  export const parseCents = (money: string) => {
    const digits = Number(money.replace(/[^\d,]/g, "").replace(",", "."));
    return Math.round(digits * 100) * (money.includes("−") ? -1 : 1);
  };
  ```
- **Reuse** `e2e/seed.helper.ts`, which already POSTs two goals with different
  targets (`/api/goals`, `targetCents: 500000` and `1234567`) — two goals of
  unequal size is exactly the fixture metric B and metric C need. Reuse
  `e2e/api.helper.ts`'s `post` if a third goal or a dedicated owner is wanted.
  `e2e/ceiling.helper.ts` shows the pattern for a fixture person plus its own
  income/expense months.
- **Assert relationships, not hand-measured numbers.** The dashboard range is
  derived from every entry in the database and the current month comes from the
  clock, so a literal month count would rot. The invariants that hold for any
  fixture with a positive capacity and goals sorted cheapest-first:
  - the cheapest goal's A equals its C;
  - A is non-decreasing down the list, and so is C;
  - for every goal, C >= A, and B == A when there is one goal, B > A when there
    is more than one;
  - with N goals, B ≈ N × A (equal up to the two `Math.ceil`s — assert
    `B >= A * N - 1` and `B <= A * N + 1` rather than exact equality);
  - the capacity, parsed off the banner, times 4, equals the mean of the
    `budget` figures read off the Teto de Gastos bars — reuse `readMonths` from
    `ceiling-page.helper.ts`, which already parses those off the accessible
    name (allow ±1 cent for the floor).
- **Watch out for** `.squad/learnings.md`: `fullyParallel` is unset, so workers
  scale with SPEC FILE count — a new file loads every other spec harder and can
  redden a geometry assertion that never flaked. Keep this spec to text and
  accessible names, with **no `boundingBox`, no layout measurement**, so it adds
  no geometry of its own. Never add `retries`.
- **Watch out for** `getByText` dropping an element when a child matches the
  same text — scope every read to its own card, the way `cardOf` does in
  `ceiling-page.helper.ts` (`page.locator("section").filter({ has: heading })`).
- **Watch out for** the 100-line cap: four e2e specs are already over it and
  report Biome infos. Do not add a fifth — split reaching/reading into the page
  helper and keep the spec under the cap. `wc -l` both files.

## Scope
- In: `e2e/` — a new spec plus whatever helper files keep it under the cap.
- Out: `src/`. If an assertion cannot be written without a `data-testid` or a
  markup change, say so rather than reaching into the app; every existing spec
  targets roles, headings and accessible names only.

## Verify
```
npm run test
npm run lint
wc -l e2e/*.ts
```
Then prove the spec can fail, the way `ceiling.spec.ts` documents its own
mutations: temporarily change metric B in `src/app/api/dashboard/goals.helper.ts`
to use metric A's formula, confirm the B assertions redden, and revert. Do the
same for metric C by dropping the running sum. Report both results.

## Forbidden
- No hardcoded month counts, completion months or cent amounts derived by hand
  from the fixture — the clock moves and the range is derived from the data.
- No `test.describe.configure({ retries })`, no `fullyParallel: true`, no edit
  to `playwright.config.ts`.
- No unit test, no test runner other than Playwright, and no test that pins a
  helper, hook or file name rather than what a user can see.
