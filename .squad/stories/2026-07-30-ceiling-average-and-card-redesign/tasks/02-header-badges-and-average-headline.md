# Ceiling card: header badges and the two-headline hero

## Outcome
- The card header carries, opposite the title, a caution-toned badge naming the
  month that caps this month's figure ("Limitado por Ago/26") and a badge for
  the current month ("Jul/26"). The prose horizon line under the headline is
  gone.
- The body opens with two headlines side by side above 768px and stacked below
  it: "Gasto extra este mês" (existing figure, existing splits) on the left and
  "Média dos tetos" on the right, each with its own weekly/daily splits.
- Each headline carries a small outlined chip: "4,2× a média" on the left,
  "18 meses restantes" on the right.
- `npm run test:e2e` is green.

## Context
**Extend** `src/components/SectionCard` — it renders the header itself and
takes no slot, so a badge cannot reach it. `index.tsx` (26 lines), verbatim:

```tsx
      <div className={titleRowClassName}>
        {Icon ? <Icon size={16} aria-hidden /> : null}
        <h2 className={styles.title}>{title}</h2>
        {hint ? <Tooltip text={hint} label={`Como ${title} é calculado`} /> : null}
      </div>
```

Add `headerEnd?: ReactNode` to `SectionCardProps` in its `hook.ts` (24 lines)
and render it last in `.titleRow` with `margin-left: auto`. The 12 other call
sites omit it and are unaffected. Do NOT copy `StatCard`'s wrapper-div
workaround, and do NOT give `.card` an `overflow: hidden` — its scss comment
says an overflow-hidden ancestor clips the Tooltip's focus ring on all 13 cards
at once.

**Imitate** for the outlined chip, `GoalCard/style.module.scss` `.target`:

```scss
.target { flex: none; padding: var(--space-1) var(--space-2);
  background: var(--color-surface-raised); color: var(--color-text-muted);
  border: var(--border-1) solid var(--color-border-subtle);
  border-radius: var(--radius-sm); font-family: var(--font-mono);
  font-size: var(--text-2xs); font-weight: var(--weight-bold);
  font-variant-numeric: tabular-nums; }
```

**Imitate** for the two-column collapse, `SavingsSection/style.module.scss` —
`minmax(0, 1fr)`, never a bare `1fr`, or the page scrolls sideways at 375px:

```scss
.grid { display: grid; grid-template-columns: minmax(0, 1fr); gap: var(--space-6);
  @include t.bp("md") { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
```

**Reuse**, do not fork: `../Headline` is shared with `StatCard` —
`{ caption: string; tone?: "positive" | "negative"; children: ReactNode }`.
Its signature must not change. `formatYyyymm(value: number | null): string`
returns `"Ago/26"`. `formatMoney(cents: number): string` returns `"R$ 1.234,56"`
with a U+2212 minus, not a hyphen.

**Watch out for:**
- `useCeilingCard` already computes `horizon` from `tightest` and
  `months.length`; those two facts now split into the header badge and the
  right-hand chip. Delete `horizon` and the `.note` usage that renders it — but
  keep `.note` itself, the empty/red state still uses it.
- The ratio chip is `monthly / average.monthly`, one decimal, pt-BR comma. It
  is only ever rendered when the card is NOT empty, and `average.monthly` is 0
  exactly when every budget is 0, i.e. exactly when `empty` short-circuits — so
  the guard is structural, not arithmetic. Say so in a comment rather than
  adding a divisor check that can never fire.
- The chips and badges must not carry `role="img"`. `e2e/ceiling.spec.ts` does
  `card.getByRole("img")` to find the bars and asserts `toHaveCount(0)` in the
  red state; anything else with that role poisons `readMonths`.
- `e2e/ceiling.spec.ts` reads the headline as
  `card.locator("dd").first().innerText()` and expects line 0 to be this
  month's figure — so the average headline must come **after** it in DOM order.
- `e2e/ceiling.helper.ts` exports `horizonLabel()` and `ceiling.spec.ts` has a
  test `"names how many months remain, not the period's length"` asserting that
  exact sentence is visible. It must be rewritten in this task to assert the
  two badges plus the "N meses restantes" chip instead. `ceiling.spec.ts` is
  116 lines against a 100-line cap — put any new helper in
  `e2e/ceiling-page.helper.ts` (92 lines) rather than growing the spec.
- `HINTS.ceiling` in `DashboardScreen/hints.ts` is the Tooltip copy; extend it
  to mention the average.
- The dashboard route `/` has a known, out-of-scope 12px horizontal overflow at
  exactly 1024px, and no spec guards it. Two new badges sit right of the
  Tooltip in the header — check the card does not make it worse.

**Verify with** `npm run lint`, `npm run build`, `npm run test:e2e`.

## Scope
- In: `src/components/SectionCard/{hook.ts,index.tsx,style.module.scss}`,
  `DashboardScreen/components/CeilingCard/*`, `DashboardScreen/hints.ts`,
  `e2e/ceiling.spec.ts`, `e2e/ceiling.helper.ts`, `e2e/ceiling-page.helper.ts`.
- Out: the rows, the bars, the meter components, the footer — task 03. The
  `Headline` component's props. Any other SectionCard call site.

## Verify
```
npm run lint
npm run build
npm run test:e2e
```
Measure at execution time rather than assuming: with the dev server up, read
`document.documentElement.scrollWidth - clientWidth` on `/` at 375, 768, 1024
and 1440, in both themes, and confirm the card's own header does not add to it.

## Forbidden
- Changing `Headline`'s props, or `SectionCard`'s existing props/markup order.
- Making `headerEnd` required, or touching the other 12 SectionCard call sites.
- Hardcoding a colour, space, radius or duration — tokens only, and note that
  `--space-7`/`--space-9` do not exist, `--radius-full` is avatars/status-dots
  only, and brand-coloured *text* uses `--color-brand-text`, not `--color-brand`.
