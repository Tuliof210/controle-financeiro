# The "SIMULADO" mark on a forecast row

## Outcome
- A forecast saved as a simulation shows a `SIMULADO` badge on its row in
  `/previsoes`, in the metadata line beside the owner and the months.
- A real forecast shows nothing extra, and the row's column alignment is
  unchanged for both.
- Movimentações rows are untouched.

## Context

**The seam is `renderPeriod`, and it is forecast-only code.** `ForecastsScreen`
and `MovementsScreen` both drive the shared `EntryScreen`, but each passes its
own `renderPeriod`. Its signature, from `src/components/EntryScreen/types.ts`:

```ts
  renderPeriod: (item: T, period: Period | null) => ReactNode;
  renderBand?: (item: T, period: Period | null) => ReactNode;
```

`T` is `Forecast` inside `ForecastsScreen`, so `forecast.simulated` type-checks
there and nowhere else. Today it returns a plain string:

```tsx
      renderPeriod={(forecast) => formatMonths(forecast.months)}
      renderBand={(forecast, period) =>
        period ? <CoverageBar months={forecast.months} period={period} /> : null
      }
```

Returning JSX instead needs **zero** changes to `EntryScreen`, `EntrySection`,
`RowGrid` or `EntryRow`. That matters: `EntryRow`'s props type `entry` as the
narrow shared `Entry`, so it cannot see `simulated` at all.

**Watch out for** where the node lands. `EntryRow/index.tsx`:

```tsx
        <span className={styles.meta}>
          <span className={styles.owner}>{owner}</span>
          <span className={styles.separator} aria-hidden />
          <span className={styles.period}>{period}</span>
        </span>
```

`EntryRow/_meta.scss` sets `white-space: nowrap` on `.meta` and
`overflow: hidden; text-overflow: ellipsis` on `.period` — anything injected
here inherits that truncation, and its comment records a 375px overflow
regression that `e2e/row-overflow.spec.ts` still guards. A badge that cannot
shrink will push the row wide. Measure at 375px before calling this done.

**Imitate** `src/app/_components/DashboardScreen/components/CeilingCard/_badges.scss`
— the repo's closest thing to a badge system, and the one that documents the
accessibility rule that binds here:

```scss
  .limit, .now {
    flex: none;
    padding: var(--space-1) var(--space-3);
    border-radius: var(--radius-sm);
    font-family: var(--font-mono);
    font-size: var(--text-2xs);
    letter-spacing: var(--tracking-wide);
    text-transform: uppercase;
    white-space: nowrap;
  }
  // A caution border alone would be meaning-by-colour (styles README rule 7c);
  // the square says it a second time and the words a third.
```

The word "SIMULADO" is itself the non-colour signal, so a border or fill may
carry colour on top of it. `text-transform: uppercase` rather than an uppercase
string — `SectionCard`'s `.title` records why: these are read aloud.

**Watch out for contrast being a property of the pair, not the token.** If you
fill the badge, `--color-brand` admits no safe foreground in both themes
(`--ink-900` measures 3.59:1 in light, `--white` 3.72:1 in dark — both under the
4.5:1 floor). `--color-brand-text` exists for brand-coloured *copy* and clears
every surface in both themes (4.57–5.33 light, 6.83–8.79 dark). A bordered
badge with `--color-text` inside is the safest shape.

**Watch out for the promotion rule.** A three-file component folder is the house
shape, but this badge has exactly one consumer — keep it inside
`src/app/previsoes/_components/ForecastsScreen/components/`. It moves to
`src/components/` only when something outside `ForecastsScreen` renders it.

**Verify with** `npm run lint` and `npm run test` — `e2e/row-columns.spec.ts`
and `e2e/row-overflow.spec.ts` already cover the four lists' geometry and are
the regression net for this change. Do not edit either.

## Scope
- In: `src/app/previsoes/_components/ForecastsScreen/index.tsx` and a new badge
  component folder under `.../ForecastsScreen/components/`.
- Out: `src/components/EntryRow/**`, `src/components/EntrySection/**`,
  `src/components/RowGrid/**`, `src/components/EntryScreen/**`,
  `src/app/movimentacoes/**`. No filter or sort on the forecasts list — both
  kinds always show.

## Verify
```
npm run lint
npm run test
```
Manually with `npm run dev`: create one simulated and one real forecast in
`/previsoes`, confirm only the first carries the badge. Then set the viewport to
375px and confirm the row still fits — read the real number rather than
eyeballing it:
```
document.documentElement.scrollWidth - document.documentElement.clientWidth
```
must be ≤ 0. Check the badge's text/background contrast in **both** themes
against the pair it actually renders on, not against the token's name.

## Forbidden
- Do not widen `EntryRow`'s `entry: Entry` prop to a generic — the badge arrives
  as a `ReactNode` through `renderPeriod`.
- No colour-only signal: the word must be present.
- No hardcoded colour, spacing or radius value; `--radius-full` is reserved for
  avatars and status dots.
