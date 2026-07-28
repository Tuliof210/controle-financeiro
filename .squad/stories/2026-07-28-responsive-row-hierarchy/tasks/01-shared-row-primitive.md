# Extract the shared row primitive and adopt it in Recorrências + Movimentações

## Outcome
- A row component in `src/components/` owns the internal layout of a list row, and
  `EntryRow` renders through it — so the row's stylesheet is the single place a
  breakpoint for row layout lives.
- On `/recorrencias` and `/movimentacoes`, name + amount read as the primary tier and
  owner + period as a secondary tier once the card is too narrow for one line; the two
  icon buttons never separate from each other or from their row.
- Neither screen scrolls horizontally at 375px, 768px or 1024px.

## Independently shippable
yes

## Scope
- In: `src/components/EntryRow/`, the new row component folder under
  `src/components/`, `src/components/EntryScreen/style.module.scss`,
  `playwright.config.ts`, `e2e/`
- Out: `src/app/configuracoes/**` (task 02 moves those rows), `IconButton`'s 44px
  box, `SectionCard`, the API routes and entities, and `CoverageBar`'s percentage
  maths and span-only markup
- Imitate: `src/app/configuracoes/_components/SettingsScreen/style.module.scss` — its
  `minmax(0, 1fr)` track and the comment explaining the 375px sideways-scroll fix.
  `src/components/EntryScreen/style.module.scss` still uses a bare `1fr` and is the
  reason the entry screens overflow; give it the same treatment.
- Reuse: `t.bp()` and `$breakpoints` from `src/styles/_theme.scss` (mobile-first
  `min-width` only), `src/styles/_swatch-colors.scss` for the owner dot, `formatMoney`
  from `src/lib/money.ts`

## When to run
- Depends on: none
- Parallel-safe with: none

## Verify
- `npx playwright install chromium` once, then `npm run test`. The new spec visits
  `/recorrencias` and `/movimentacoes` at each target width and asserts the document
  does not overflow horizontally. Prove it can fail: revert the `.grid` fix and watch
  it go red before you commit it.
- `npm run lint` && `npm run build` (the build is the only typecheck in this repo).
- `wc -l` every file you created or touched.
- Read `src/styles/README.md` before writing any SCSS and check the diff against
  rules 1, 3, 4 and 7 — hierarchy here has to come from surface tier, border, type
  size, weight and spacing, since a row may not take a hard offset shadow or the
  display face.

## Forbidden
- Do not let colour become the only signal for income vs expense: `valueCents` is
  always positive and the meaning currently comes from the section card around the
  row, not from the row itself.
- Do not shrink `IconButton` below 44px, and do not add `overflow: hidden` to
  `SectionCard` — it clips the focus ring on every card at once.
- Do not turn `CoverageBar`'s slot into block markup; it emits `<span>`s on purpose
  because it sits in an inline slot, and it renders no track at all when there is no
  global period yet.
- Keep the `<ul>`/`<li>` semantics, `key={entry.id}`, and the per-row `aria-label`s
  that name the entry — a generic "Editar" makes every row read identically.
