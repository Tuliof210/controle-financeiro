# Generic EntryForm with a pluggable period control (Phase 2 — highest risk)

## Description
Unify `RecurrenceForm` and `MovementForm` into one generic `EntryForm` that owns
the shared scaffolding (Nome, Valor, Entrada/Saída toggle, Responsável) and
delegates the one genuinely-divergent part — the **period control** — to a slot.

> **Phase 2 caveat (read before starting).** This is the riskiest task in the
> story and the one the audit most cautions against. The forms share the
> name/value/type/owner scaffolding and the `canSubmit`/`handleSubmit`/
> `localError` shape, but the period model truly differs:
> - Recurrences: `months: number[]`, edited by `<IntervalList>` (interval
>   sliders), validity = `intervalsToMonths(intervals).length >= 1`.
> - Movements: `month: number`, edited by a single bounded `<select>`, validity =
>   `monthOptions.includes(month)`.
> A generic form must abstract over "the period part of the value + its control +
> its validity." With two consumers the payoff is marginal; **only ship this if
> the result is clearly cleaner than the two forms.** Otherwise stop the story at
> task 04 and record the decision in the PR/story.

Duplicated scaffolding (all on `main`, byte-equivalent):
`RecurrenceForm/index.tsx` ↔ `MovementForm/index.tsx` and their `hook.ts` — the
`TYPE_LABELS`/`SELECTED_VARIANT` toggle (now from `@/lib/entry-types`, task 01),
the Responsável owner `<select>`, `resolveOwnerId` default (task 03), and the
`canSubmit`/`handleSubmit`/`localError` logic. Divergence is only the
period-gated block (`period ? <control> : <guard>`).

## When to run
- Depends on: 01, 02, 03, 04 (uses the shared libs and slots into `EntryScreen`).
  Branch from main after 04 merges.
- Parallel-safe with: none

## How-to
Design a generic `EntryForm` under `src/components/` that takes the period
concern as an injected sub-form. A workable shape (adjust during implementation
— the exact generic API is a design call, guided by the shared/divergent split
above):

- `EntryForm` owns: `name`, `valueCents`, `type`, `ownerId` state (+
  `resolveOwnerId` default), the `localError`, and the shared JSX (TextField,
  MoneyInput, type toggle, owner select, error line, submit `Button`). It is
  gated by `period` and renders the `guard` `<p>` when `period` is null.
- The **period slot** is provided by the caller as a small controlled sub-hook +
  node, exposing: the current period value, an `isValid` flag, a `reset`/seed
  from `initial`, and the rendered control. Two implementations:
  - **RecurrencesPeriod** — wraps the existing `useRecurrenceIntervals` +
    `<IntervalList>`; value = `months` via `intervalsToMonths`, `isValid =
    months.length >= 1`.
  - **MovementPeriod** — a single bounded `<select>` (options from
    `buildMonths(period)`), value = `month`, `isValid = monthOptions.includes(month)`,
    default = current month clamped into the period (as `MovementForm/hook.ts`
    does today).
- `EntryForm.handleSubmit` composes `{ name, valueCents, type, ownerId, ...periodValue }`
  and calls `onSubmit`. `canSubmit = period !== null && name.trim() && valueCents
  >= 1 && ownerId !== "" && periodIsValid`.
- Keep the two feature form value types (`RecurrenceFormValues` with `months`,
  `MovementFormValues` with `month`) as the `onSubmit` payload shapes — the
  generic form is parameterized over the period payload so each screen still gets
  its correct type.
- **Do NOT change** `IntervalList`, `intervals.helper`, `intervals.hook`, or the
  month select's behavior — only relocate them behind the slot. This keeps the
  refactor behavior-preserving.

Respect the 100-line Biome cap — the generic form + the two period sub-forms
should each stay small; extract helpers/hooks as needed.

## Risks / notes
- This touches the most-exercised UI (add/edit for both features). Regressions
  are user-visible. Verify EVERY interaction below, on both features.
- The two period models are a real difference, not incidental — if the slot
  abstraction forces awkward typing or prop-drilling, that's the "wait for the
  third entity" signal; prefer stopping here over a leaky abstraction.

## Verification
```
npm run lint
npm run test
npm run build
```
All green. Live (`npm run dev`), for **both** Recorrências and Movimentações
(seed a global period + a person first):
- Add: Nome, Valor (odometer money input), Entrada/Saída toggle (green/red),
  Responsável default = active profile, and the correct period control
  (recurrence interval sliders with add/remove; movement single month select).
- Save → persists the right period shape (recurrence `months` set; movement
  single `month`), list shows the right period text.
- Edit → the period control round-trips the saved value.
- No global period → both forms show the guard and Save is disabled.
- Delete still works via ConfirmDialog.
Confirm the recurrences non-contiguous interval flow (e.g. Jan–Mar + Jul–Dez)
and the movements single-month flow both behave exactly as before this task.
