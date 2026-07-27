# Movimentações and Recorrências — section totals, empty states, dashed add, coverage bar

## Description
Both screens are the same shared `EntryScreen` with two `EntrySection`s, so one
task covers them. Four changes, all in `src/components/`:

1. **Each section card shows its total** in the header, tinted to the section's
   tone. Today the header is just an icon and a title.
2. **Empty states get an illustration and a hint.** Today a section with no rows
   shows one muted sentence (`Nenhuma movimentação cadastrada ainda.`). The
   design gives it a dashed icon box, a title and a second line explaining what
   to do — and different copy per section and per screen, which means the
   single `labels.empty` string has to split.
3. **The add button becomes the full-width dashed one** at the bottom of the
   card, using the `dashed` variant task 03 added to `Button`. Its label becomes
   the design's per-section copy.
4. **Recurrence rows get a coverage bar** — a thin track showing where the
   recurrence's months sit inside the global projection range, with the range
   label beside it, replacing today's plain `Jan/26–Mar/26 · Jul/26` text.

Nothing about what these screens can do changes: same endpoints, same modals,
same validation, same person filtering.

## When to run
- Depends on: 02-shell.md (it edits `EntryScreen/index.tsx` to swap the `<h1>`
  for `PageHeader`, and may already have extracted the modal block out of that
  file to stay under the line cap — build on whatever it left) and
  03-primitives.md (the `dashed` `Button` variant, `SectionCard`'s eyebrow).
  Run after both merge and `git fetch origin main` first.
- Parallel-safe with: 04, 05, 07 and 08 — no shared file.

## How-to

### Files
```
src/components/EntryScreen/index.tsx | hook.ts | types.ts | style.module.scss   (edit)
src/components/EntrySection/index.tsx | hook.ts | style.module.scss             (edit)
src/components/EntrySection/components/EmptyState/ index|hook|style             (new)
src/components/EntryRow/style.module.scss                                       (edit)
src/app/movimentacoes/_components/MovementsScreen/index.tsx                     (edit: labels)
src/app/recorrencias/_components/RecurrencesScreen/index.tsx                    (edit: labels + bar)
src/app/recorrencias/_components/RecurrencesScreen/components/CoverageBar/ index|hook|style + hook.test.ts (new)
src/app/recorrencias/_components/RecurrencesScreen/coverage.helper.ts + .test.ts (new)
```

`EmptyState` lives under `EntrySection/components/` because it is used twice
inside that one component (once per tone, and only there). If a later task needs
it elsewhere, the promotion rule moves it up to `src/components/` then — not
pre-emptively.

### 1. The labels split — `EntryScreen/types.ts`
`labels` today is `{ heading, addTitle, editTitle, deleteTitle, empty }` and
`empty` is one string shared by both sections. The design needs four strings per
screen. Replace `empty` with:

```ts
  income: { add: string; emptyTitle: string; emptyHint: string };
  expense: { add: string; emptyTitle: string; emptyHint: string };
```

`MovementsScreen`:
```ts
income: {
  add: "Adicionar entrada",
  emptyTitle: "Nenhuma entrada para este filtro",
  emptyHint: "Troque a pessoa selecionada ou registre a primeira entrada do período.",
},
expense: {
  add: "Adicionar saída",
  emptyTitle: "Nenhuma saída para este filtro",
  emptyHint: "Mês limpo — ou o filtro está estreito demais.",
},
```
`RecurrencesScreen`:
```ts
income: {
  add: "Nova recorrência",
  emptyTitle: "Sem entradas recorrentes",
  emptyHint: "Cadastre salário ou renda fixa para a projeção ficar precisa.",
},
expense: {
  add: "Nova recorrência",
  emptyTitle: "Sem saídas recorrentes",
  emptyHint: "Aluguel, financiamento e assinaturas entram aqui.",
},
```
The empty copy deliberately says *"para este filtro"* on Movimentações: the
person `<select>` filters client-side (`visibleFor` in `EntryScreen/hook.ts`),
so an empty section often means the filter, not an empty database. That is why
the hint mentions it.

**`EntryScreen/index.tsx` is the tightest file in the repo — 102 effective
lines against a 100-line cap.** Task 02 already touched it. If threading two
more label objects pushes it over, extract the add `Modal` + edit `Modal` +
`ConfirmDialog` trio into `EntryScreen/components/EntryOverlays/`; do not
squeeze. The cap reports at `info` severity so `npm run lint` will not fail —
count by hand, and remember lines inside a JSX expression are not counted.

### 2. `EntrySection` — total, empty state, dashed add
`hook.ts` gains the total and passes the new labels through:
```ts
  const totalCents = items.reduce((sum, item) => sum + item.valueCents, 0);
  // …
  return { title, icon, tone, rows, total: formatMoney(totalCents), labels, onAdd };
```
`formatMoney` from `@/lib/money`. The total is the **filtered** total — `items`
already arrives filtered by `visibleFor`, which is correct: the header must
agree with the rows under it.

`index.tsx`:
```tsx
<SectionCard title={title} icon={icon} tone={tone}>
  <p className={`${styles.total} ${styles[tone]}`}>{total}</p>
  {rows.length === 0 ? (
    <EmptyState icon={icon} title={labels.emptyTitle} hint={labels.emptyHint} />
  ) : (
    <ul className={styles.list}>{/* EntryRow, unchanged */}</ul>
  )}
  <Button variant="dashed" onClick={onAdd}>
    <Plus size={16} aria-hidden /> {labels.add}
  </Button>
</SectionCard>
```
The design puts the total on the same line as the title, inside the card's
header rule. `SectionCard` does not take a header slot and task 03 deliberately
did not add one — rendering the total as the card body's first element, with a
`border-bottom: var(--border-2) solid var(--color-border)` and negative-free
spacing, reads the same and touches one fewer shared component. Align it right
(`margin-left: auto` inside a flex row, or `text-align: right`) at `--text-md`,
`tabular-nums`, tinted `--color-positive` / `--color-negative` by tone.

The tint is redundant reinforcement, not the only carrier: the section title
already says ENTRADAS or SAÍDAS. Do **not** special-case these colours to dodge
the light theme's contrast shortfall on `--color-positive` — it is pre-existing
and the owner deliberately deferred it (2026-07-25) — and do not write "legible
in both themes" into the PR body. Measure, or omit the claim.

The negative-tinted hover on the Saídas add button (`background:
var(--color-negative)` instead of brand) is composed at the call site with an
extra class on the `dashed` Button, not a new variant.

### 3. `EmptyState`
```tsx
<div className={styles.empty}>
  <div className={styles.box}><Icon size={20} aria-hidden /></div>
  <p className={styles.title}>{title}</p>
  <p className={styles.hint}>{hint}</p>
</div>
```
```scss
.empty {
  display: flex; flex-direction: column; align-items: center;
  gap: var(--space-3);
  padding: var(--space-12) var(--space-4);
  text-align: center;
}
.box {
  display: flex; align-items: center; justify-content: center;
  width: 44px; height: 44px;
  color: var(--color-text-muted);
  border: var(--border-2) dashed var(--color-border-subtle);
  border-radius: var(--radius-sm);
}
.title { margin: 0; font-size: var(--text-sm); }
.hint {
  margin: 0; max-width: 34ch;
  color: var(--color-text-muted);
  font-size: var(--text-xs);
  text-wrap: pretty;
}
```
The 44px box here is decorative, not a hit target — it just happens to be the
same number the design drew. Keep it non-interactive and `aria-hidden` on the
icon; the two paragraphs carry the meaning.

### 4. `EntryRow` — style only
Do **not** change its structure or its props. The only edits:
- The owner swatch becomes `14px` square with `border-radius: var(--radius-sm)`
  (it currently uses `--space-4` = 16px at `--radius-0`). It keeps its
  `swatch-colors` class from `_swatch-colors.scss`, shared with `ColorPicker`
  and `PersonRow` — do not rename those classes, they are a dynamic CSS-Modules
  lookup with no compile-time safety.
- Row hover: `background: var(--color-surface-raised)` with
  `transition: background var(--duration-fast) var(--ease-snappy)`.
- `border-bottom: var(--border-1) solid var(--color-border-subtle)` per row.
- The period slot widens enough for the recurrence bar (below): give it
  `flex: 0 0 auto; min-width: 160px` at `md` and up, and let it wrap below.

The edit/delete `IconButton`s stay 44×44 with their required `aria-label`s. The
design draws them at 30px; the hit-target floor wins.

### 5. The recurrence coverage bar
`renderPeriod` today is `(item: T) => ReactNode` and has no access to the global
range. Widen it in `EntryScreen/types.ts` and `EntrySection/hook.ts`:

```ts
  renderPeriod: (item: T, period: { start: number; end: number } | null) => ReactNode;
```
`EntryScreen/hook.ts` already computes exactly that `period` from
`GET /api/settings` and returns it — pass it down through `EntrySection` to the
`renderPeriod` call in `useEntrySection`. `MovementsScreen` ignores the second
argument and keeps returning `formatYyyymm(movement.month)`.

`coverage.helper.ts` — pure, tested:
```ts
// Where a recurrence's months sit inside the global projection range, as
// percentages of that range, so the bar can be positioned with left/width.
// Returns null when there is no range, or when the recurrence has no month
// inside it — the caller then falls back to the plain interval text.
export function coverage(
  months: number[],
  period: { start: number; end: number },
): { left: string; width: string } | null
```
Use `buildMonths(period.start, period.end)` from `@/lib/months` for the
denominator — it is inclusive and already handles the inverted-range case by
returning `[]`. Position from the first and last *in-range* month of the
recurrence, so a recurrence that starts before the range or runs past its end is
clamped rather than overflowing the track.

`CoverageBar` renders the track plus the label:
```tsx
<div className={styles.wrap}>
  <div className={styles.track} role="img" aria-label={srLabel}>
    {bar ? <div className={styles.fill} style={{ left: bar.left, width: bar.width }} /> : null}
  </div>
  <span className={styles.range}>{label}</span>
</div>
```
`label` is `formatMonths(recurrence.months)` — the existing helper, unchanged,
so the exact text is still there for anyone who needs it. `srLabel` is
`` `Vigência: ${label}` `` — the bar is decorative reinforcement and the label
beside it is the real content, so `role="img"` with that name is honest.

Track: `position: relative; height: 10px; background:
var(--color-surface-raised); border: var(--border-1) solid
var(--color-border-subtle); border-radius: var(--radius-sm); overflow: hidden`.
Fill: `position: absolute; top: 0; bottom: 0; background: var(--color-brand);
border-radius: var(--radius-sm)`.

**One quantity, one bar.** The fill's position and width both encode "which
months of the range this recurrence covers", and the label beside it says the
same in words. A recurrence with gaps (`Jan–Mar · Jul–Dez`) draws as one span
from the first to the last covered month — say so in the `srLabel` if you can do
it in a short sentence, or leave the exact months to the label, but do **not**
draw a solid bar and let a reader think it is contiguous when the label right
next to it says otherwise. Preferred: render one `.fill` per contiguous interval
using `monthsToIntervals` (which already exists in
`RecurrenceForm/intervals.helper.ts`), so the bar and the label agree exactly.

`coverage.helper.test.ts` and `CoverageBar/hook.test.ts`: a recurrence spanning
the whole range, one covering the first half, one starting before the range,
one ending after it, one entirely outside (→ `null`), one with a gap (→ two
intervals), a single-month recurrence, and a `null` period.

### Verify
Run from inside the task worktree, never the main checkout:

```bash
npm install && npm run db:setup && npm run lint && npx vitest run --exclude '**/.claude/**' && npx tsc --noEmit && npm run build
```

Baselines: lint **2 errors + 1 info**, tsc **1 error**, test **45 files / 321
tests** plus whatever earlier tasks added — re-measure on the merged `main`.
Never run `npm run lint:fix`.

`tsc` is the gate for the two prop-shape changes (`labels` and `renderPeriod`);
both `MovementsScreen` and `RecurrencesScreen` must be updated in the same
commit or the build fails, which is the intended safety net.

**Prove the new tests bite**: mutate `coverage.helper.ts` (drop the clamp) and
confirm the suite goes red before reverting.

### Browser check
Start the dev server from inside the worktree on a spare port and
`preview_start` with `{url: "http://localhost:<port>"}`. Seed real data first:
at least two people with different colours, a global range, several movements
across months, and recurrences with different interval shapes.

- `/movimentacoes`: each card's header total equals the sum of the rows under
  it. Switch the person `<select>` — **both the rows and the total change
  together**. This is the single most likely regression in this task.
- Delete every row of one section: the illustrated empty state appears with the
  right copy for that tone, and the dashed add button is still there below it.
- Click the dashed button: the add modal opens with the correct type
  preselected (Entrada in the Entradas card, Saída in the Saídas card).
- `/recorrencias`: each row shows a coverage bar. Create a recurrence covering
  the whole range → a full bar; one covering only the last three months → a bar
  flush right; one with a gap → two segments matching the `·`-separated label.
- Create a recurrence whose months fall entirely outside the configured range →
  an empty track, not a crash and not a full bar.
- Clear the range in Configurações → the bar disappears and only the interval
  text remains; nothing throws.
- Both themes; at 375px the row wraps rather than scrolling the page body
  horizontally, and the coverage bar keeps a usable width.
- No console error.

Recorded traps: a `computer` click can report success while landing on nothing —
verify with `read_page` / `read_network_requests`, never the click's own
response; and state read in the SAME `javascript_tool` call as the action that
changed it reports the PRE-change value.

### Anything else you touch
No API call changes, no change to `EntryForm`, `MovementForm`, `RecurrenceForm`,
`IntervalList` or `MonthRangeSlider` beyond what task 03 already restyled. The
`▲` error line in `EntryForm/index.tsx` stays exactly as it is. No test outside
the new ones should need editing — if one does, a return shape moved further
than this task allows.
