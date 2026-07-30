# Summary strip with month range and duration badge

## Outcome
- Every Vigência card ends in a summary strip: `--color-surface-raised` fill,
  `var(--border-1) solid var(--color-border-subtle)`, `--radius-sm`,
  `padding: var(--space-3) var(--space-4)`.
- Left side reads the month range — `Jan/26 → Dez/26` for a range, just `Jan/26`
  when the row is locked to a single month.
- Right side is an inverted duration badge: `1 MÊS` for a locked row,
  `N MESES` otherwise.
- Both read-outs update live as the pickers and the `Mês único` toggle change.

## Context

Strip and badge declarations, verbatim from design block `1c` of
`Seletor de Vigência.dc.html`:
```
padding:var(--space-3) var(--space-4);background:var(--c-raised);
border:var(--border-1) solid var(--c-line);border-radius:var(--radius-sm)
```
```
padding:var(--space-1) var(--space-2);background:var(--c-text);color:var(--c-bg);
border-radius:var(--radius-sm);font-variant-numeric:tabular-nums
```
`--c-line` maps to `--color-border-subtle` here; there is no `--color-line`
token. Full `--c-*` mapping is in `tasks/01-select-skin.md`.

**Deliberate departure from the design — do not "fix" it back.** The design's
summary reads `Jan/26 → Dez/26 · R$ 38.400,00 previsto`. Here it is the range
only, plus the badge. No monetary total, and therefore no new prop on
`IntervalList` and no change to `ForecastForm`.

**Imitate** the inverted badge at
`src/app/_components/DashboardScreen/components/TabBar/style.module.scss`, the
repo's proven `--color-text` / `--color-bg` pair:
```scss
  &[aria-pressed="true"] {
    background: var(--color-text);
    color: var(--color-bg);
    font-weight: var(--weight-bold);
  }
```
The repo's badge convention throughout (`HeroCard`, `GoalCard`, `ReportView`) is
`padding: var(--space-1) var(--space-2)` + `border-radius: var(--radius-sm)` +
mono + `--weight-bold` + `font-variant-numeric: tabular-nums` — match it.

**Reuse, verbatim signatures** — both in `src/lib/months.ts`:
- `formatYyyymm(value: number | null): string` — `formatYyyymm(202601)` returns
  exactly `"Jan/26"` (slash, no space, 2-digit year), and `null` returns `"—"`.
  Use it for both sides of the range; do not hand-roll month formatting.
- `buildMonths(start: number, end: number): number[]` — its `.length` is the
  duration. Documented behaviour: `start > end` yields `[]`, so guard the label
  rather than printing `0 MESES`.

**Watch out for:**
- Rule 4 of `src/styles/README.md`: `--font-display` (Press Start 2P) is for short
  display/eyebrow text only and **never for numbers**. The range and the badge are
  both numeric — `--font-mono` for both, with `font-variant-numeric: tabular-nums`
  so the badge does not jitter as the count changes width.
- Locked is derived (`start === end`), the same predicate the card already uses —
  read it from the existing hook, do not recompute a second definition of "locked".
- Portuguese pluralisation is the only branch here: `1 MÊS` (with the circumflex)
  vs `N MESES` (without). Getting the accent wrong on one branch is the likely bug.
- `IntervalCard` from task 02 is against the 100-line cap; `wc -l` after adding
  the strip and split further if needed. Biome's line rules are `info`, not
  `error`, and never read `.scss`.
- The strip is inside the card, which is inside a `--color-surface-raised` modal
  dialog — so a `--color-surface-raised` strip on a `--color-surface` card is the
  intended contrast, but confirm the strip is still legible in dark theme, where
  `raised` is `--ink-700`. Contrast is a property of the pair: measure the actual
  text/background pair, do not infer it from the fill.

## Scope
- In: `.../IntervalList/components/IntervalCard/` (all three files), and
  `IntervalList/style.module.scss` only if the strip forces a layout change there.
- Out: `IntervalListProps`, `ForecastForm/**`, `intervals.helper.ts`,
  `intervals.hook.ts`, `src/lib/months.ts` (both helpers already exist as needed),
  `src/components/**`, `e2e/**`.

## Verify
```bash
npm run lint
npm run test
wc -l src/app/previsoes/_components/ForecastsScreen/components/ForecastForm/components/IntervalList/components/IntervalCard/*.*
```
Then in the browser pane, light and dark: `/previsoes` → `Nova previsão` →
- with `Mês único` checked, confirm the strip reads a single month and `1 MÊS`;
- uncheck it, push `Fim` forward several months, confirm the range renders with
  `→` and the badge reads `N MESES` matching the months actually spanned;
- confirm the badge text does not shift the strip's layout as N changes width.
Screenshot both themes.

## Forbidden
- No monetary value anywhere in the strip.
- No new prop on `IntervalList` or `IntervalCard` sourced from `ForecastForm`.
- No `--font-display` on the range or the badge.
- No second definition of "locked" — reuse the derived predicate.
- No hardcoded colour, spacing or radius; no `data-testid`.
- Do not touch `e2e/`.
