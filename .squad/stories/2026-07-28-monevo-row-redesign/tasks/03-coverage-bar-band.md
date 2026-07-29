# The recurrence period, split into metadata text and a full-width band

## Outcome
- A recurrence row reads `Owner · Interval(s) · Duration` in its metadata line
  and draws a thin band across the full width of the row, under everything else.
- A recurrence with no global period saved draws no band and leaves no empty gap
  where one would go.
- A movement row is unaffected: it still shows only its month, and grows no band
  and no reserved space for one.

## Context
The design (`Monevo.dc.html`, recorrências) keeps the same four areas and adds a
row for the band, which starts one column in:

```
--rec-areas:"who main amt act" ". bar bar bar";
row-gap:var(--space-3);
```
```html
<div style="grid-area:bar;position:relative;height:8px;
  background:var(--c-raised);border:var(--border-1) solid var(--c-line);
  border-radius:var(--radius-sm);overflow:hidden">
  <div style="{{ r.bar }}"></div>
</div>
```
and the interval text moves up into the metadata line, joined by a duration:
```js
range: MONTHS[r.a] + ' → ' + MONTHS[r.b], dur: (r.b - r.a + 1) + ' meses',
```

- **The seam to open.** EntryRow takes one slot today and both screens feed it:
  ```ts
  // EntryRow/hook.ts
  period: ReactNode;   // "Already-formatted period cell — the one part that
                       //  differs per entity"
  // EntryScreen/types.ts, mirrored in EntrySection/hook.ts
  renderPeriod: (item: T, period: Period | null) => ReactNode;
  ```
  ```tsx
  // MovementsScreen/index.tsx:37
  renderPeriod={(movement) => formatYyyymm(movement.month)}
  // RecurrencesScreen/index.tsx:34
  renderPeriod={(recurrence, period) => <CoverageBar months={recurrence.months} period={period} />}
  ```
  The two outputs now land in two different grid areas, so one slot cannot carry
  both. Add a second optional slot of the same shape rather than making EntryRow
  generic — `.squad/learnings.md`: *"one divergent rendering seam should be a
  `ReactNode` prop, not a generic"*. `renderPeriod` keeps feeding the metadata
  line; the new one feeds `bar` and Movimentações simply never passes it.
- **What CoverageBar already computes** (`CoverageBar/hook.ts`):
  ```ts
  const label = formatMonths(months);   // "Jan/26–Mar/26 · Jul/26–Dez/26"
  return { label, segments: period ? coverage(months, period) : null,
           srLabel: `Vigência: ${label}` };
  ```
  and `coverage()` returns `Segment[]` of `{ left: '12.5%', width: '25%' }`.
  Note the three states, all live: `null` (no global range saved — draw nothing),
  `[]` (range saved, nothing overlaps — draw an empty track), and non-empty.
- **The a11y story inverts.** The hook's `role="img"` + `srLabel` were justified
  because the visible label sat right beside the track: *"The bar only reinforces
  the label beside it, which is the real content — so role='img' with the same
  words is honest, not a second source of truth."* Once the interval text reads
  in the metadata line, an `aria-label` repeating it is a duplicate
  announcement. Make the band decorative and drop `role`/`srLabel`. The
  instinct to keep the label *because* it lost its visible twin is the wrong one
  here — the twin moved, it did not disappear.
- **Delete `min-width: 160px`.** `CoverageBar/style.module.scss` reserves it with
  *"the bar's only width reservation … the slot is a flex item, so its
  `min-width: auto` floor picks this up at every width"*. A full-width band in
  its own grid area needs no reservation, and keeping one would re-floor the
  `1fr` `main` track through the band's row. Deleting it also closes the
  `.squad/debt.md` entry about the bar painting ~3px past its cell at 375px.
- **The band's row must be `auto`-sized and render nothing when there is no
  period** — not an empty span, or every recurrence row grows a dead band of
  vertical space before the owner has configured anything.
- **Two `·` with two meanings.** `formatMonths` already joins multiple intervals
  with `" · "`, and the metadata line separates its parts with `·` too, so a
  multi-interval recurrence reads `Fernanda · Jan/26–Mar/26 · Jul/26–Dez/26`.
  The design's separator is a 4px square block element, not a typed character —
  keep it that way and the two stay visually distinct.
- **Track height** goes to the design's value; keep the raw-pixel `ponytail:`
  comment the file already carries for the current one, since the DS has no size
  scale.
- **Watch out:** `EntryScreen/index.tsx` is already 114 lines, over the repo's
  100-line cap on `main`. Threading one more prop through grows it — expect that
  and say so in the PR rather than restructuring the screen here.

## Scope
- In: `src/app/recorrencias/_components/RecurrencesScreen/**` (CoverageBar and
  the screen's `renderPeriod`), `src/components/EntryRow/**`,
  `src/components/EntrySection/**`, `src/components/EntryScreen/types.ts`,
  `src/components/EntryScreen/index.tsx`,
  `src/app/movimentacoes/_components/MovementsScreen/index.tsx`.
- Out: `coverage.helper.ts` and `recurrence-range.helper.ts` — the maths and the
  label format are correct as they stand. Configurações (task 04).

## Verify
- `npm run lint`, then `wc -l` every touched file.
- `npm run test` — no `next dev` running in this directory.
- Browser preview `/recorrencias` at 1440 / 768 / 375 px: the band spans the row
  minus the chip column, sits below name/amount/actions, and its filled segments
  line up with the intervals the metadata line names.
- Then, in Configurações, clear the saved global period and reload
  `/recorrencias`: no band renders, and a row's height matches a Movimentações
  row of the same content.
- Read the row with a screen reader (or inspect the accessibility tree in the
  preview): the interval must be announced exactly once.

## Forbidden
- Making EntryRow generic over its period/band shapes.
- Leaving `role="img"` and an `aria-label` on a band whose text now reads in the
  same row.
- Any width or min-width reservation on the band or its wrapper.
- Giving Movimentações rows a band slot, an empty band, or reserved band space.
