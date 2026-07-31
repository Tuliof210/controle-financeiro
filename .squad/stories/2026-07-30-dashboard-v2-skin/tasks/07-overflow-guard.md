# `/` joins the overflow spec, and the 1024px spill that blocks it closes

## Outcome
- `e2e/row-overflow.spec.ts` measures `/` alongside the three list routes, at all
  five widths, and passes.
- The tooltip bubble no longer spills past the viewport at 1024px on `/`.
- The three list routes still pass at all five widths, and the tooltip still opens
  beside its trigger at the widths where there is room for it.

## Context
This task runs last on purpose: it is the check that the six restyle tasks before
it did not reopen horizontal overflow on a route that has never had geometry
coverage.

**The spec today**, `e2e/row-overflow.spec.ts` (56 lines), verbatim in the parts
that matter:
```ts
const WIDTHS = [375, 767, 768, 1024, 1440];
const ROUTES = ["/previsoes", "/movimentacoes", "/configuracoes"];
test.beforeAll(seed);
...
await expect(page.getByText(LONG_NAME).first()).toBeVisible({ timeout: 15_000 });
```
`LONG_NAME` is a list-row fixture and never appears on `/`, so the readiness
anchor has to become per-route. Anchor `/` on something the board only renders
once the payload has arrived — the "Teto de Gastos" heading is the safest, since
`e2e/ceiling-page.helper.ts` already treats it as this card's stable handle. Keep
the 15s timeout: the first navigation in a fresh dev server also pays Turbopack's
cold compile.

**Seeding.** The spec's `beforeAll(seed)` comes from `e2e/seed.helper.ts`, which
seeds people, forecasts, movements and goals. It is not obvious that this leaves
`/` with a payload of `status: "ok"` rather than `no_range`/`out_of_range` — and
a board that never renders proves nothing. Run it and look. If the board does not
render, either select the seeded person through the profile combobox (`/` reads
one, and it is the only `<select>` on the page) or seed with `seedCeiling` from
`e2e/ceiling.helper.ts`, which exists precisely to give `/` a range covering the
current month. Say in your report which of the three you needed.

**The spill.** `src/components/Tooltip/style.module.scss` (100 lines — at the
cap) pins the bubble beside its trigger from `md` up:
```scss
  @include t.bp("md") {
    position: absolute;
    inset: calc(100% + var(--space-2)) auto auto 50%;
    transform: translateX(-50%);
```
with a `ponytail:` comment naming the exact defect: *"still no collision detection
at this size — see the debt entry, `/` overflows 12px at exactly 1024px."* The
debt entry names two exits; take the one that does not wait on a browser vendor —
**move that tier from `md` to `xl`**, so below 1280 the bubble uses the tier that
does not overhang. Rewrite both that comment and the `ROUTES` comment above, which
will no longer be true. The tooltip is shared: it reaches all 12 `SectionCard`
call sites plus `SavingsSection` and `leitor-ofx`'s import action — three of those
routes are already in this spec, so the spec is the proof.

**File caps.** `Tooltip/style.module.scss` is at 100 lines and the spec is at 56;
the four specs already over cap on main are the pre-existing 5 infos — do not add
a sixth. Adding a spec *file* would also raise Playwright's worker count and load
every other spec harder, which has reddened geometry assertions before — put the
per-route branching inside this spec, not in a new one.

**Finally, remove the debt entries this closes.** `.squad/debt.md` carries the
1024px tooltip entry that ends *"`\"/\"` cannot join `ROUTES` in
`e2e/row-overflow.spec.ts` until it goes"*. Delete it in this commit. Check the
file for any other entry whose file or symbol this story removed.

## Scope
- In: `e2e/row-overflow.spec.ts`, `src/components/Tooltip/style.module.scss`,
  `.squad/debt.md`.
- Out: every other spec and helper in `e2e/`, `playwright.config.ts`,
  `src/app/_components/DashboardScreen/**` — if `/` overflows, the fix belongs in
  whichever earlier task owns the offending element, not here. Report it rather
  than patching it from this task.

## Verify
- `npm run lint` and confirm the info count is still 5, naming the four files.
- `npm run build`.
- `npm test` in full — stop any `npm run dev` first, Next 16 locks per directory
  so a server on :3000 blocks Playwright's own on :3100. Report the pass count.
- `npx playwright test e2e/row-overflow.spec.ts` on its own and report every
  `/` case at all five widths.
- Browser preview at 768, 1024 and 1279: open a hint on the rightmost KPI card and
  confirm the bubble is fully on screen; at 1280 and 1440 confirm it opens beside
  its trigger as before. Check `/leitor-ofx`'s import hint too.
- `wc -l` both touched files.

## Forbidden
- No new spec file.
- No `retries`, no `fullyParallel`, no change to `playwright.config.ts`.
- No JS positioning library and no `position-try` — Safari does not ship it.
- Do not widen a viewport, drop a width, or relax the `<= 0` overflow assertion to
  make `/` pass.
