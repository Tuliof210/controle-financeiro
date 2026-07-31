# Realign the goals e2e handles to the new DOM

## Outcome
- `npx playwright test e2e/goals.spec.ts` is green again, with every assertion in
  `goals.spec.ts` and `goals-expect.helper.ts` unchanged.
- The new handles read the DOM's own structure (`<li>`, `data-cell`, `dt`/`dd`), never
  a hashed CSS-module class.

## Context
Only `e2e/goals-page.helper.ts` breaks. Tasks 01 and 02 leave it reading a shape that
no longer exists — `e2e/goals-page.helper.ts:61-79`:
```ts
// A goal card is the only <section> on this page carrying an <h3>. Read through
// the DOM's own structure — the target is the heading's next sibling — ...
export async function readGoals(page: Page) {
  const raw = await page
    .locator("section")
    .filter({ has: page.locator("h3") })
    .evaluateAll((nodes) =>
      nodes.map((node) => ({
        name: node.querySelector("h3")?.textContent?.trim() ?? "",
        target: node.querySelector("h3")?.nextElementSibling?.textContent ?? "",
        labels: [...node.querySelectorAll("dt")].map(...),
        values: [...node.querySelectorAll("dd")].map(...),
```
`evaluateAll` is NOT strict-mode-checked, so a selector that matches nothing returns
`[]` silently and the failure surfaces as `expected >= 2, received 0` at
`goals.spec.ts:40`. After task 02 the shape is: one `<ul>`, one `<li>` per goal, name
in `[data-cell="name"]`, target in `[data-cell="target"]`, three `<dt>`/`<dd>` pairs.

- **Imitate** the one existing role-based list handle in this suite,
  `e2e/row.helper.ts:74-83`:
  ```ts
  const row = page
    .getByRole("list")
    .filter({ hasText: list.long })
    .getByRole("listitem")
    .filter({ hasText: name });
  ```
- **Keep the return shape byte-identical** — `goals-expect.helper.ts` consumes
  `{ name, labels, target, dedicated, parallel, serialized }` with
  `type Goal = Awaited<ReturnType<typeof readGoals>>[number]`, and
  `goals.spec.ts:41` asserts `goals[0].labels` equals `METRIC_LABELS`. `target` is
  `parseCents` of the badge text; each metric is `parseMetric` → `{months, done}`.
- **Reuse** `parseCents` from `e2e/ceiling-page.helper.ts:15-18` (it reads the sign
  from the string because `formatMoney` emits U+2212, not a hyphen) and the local
  `parseMetric` at `goals-page.helper.ts:54-58` — neither needs to change.
- **Watch out for** `openGoals` (`:22-30`) and `readCapacity` (`:34-36`). `openGoals`
  keeps resolving after task 01 — the outer card is now the one `<section>` holding the
  `CAPACIDADE DE POUPANÇA` heading — but the locator it returns is now the WHOLE card,
  not the header band. `readCapacity` then takes `banner.locator("p").first()` in
  document order, which silently picks up any `<p>` that lands before the capacity
  figure. Scope it to the capacity paragraph explicitly rather than relying on order.
  A wrong parse here is worse than a red test: `expectQueue(goals, 0)` makes the
  FIXTURE guard at `goals-expect.helper.ts:76-79` pass vacuously — coverage lost with
  no failure.
- **Watch out for** `.squad/learnings.md:29`: `getByText` drops an element when a child
  matches the same text, and `innerText` puts no separator before an inline-block
  sibling — the capacity is `"R$ 1.328,98"` plus a `<span> /mês</span>`, so read it the
  way `readCapacity` already does (whole paragraph, `parseCents` strips the rest).
- **Watch out for** file caps (`sh scripts/check-line-cap.sh`, diff vs `main`):
  `e2e/goals.spec.ts` is AT 100 lines and `e2e/goals-page.helper.ts` is at 92. The spec
  must not grow by a line; if the helper needs more room, split it the way this suite
  already splits `goals-expect.helper.ts` off it.
- **Stale comment to fix**, or it lies to the next reader —
  `src/app/_components/DashboardScreen/components/HeroBand/index.tsx:23-24`:
  > `{/* An <h1>, and no <h3> anywhere in this band: goals.spec.ts finds a`
  > ` goal card as the only <section> on this page carrying one. */}`
  Same for `goals-page.helper.ts:20-21` and `:61-63`, which describe the old shape.
- **Watch out for** `.squad/learnings.md:34`: `fullyParallel` is unset, so workers
  scale with spec FILE count — do not add a spec file here.

## Scope
- In: `e2e/goals-page.helper.ts`, plus the two stale source comments named above.
- Out: `e2e/goals.spec.ts` and `e2e/goals-expect.helper.ts` — no assertion changes, no
  new test. `e2e/ceiling*` — insulated, they anchor on `Teto de Gastos`. `src/` markup —
  tasks 01 and 02 own it; if a handle is missing, that is a bug in task 02's contract,
  not something to patch around from the spec side.

## Verify
- `npx playwright test e2e/goals.spec.ts` — all five green.
- `npx playwright test` — the whole suite, since this is the story's last task.
- `npm run lint`

## Forbidden
- Do not weaken an assertion, delete a test, or add `retries` to make it pass
  (`.squad/learnings.md:34`).
- Do not select by a CSS-module class — the hashed name is not a contract.
- Do not add ARIA roles to `src/` to create a handle (see task 02's Biome pincer).
