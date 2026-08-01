# One spec covering the round trip and the dashboard swing

## Outcome
- `npm run test` is green and now fails if the checkbox stops round-tripping,
  if the badge stops rendering, or if the dashboard stops honouring the
  selector.
- No existing spec file is edited.

## Context

**Add exactly one new spec file**, `e2e/simulated.spec.ts`, plus a helper file
if it does not fit. Two hard constraints pull against each other:

- Every helper header in `e2e/` repeats the same warning, verbatim from
  `ceiling-cap.helper.ts`: *"`fullyParallel` is unset, so workers scale with
  spec FILE count and a new one loads every geometry assertion in the suite
  harder for nothing."* One new file is the budget — not two.
- `scripts/check-line-cap.sh` hard-fails at 100 lines on any `src`/`e2e` file
  this branch touches. `e2e/interval-lock.spec.ts` is **119 lines** and
  `e2e/row-columns.spec.ts` **150** — grandfathered only because the branch has
  not touched them. Adding a test to either turns the cap red. Hence a new
  file, which must itself stay ≤ 100 (spill into `e2e/simulation.helper.ts`).

**Seed through the HTTP API, never the UI and never Prisma** — no `e2e/` file
imports `PrismaClient`. `e2e/api.helper.ts` gives you `post(path, body)`
(returns `.data`), `list(path)` and `waitFor(path, name)` against
`http://localhost:3100`.

**Imitate `e2e/interval-lock.spec.ts`'s isolation**, and copy its reason:

```ts
// Own person, not seed.helper.ts's fixtures: those rows are shared with the
// row-* specs and editing one from here would redden them.
const OWNER_NAME = "Locktoggle Spec Owner";

test.beforeAll(async () => {
  await seed();
  await post("/api/people", { name: OWNER_NAME, color: "cyan" });
});
```

`Person.name` is `@unique` and is the suite's cross-worker lock — `post` returns
undefined for the loser, which is what `seed()` branches on. Your person's name
must be unique to this spec. **Do not add a simulated forecast to
`e2e/seed.helper.ts`**: those rows are the fixtures `row-columns`,
`row-overflow` and `row-hit-target` measure.

**Imitate its selector doctrine** — role plus accessible name, `dialog[open]`
for the modal (its comment: *"the nav drawer is a `<dialog>` too, so the role
alone is a strict-mode violation"*), never a CSS-module class:

```ts
  const lock = page.getByRole("checkbox", { name: "Mês único" });
  await lock.check();
  await page.getByLabel("Responsável").selectOption({ label: OWNER_NAME });
  await page.getByRole("button", { name: "Adicionar", exact: true }).click();
  await page.getByRole("button", { name: `Editar ${FORECAST_NAME}` }).click();
```

**Imitate `e2e/ceiling-cap.helper.ts` for the dashboard half** — the exact
precedent for "a control that moves every figure", including why there is
nothing to await but the number itself:

```ts
// `was` is the first row's ceiling BEFORE the click, and polling until it moves
// is the whole wait. Nothing unmounts on a cap change — the board revalidates in
// place — so there is no appearing element to await; the arriving payload IS the
// figure changing.
  await expect.poll(first, SLOW).not.toBe(was);
```

`e2e/ceiling-page.helper.ts` exports `SLOW = { timeout: 15_000 }` and
`parseCents` — note its warning that the minus sign in rendered money is
**U+2212**, not a hyphen.

**Watch out for three traps the suite has already paid for.** Call
`settle(page, target)` (`e2e/settle.helper.ts`) before any geometry assertion,
and scroll with `evaluate((el) => el.scrollIntoView({ block: "center" }))`
rather than `scrollIntoViewIfNeeded`, which scrolls the minimum and can leave
the target under the sticky header. And `getByText` drops an element when a
child matches the same text — anchor with `{ exact: true }` or scope to the cell.

**Watch out for the dashboard assertion's fragility.** The board is
profile-scoped through the global header select (`aria-label="Perfil ativo"`),
so select this spec's own person before reading anything — otherwise the figures
carry every other spec's fixtures and the delta is not yours. Pick a figure that
must move: a simulated *expense* in a month inside the existing range changes
that month's expense. Poll for the change; never assert an absolute cent value.

## Scope
- In: `e2e/simulated.spec.ts` (new), and `e2e/simulation.helper.ts` (new) only
  if the spec would otherwise exceed 100 lines.
- Out: every existing file in `e2e/`, including `seed.helper.ts`. Out: all of
  `src/`, `prisma/` and `playwright.config.ts` — if a test cannot be written
  without production changes, that is a finding to report, not a licence to
  edit tasks 01–05's work.

## Verify
```
npm run test
npm run lint
```
Then prove the tests are load-bearing rather than incidentally green: revert
task 04's filter locally, confirm the dashboard test goes red, restore it, and
do the same with the badge. Report both results.

Also run `npm run test` twice — the suite has no `retries`, and a new spec file
adds a worker, which is documented as exactly what surfaced the flake `settle`
was written to fix. Two clean runs, or the file needs `settle` where it lacks it.

## Forbidden
- No `retries` in `playwright.config.ts`, and no `waitForTimeout` — poll with
  `expect.poll`.
- No second new spec file.
- No direct DB access from `e2e/`.
- No assertion on a CSS-module class name, or on an absolute money figure that
  another spec's fixtures could move.
