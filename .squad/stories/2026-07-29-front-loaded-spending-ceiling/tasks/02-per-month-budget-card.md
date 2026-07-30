# The card lists each month's own extra-spending figure

## Outcome
- The Teto de Gastos card shows one figure per month from the current one to the
  range end, each in the foreground of its own row.
- The headline is the current month's figure, captioned as this month's, with the
  /sem and /dia splits derived from it.
- Every bar carries its own labelled pair, so no number on screen is measured by a
  bar that means something else.
- The card's hint states the formula that is actually running.

## Context
Payload contract landing from task 01: `CeilingMonth` is
`{ month; budget; worstAhead; remaining }`, `Ceiling.monthly` is the current
month's `budget`, and `Ceiling.sustainable` exists but is **not** for display.

### Row anatomy the owner chose
`budget` in the foreground; the bar keeps today's labelled pair so the two
quantities never blur. Bar length is `remaining / worstAhead`, its caption is
`restam <remaining> de <worstAhead>`.

The accessible name must carry both figures, and task 03 parses it, so this string
is a contract:
```
`${label}: gasto extra ${budget}, restam ${remaining} de ${of}`
```

### What to change, and the lines that are the pattern
`CeilingCard/hook.ts:18-31` builds the rows, `formatMoney` on each cents value:
```ts
  const rows = months.map((month) => {
    const label = formatYyyymm(month.month);
    ...
      percent: sharePercent(month.remaining, month.worstAhead),
      projected: month.month > current,
      srLabel: `${label}: restam ${remaining} de ${of}`,
```
`CeilingCard/index.tsx:31-54` renders it — `Headline` takes a `caption`, and
`MeterRow`'s children are the row's visible text:
```tsx
          <Headline caption="Gasto extra por mês">
            {monthly}
            <span className={styles.splits}>{splits}</span>
          </Headline>
          ...
              <MeterRow key={row.key} label={row.label} percent={row.percent}
                tone="positive" projected={row.projected} srLabel={row.srLabel}>
                <span>{row.remaining}</span>
                <span className={styles.of}>de {row.of}</span>
```
`MeterRowProps` verbatim (`components/MeterRow/hook.ts:3-16`) — no new prop is
needed, the figure goes in `children`:
```ts
export type MeterRowProps = { label: string; percent: number;
  tone: "positive" | "negative"; srLabel: string; children: ReactNode;
  projected?: boolean };
```
`sharePercent` (`list-cards.helper.ts:11`) already guards the divisor:
`export function sharePercent(value: number, whole: number): number` →
`whole > 0 ? (value / whole) * 100 : 0`.

### The hint is a spec, and it currently lies
`hints.ts:43-53` states the old formula word for word: "divide-se o saldo
acumulado de cada mês pelo número de meses até ele, e o teto é 80% do MENOR desses
resultados … o mês que limita marca 20%". Rewrite it to what runs: a month's
figure is 80% of the worst projected balance from that month on, minus everything
the earlier months already authorised; the bar is what is left of that worst
balance after them; the /sem and /dia splits divide the current month's figure by
4 and 30. The closing sentence about hatched projected months stays true.

Stale for the same reason: the comment at `CeilingCard/hook.ts:14-17`, which
claims the pinning month reads 20%.

### Watch out for
- The `horizon` sentence ("Vale pelos N meses restantes. Limitado por …") stays
  accurate — `tightest` now names the month realising the worst balance ahead.
  Its `tightest === null` branch is still unreachable (task 01 keeps
  `tightest === null` exactly when `monthly === 0`, which `empty` short-circuits),
  so leave the fallback and the comment explaining why it is inert.
- `useShowAll(rows)` caps the visible rows and feeds `ShowAllToggle`. Leave it.
- The row now has two text groups where it had one. `wc -l` the `.scss` as well —
  Biome's line rules never read stylesheets.

## Scope
- In: `src/app/_components/DashboardScreen/components/CeilingCard/*` and
  `src/app/_components/DashboardScreen/hints.ts`.
- Out: `MeterRow`, `MeterList`, `Headline`, `ShowAllToggle`, `SectionCard`,
  `list-cards.helper.ts`, `show-all.hook.ts`, everything under `src/app/api/`,
  `LimitCard` and every other card, all e2e files.

## Verify
```
wc -l src/app/_components/DashboardScreen/components/CeilingCard/* src/app/_components/DashboardScreen/hints.ts
npm run lint
npm run build
```
Then in the browser preview: pick an owner with a solvent period, open the Projeção
tab and read the card — each row shows its own figure, the headline equals the
first row's figure, and no bar overflows its track. Read the last bar's
`aria-label` (`read_page`) and confirm it matches the contract string above.
`e2e/ceiling.spec.ts` stays RED until task 03.

## Forbidden
- Do not render `sustainable` anywhere.
- No hardcoded colour, spacing, radius, shadow or duration in the `.scss`.
- Do not move logic into `index.tsx` — it renders what `hook.ts` returns, nothing
  more.
- Do not change the card title "Teto de Gastos" or the red-month note copy:
  `e2e/ceiling-page.helper.ts:22-25` locates the card by that heading and
  `ceiling.spec.ts:84` asserts that note's amount verbatim.
