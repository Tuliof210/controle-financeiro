# The share bar under every month row

## Outcome
- Each row of the Teto month table carries a thin bar along its bottom edge,
  filled from the left in proportion to how much of that month's arriving balance
  its ceiling takes, and unfilled for the rest. A month whose ceiling is zero
  shows an entirely unfilled bar.
- The bar survives the collapsed tier: below the table's container threshold, where
  each row becomes a stacked block, it still runs along that block's bottom edge.
- The row's markup gains no element and no cell — `e2e/ceiling-page.helper.ts`
  reads rows as `[...node.children]` and asserts positionally on cells 1/2/3.

## Context
Design: `design.html` line **522** — a 3px strip pinned to the row's bottom, its
fill a `linear-gradient(90deg, caution 0 N%, line N% 100%)` where `N` is the
month's ceiling over its arriving balance.

**No extra element.** An absolutely positioned `<div>` inside a `<tr>` is not
valid table markup, and any new child breaks the positional read above. Draw the
bar as a **background layer on the row**, sized to the row's bottom edge, with
the percentage arriving as an inline CSS custom property. In TSX that means an
inline `style` object carrying a custom property, which needs a `CSSProperties`
cast — write it once, in `MonthTable/index.tsx`, and let Biome see it.

**Where the number comes from.** `CeilingMonth` already carries `budget` (this
month's ceiling, cents, `>= 0`) and `ceilingBalance` (the balance arriving at the
month). The rows are built in `CeilingCard/hook.ts`:
```ts
const rows = months.map((month) => ({
  key: month.month, label: formatYyyymm(month.month),
  isCurrent: month.month === current,
  balance: formatMoney(month.ceilingBalance),
  spend: formatMoney(month.budget),
  left: formatMoney(month.ceilingLeft),
}));
```
Add the share there and to `MonthRow` in `MonthTable/hook.ts`. Guard the zero
balance — it happens, and `ceilingBalance` is the divisor. Clamp to `[0, 1]`: the
ceiling is at most a cap's share of the balance by construction, but the type
does not say so.

**Colours and weight.** `--color-caution` for the taken part,
`--color-border-subtle` for the rest, `--border-3` for the thickness. Every row
already ends in `border-bottom: var(--border-1) solid var(--color-border-subtle)`
on its cells, and the collapsed tier ends in `border-bottom: var(--border-2)` on
the row itself — decide whether the bar replaces or sits above that rule, and say
which in a comment. Do not leave two competing bottom rules.

**The collapsed tier.** `MonthTable/_stacked.scss` turns `.table`, its rows and
its cells to `display: block` under `@container (max-width: 489px)`, and the
`.wrap` above establishes `container-type: inline-size`. A background on the row
survives that switch; an absolutely positioned child would not, since the row is
not a positioning context in the tabular tier.

**Cap watch.** `MonthTable/style.module.scss` is 95 lines and `_stacked.scss` is
91 — five and nine lines of headroom. Biome never reads `.scss`, so `wc -l` both.
Lifting a rule into a partial strips its nesting: out of `.table { th {…} }` it
becomes a bare class and loses to the `.table th` it sat inside — re-nest under
the same ancestor and prove it with `getComputedStyle` on the page.

The bar restates two figures already in the row, so it carries no meaning of its
own and needs no accessible name — but do not let it become the only place the
proportion is legible.

## Scope
- In: `components/CeilingCard/components/MonthTable/index.tsx` + `hook.ts` +
  `style.module.scss` + `_stacked.scss`, and the row builder in
  `components/CeilingCard/hook.ts`.
- Out: the payload and `src/app/api/dashboard/**` — every number this needs is
  already on `CeilingMonth`. Also out: `CeilingCard/index.tsx`, `CapSelector/`,
  `ShowAllToggle/`, `e2e/`.

## Verify
- `npm run lint`; `wc -l` all four touched files.
- `npm run build`; `npm test` — stop any `npm run dev` first, Next 16 locks per
  directory so a server on :3000 blocks Playwright's own on :3100.
  `ceiling.spec.ts` is the spec that reads these rows positionally.
- Browser preview, both themes, at a width above and one below the table's
  collapse threshold: confirm the bar renders in both tiers, on the row's bottom
  edge, and that its filled share visibly tracks the two figures beside it.
- Switch the cap between 25 / 50 / 75 and confirm the bars move with the figures.
- Find a month whose ceiling is zero and confirm the bar is empty, not full.
- Confirm the row still has exactly four children in the DOM.

## Forbidden
- No new `<td>`, `<th>`, `<div>` or `<span>` inside a row.
- No raw colour, no raw pixel height, no percentage literal in the stylesheet —
  the percentage arrives per row from the data.
- Do not change the collapse threshold here; task 04 owns it.
- Do not compute the share on the server.
