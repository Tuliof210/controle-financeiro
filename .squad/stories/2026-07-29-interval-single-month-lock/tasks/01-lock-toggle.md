# Per-row single-month lock inside IntervalList

## Outcome
- Every row of the forecast form's interval list has its own lock control,
  labelled per row, and two rows can differ.
- Locked: one MonthPicker, taking the width the Início/Fim pair took; changing it
  writes the same YYYYMM to `start` and `end`.
- Unlocked: today's Início/Fim pair, byte-identical behaviour.
- Whether a row is locked is read from its own data (`start === end`), so a
  freshly added row and a reopened one-month forecast both come up locked with no
  extra bookkeeping. Unlocking must move `end` off `start` (see Watch out for).

## Context
Everything below lives under
`src/app/previsoes/_components/ForecastsScreen/components/ForecastForm/`.

- **Do not change** `IntervalList`'s props. The lock is internal to the
  component; `ForecastForm/index.tsx` keeps passing exactly:
  `intervals` / `onUpdate` / `onAdd` / `onRemove`. Signature to preserve verbatim,
  from `IntervalList/hook.ts`:
  ```ts
  export type IntervalListProps = {
    intervals: KeyedInterval[];
    onUpdate: (index: number, next: Interval) => void;
    onAdd: () => void;
    onRemove: (index: number) => void;
  };
  ```
  `KeyedInterval = { start: number; end: number; key: number }` — `key` is a
  stable UI-only row id, use it for ids/labels as the current code already does
  (`forecast-interval-${interval.key}-start`).
- **Reuse** `addMonths` from `@/lib/months` — already exported, handles the year
  roll-over: `export function addMonths(value: number, count: number): number`.
  Do not add a month-arithmetic helper; `intervals.helper.ts`'s private
  `nextMonth` is not exported and does not need to be.
- **Imitate** for the control: there is **no** checkbox/switch component in this
  repo — grep confirms zero `type="checkbox"` under `src/`. Use a native
  `<input type="checkbox">` with a real `<label>`; do not build a Toggle
  component for one call site. The nearest styling exemplar is
  `src/components/MonthPicker/style.module.scss`, whose control carries the hit
  target and the shared focus ring:
  ```scss
  @use "theme" as t;
  .select {
    min-height: 44px;
    ...
    &:focus-visible { @include t.focus-ring; }
  }
  ```
  `src/app/_components/DashboardScreen/components/ShowAllToggle/style.module.scss`
  shows the same 44px floor applied to a bare chip, with the comment explaining
  why it wins over the drawn size.
- **Current markup** to modify, `IntervalList/index.tsx` — the pair sits inside
  `.pickers`, the remove IconButton beside it:
  ```tsx
  <div className={styles.pickers}>
    <MonthPicker id={`forecast-interval-${interval.key}-start`} label="Início"
      value={interval.start} onChange={onStartChange(index)} />
    <MonthPicker id={`forecast-interval-${interval.key}-end`} label="Fim"
      value={interval.end} onChange={onEndChange(index)} />
  </div>
  ```
  `MonthPicker` renders `.field` as `display:flex; flex-direction:column` with no
  `flex` of its own, inside `.pickers` (`display:flex; flex-wrap:wrap; flex:1`).
  Making the lone picker span the row is a stylesheet change in
  `IntervalList/style.module.scss`, not a MonthPicker change — `MonthPicker` is
  shared (`src/components/`) and other screens use it.
- **Watch out for** `MonthPicker`'s mount effect, `src/components/MonthPicker/hook.ts`:
  ```ts
  useEffect(() => { if (value === null) onChange(currentYYYYMM()); }, [value, onChange]);
  ```
  It self-seeds on mount when `value` is null. The Fim picker unmounts on lock and
  remounts on unlock — always hand it a non-null number so this never fires and
  never overwrites a just-set month.
- **Watch out for** the re-lock trap: since locked is derived from
  `start === end`, unlocking while leaving `end` equal to `start` puts the row
  straight back to locked. Unlock has to set `end` to a later month.
- **Verify with** the commands in the Verify section; `npm run lint` is the
  100-line/file gate and the three files here are currently 48/27/20 lines.

## Scope
- In: the three files in
  `ForecastForm/components/IntervalList/` (`index.tsx`, `hook.ts`,
  `style.module.scss`).
- Out: `src/components/MonthPicker/**` (shared, other consumers),
  `ForecastForm/index.tsx`, `ForecastForm/hook.ts`, `intervals.hook.ts`,
  `intervals.helper.ts`, the API/Zod/Prisma layers. The stored shape is a flat
  month array and does not change.

## Verify
- `npm run lint` — clean.
- `npm run build` — clean.
- `wc -l` each touched file; recheck against the 100-line cap, and note Biome
  never reads `.scss` so the stylesheet needs the manual count.
- In the browser on /previsoes: open "Nova previsão", confirm a new row starts
  locked with one picker; unlock and confirm two pickers with different months;
  add a second row and confirm the two rows lock independently. Measure the lone
  picker's width against the row's own width in the same session rather than
  assuming a number.

## Forbidden
- No new prop on `IntervalList`, and no lock state lifted into `ForecastForm` or
  `intervals.hook.ts`.
- No second source of truth for "is locked" — do not add a `useState` mirroring
  `start === end`.
- No new shared component, and no change to what is POSTed/PUT.
- No hardcoded colour, spacing, radius or duration — tokens only.
