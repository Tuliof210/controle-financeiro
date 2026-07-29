# Type the price and the number of parcels, nothing else

## Outcome
- Registering total R$ 2.999,00 in 6 parcels from Ago/26 creates one row of
  R$ 499,84 per month over Ago/26–Jan/27 — no division typed by hand.
- The form previews the parcel value before submit, so the owner sees
  "6x de R$ 499,84" while typing.
- Editing that row to 3 parcels rewrites both its months and its monthly
  value; deleting it removes it. Both tabs reflect either immediately.

## Context

- **The arithmetic, exactly.** `valueCents = Math.ceil(totalCents / n)`, so the
  projection never under-states an outflow; the residue (< n cents) is
  deliberate and invisible — `series.helper.ts` sums `valueCents` per month and
  never sees `totalCents`. Worked example to check against: `299900 / 6 =
  49983.33 → 49984 → "R$ 499,84"`, six months, displayed total `R$ 2.999,00`
  (what was typed, not `49984 * 6`). Note `Math.ceil` is the first round-up in
  this repo; `ceiling.helper.ts:23-24` documents why *allowances* round down —
  a debt rounds the other way, and that contrast is worth one comment.

- **Months are always contiguous, and that is what keeps the model honest.**
  `months.length` IS the parcel count, so the two must never diverge. Build
  them with the existing primitives in `src/lib/months.ts`:

  ```ts
  export function addMonths(value: number, count: number): number
  export function buildMonths(start: number, end: number): number[]
  ```

  i.e. `buildMonths(first, addMonths(first, n - 1))`. `addMonths` is currently
  unused by the recurrences vertical and needs no changes.

- **Do NOT reuse `IntervalList`.** `RecurrenceForm` composes
  `useRecurrenceIntervals` + `IntervalList` to let a user add gappy intervals
  (`e2e/seed.helper.ts` seeds a real one: `months: [202601, 202603, 202605,
  …]`). A gap would make `months.length` stop meaning "parcels" and silently
  break the arithmetic above on every edit. This form has exactly two month
  inputs' worth of state: a first-month `MonthPicker` and a parcel-count
  number field.

- **Imitate `RecurrenceForm/hook.ts`'s wiring**, which is the whole contract
  for slotting into the shared `EntryForm`:

  ```ts
  export type RecurrenceFormValues = EntryFormBase & { months: number[] };

  const entry = useEntryForm(initial, people);
  const selectedMonths = intervalsToMonths(intervals);
  const canSubmit = entry.isValid && selectedMonths.length >= 1;
  const handleSubmit = () => {
    if (!canSubmit) { entry.setLocalError("Preencha nome, valor e responsável corretamente"); return; }
    onSubmit({ ...entry.base(), months: selectedMonths });
  };
  ```

  `EntryFormBase` is `{ name, valueCents, type, ownerId }` and `EntryForm`
  renders TextField → MoneyInput → income/expense toggle → owner select →
  `{period}` slot → error → submit. **The `period` slot is the only injection
  point**, and here the MoneyInput must capture the TOTAL while `valueCents` on
  the wire is the derived parcel. If bending `EntryForm` to that costs more
  than composing `TextField` + `MoneyInput` + `SelectField` + `MonthPicker`
  directly, compose them — `kind` is always `"installment"` and `type` always
  `"expense"`, so two of its six controls are dead weight either way.

- **`MonthPicker` self-seeds.** `useMonthPicker` fires `onChange(currentYYYYMM())`
  from an effect when `value === null`, indistinguishable from a real pick.
  `RecurrenceForm` dodges it by seeding both ends non-null
  (`defaultInterval()` in `intervals.hook.ts`). Do the same — initialise the
  first month to `currentYYYYMM()` — rather than adding a touched flag.

- **PUT is a full replace.** `recurrenceRepository.update` does
  `months: { deleteMany: {}, create: monthRows(months) }` and spreads every
  other field. A submit that omits `kind` flips the row back to `"fixed"` and
  it vanishes from this screen into `/recorrencias`. Echo `kind` and
  `totalCents` on every update.

- **Reuse** `Modal` (`{ open, onClose, eyebrow?, title, children, footer? }`,
  native `<dialog>`), `ConfirmDialog`, `MoneyInput`
  (`{ valueCents, onChange, id?, ariaLabel? }`), and
  `resolveOwnerId(profile, people)` from `src/lib/ownership.ts` for the default
  owner. Mutations: `apiPost`/`apiPut`/`apiDelete` from `src/lib/api.ts`,
  `apiDelete(`/api/recurrences?id=${id}`)`.

- **Watch out for**: `valueCents: z.number().int().min(1)` at the route, so a
  `totalCents` below the parcel count 422s as a generic "Dados inválidos" —
  block it in the form instead. Buttons need ≥44px hardcoded. `api.ts` never
  rejects: guard `result.error` before refetching.

## Scope
- In: `src/app/parcelamentos/_components/InstallmentsScreen/**` — the form
  component, the modals and the mutation handlers.
- Out: `src/components/EntryForm` and every other shared component (consume, do
  not edit), `RecurrenceForm`, `IntervalList`, the API and the repository.

## Verify
- `npm run lint`, `npx tsc --noEmit`.
- `npm run dev` and drive the real form: 2999,00 / 6 / Ago/26 must preview
  "6x de R$ 499,84" before submit, and the created row must read
  `Ago/26–Jan/27` with total `R$ 2.999,00`.
- `curl -s http://localhost:3000/api/recurrences | jq '.data[] | select(.kind=="installment")'`
  — `valueCents: 49984`, `totalCents: 299900`, six consecutive months.
- Edit it to 3 parcels and re-check: three months, `valueCents: 99967`,
  `kind` still `"installment"`.
- Confirm it is still absent from `/recorrencias` after the edit.
- `wc -l` every touched file, stylesheets included.

## Forbidden
- Asking the owner for the parcel value, or for an end month.
- Any path that can produce non-contiguous months, or `months.length !== n`.
- A `type` or `kind` control — expense and installment are constants here.
- Dropping `kind`/`totalCents` from the PUT body.
- Reconciling the rounding residue by writing an uneven last parcel:
  `RecurrenceMonth` has no per-month value and this story does not add one.
