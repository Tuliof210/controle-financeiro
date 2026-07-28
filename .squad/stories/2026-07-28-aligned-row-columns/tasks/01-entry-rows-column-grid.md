# Put Recorrências and Movimentações rows on a shared column grid

## Outcome
- A list-level primitive in `src/components/` defines the column tracks once and every
  row of that list resolves against them, so names align down one column and amounts
  down another — while each row still paints its own hover background and divider.
- On `/recorrencias` and `/movimentacoes`, a row with room for its content puts swatch,
  name, amount, owner, period and both icon buttons on one line; a row without room
  collapses to a designed stack. Neither state is an emergent per-item wrap.
- Neither screen scrolls sideways at 375px, 768px or 1024px.

## Independently shippable
yes

## Scope
- In: the new primitive folder(s) under `src/components/`, `src/components/EntryRow/`,
  `src/components/EntryScreen/style.module.scss`, `e2e/`, `package.json` (test script)
- Out: `src/app/configuracoes/**` and `src/components/RowLayout/` — task 02 migrates
  those and deletes RowLayout. Also `IconButton`'s 44px box, `SectionCard`, the API
  routes and entities, and `CoverageBar`'s percentage maths.
- Imitate: `src/components/RowLayout/style.module.scss` — read its header comment
  before replacing the approach. Its reasoning (a viewport breakpoint can't see how
  wide the card is, the row's own width can) is right; its flex-wrap answer is the bug,
  because flex wraps on max-content sizes this content exceeds almost always.
- Reuse: `t.bp()` / `$breakpoints` in `src/styles/_theme.scss`, `_swatch-colors.scss`,
  `formatMoney` from `src/lib/money.ts`, and the existing fixtures and long-name seed
  in `e2e/row-overflow.spec.ts`

## When to run
- Depends on: none
- Parallel-safe with: none

## Verify
- The row's own width, not the viewport, decides the layout: measure the rendered
  inline size of a row on `/configuracoes` and on `/movimentacoes` at 1024px and at
  375px before choosing any threshold — the app's narrowest row is not on its narrowest
  screen, and a threshold read off the viewport will be wrong.
- `npx playwright install chromium` once, then `npm run test`. Prove the new assertions
  can fail: put the old flex-wrap rule back and watch them go red before you commit.
- Drop `--pass-with-no-tests` from the `test:e2e` script (`.squad/debt.md` names it)
  and confirm the suite still passes.
- `npm run lint` && `npm run build` — the build is the only typecheck in this repo.
- Read `src/styles/README.md` before writing SCSS and check the diff against rules 1,
  4, 5 and 7: tier separation has to come from type size, weight, colour and spacing
  tokens, since a row takes neither a hard offset shadow nor the display face.
- `wc -l` every file you created or touched.

## Forbidden
- Do not drop the per-row hover background or divider to get shared tracks — if the
  row stops painting its own box to align, that is the wrong mechanism.
- Do not let colour become the only income/expense signal: `valueCents` is always
  positive and the meaning comes from the section around the row, not the row itself.
- Do not shrink `IconButton` below 44px, and do not add `overflow: hidden` to
  `SectionCard` — it clips the focus ring on every card at once.
- Do not turn `CoverageBar`'s slot into block markup; it emits `<span>`s on purpose for
  an inline slot, and renders no track at all when there is no global period yet.
- Keep the `<ul>`/`<li>` semantics, `key={entry.id}`, and the per-row `aria-label`s
  that name the entry — a generic "Editar" makes every row read identically.
- `EntryRow` gains the `hook.ts` it never had (`.squad/debt.md`); this is the edit that
  closes that entry.
