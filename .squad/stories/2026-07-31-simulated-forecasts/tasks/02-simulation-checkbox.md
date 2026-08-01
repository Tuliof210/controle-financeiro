# The "Simulação" checkbox in the forecast form

## Outcome
- The add and edit forecast modals show a checkbox labelled `Simulação`,
  unchecked by default.
- Checking it and saving stores `simulated: true`; reopening that forecast for
  edit shows the box checked.
- Nothing changes in the Movimentações form.

## Context

**Reuse the repo's only styled checkbox** — the `@mixin box` in
`src/app/previsoes/_components/ForecastsScreen/components/ForecastForm/components/IntervalList/components/IntervalCard/_checkbox.scss`.
It restyles a native `<input type="checkbox">` (`appearance: none`, a rotated
two-border tick, `--color-brand` fill on `:checked`, `@include t.focus-ring` on
`:focus-visible`) and emits no CSS of its own; consumed as `@use "./checkbox";`
+ `.checkbox { @include checkbox.box; }`. Its header records why it is not a
`<button>`: that "would lose `role="checkbox"` and break the spec's
`.check()`/`.uncheck()` calls".

A second consumer outside `IntervalCard/` triggers ARCHITECTURE's promotion
rule. **Move it to `src/styles/_checkbox.scss`** and change both consumers to
`@use "checkbox";` (bare, not relative) — exactly what `src/styles/_select.scss`
did for the same reason; the `src/styles` Sass load path is already registered
in `next.config.ts`.

**Imitate the label wrapper** in `IntervalCard/style.module.scss` — the 44px tap
band lives on the `<label>`, never on the 20px box:

```scss
.lock {
  display: flex; align-items: center; gap: var(--space-2);
  min-height: 44px;
  font-family: var(--font-mono); font-size: var(--text-xs);
  letter-spacing: var(--tracking-wide); color: var(--color-text-muted);
  text-transform: uppercase; white-space: nowrap; cursor: pointer;
}
```

and its markup, which is what makes `getByRole("checkbox", { name })` resolve:

```tsx
<label className={styles.lock} htmlFor={`${idPrefix}-lock`}>
  <input type="checkbox" className={styles.checkbox} id={`${idPrefix}-lock`}
    checked={isLocked} onChange={onLockToggle} />
  Mês único
</label>
```

**Watch out for `src/components/EntryForm/index.tsx` — it is 102 lines, already
over the hard cap, and shared with Movimentações.** Touching it turns
`npm run lint:lines` red and forces a split. Do not add a prop to it. It already
exposes the slot this needs:

```ts
  // The entity's own month control — a MonthPicker (Movement) or an
  // IntervalList (Forecast) — the one part of the form that genuinely
  // differs, so the caller renders it.
  period: ReactNode;
```

`ForecastForm/index.tsx` passes `period={<IntervalList … />}`; wrap that in a
fragment and render the checkbox beside it.

**Imitate how `months` travels** — the existing forecast-only field, in
`ForecastForm/hook.ts` (48 lines, room to spare). `simulated` follows the same
four steps: added to `ForecastFormValues`, seeded from `initial?.simulated`,
held in local state, merged at submit:

```ts
export type ForecastFormValues = EntryFormBase & { months: number[] };

const handleSubmit = () => {
  if (!canSubmit) { entry.setLocalError("…"); return; }
  entry.setLocalError(undefined);
  onSubmit({ ...entry.base(), months: selectedMonths });
};
```

`entry.base()` returns `toEntryBase(...)`, typed exactly `EntryFormBase` — it
will not carry `simulated` through, so it must be merged explicitly here.

**Watch out for** the plumbing being already complete on both ends:
`EntryScreen/hook.ts` posts the whole values object (`apiPost(path, values)` /
`apiPut(path, { id, ...values })`), and the edit modal seeds
`<Form initial={modal.entry} />` with the full `Forecast` from the API. So a new
key in `ForecastFormValues` needs no wiring beyond this folder — provided task
01's `toEntity` really maps the column.

## Scope
- In: `src/styles/_checkbox.scss` (moved), `IntervalCard/style.module.scss`
  (its `@use` line), and
  `src/app/previsoes/_components/ForecastsScreen/components/ForecastForm/{hook.ts,index.tsx}`
  plus a `style.module.scss` there if the label needs one.
- Out: `src/components/EntryForm/**`, `src/components/EntryScreen/**`,
  `src/app/movimentacoes/**`, and `e2e/interval-lock.spec.ts` (119 lines —
  touching it hard-fails the line cap; the e2e task uses a new file).

## Verify
```
npm run lint
npm run build
```
Manually at `http://localhost:3000/previsoes` (`npm run dev`): open "Nova
previsão" in Saídas, tick "Simulação", fill nome/valor/responsável/mês, save,
then reopen the row with its Editar button and confirm the box is still ticked.
Confirm the same modal on Movimentações has no such checkbox.

Measure, do not assume: with the modal open, read the `<label>`'s rendered
height and confirm it is at least 44px, and `wc -l` every file you touched
against the 100-line cap.

## Forbidden
- No `<button>` faking a checkbox — the native `role="checkbox"` is what the
  e2e task's `.check()`/`.uncheck()` calls need.
- No new prop on the shared `EntryForm`.
- No copy of the checkbox mixin — promote it, do not duplicate it.
- Do not make the checkbox affect `canSubmit`; a simulation is as valid as a
  real forecast.
