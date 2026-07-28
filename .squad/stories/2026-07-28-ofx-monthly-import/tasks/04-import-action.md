# The Importar button and its confirmation dialog

## Outcome
- An "Importar" button sits in the report's actions row and opens a dialog holding: a
  document-identifier text field pre-filled from the account, a person select, a line
  stating how many movements will be created, and Cancelar/Importar.
- Confirming posts one batch and, on success, closes the dialog and reports what landed;
  a refusal leaves the dialog open with the message in place.
- Once the file has been imported, the button is disabled and a tooltip beside it says
  so — on first render for a file imported in an earlier session, not only after this
  one.

## Context
- **Name format, decided by the owner**: `` `${TYPE_LABELS[type]} ${identifier} ${formatYyyymm(month)}` `` →
  `Entrada 1234-5 Ago/26`. `TYPE_LABELS` is `{ income: "Entrada", expense: "Saída" }` in
  `src/lib/entry-types.ts`; `formatYyyymm(202608)` returns `"Ago/26"`.
- **Cap the identifier field at `maxLength={40}`** and the generated name can never
  exceed the endpoint's `.max(80)` — "Entrada" (7) + 40 + "Ago/26" (6) + two spaces = 55.
  That is why no truncation logic is needed; do not add any.
- **The rows to send** come from `report.months`, which is ascending and gap-free
  (zero-filled). `OfxMonth` is `{ month, incomeCents, expenseCents, balanceCents, count }`.
  Emit an `income` row when `incomeCents > 0` and an `expense` row when `expenseCents > 0`
  — the endpoint's `valueCents: z.number().int().min(1)` rejects zero, so a zero-filled
  month must produce nothing rather than a rejected row that kills the whole batch.
  There are **no per-transaction rows anywhere on the client**; monthly aggregates are
  the entire payload and that is the intended granularity.
- **Reuse** `accountLabel(accounts: OfxAccount[]): string` from
  `.../ReportView/account.helper.ts` for the pre-fill. It returns `"—"` when no account
  declares an `<ACCTID>` — fall back to `report.org`, then to empty, rather than
  pre-filling the em dash.
- **Reuse** `resolveOwnerId(profile: string, people: Person[]): string` from
  `src/lib/ownership.ts` for the default person, with `const { profile } = useProfile()`
  from `src/components/ProfileProvider/hook`. People come from
  `apiGet<Person[]>("/api/people")` — there is no shared `usePeople`; every screen
  refetches (see `src/components/EntryScreen/hook.ts:36-38`).
- **Imitate** `src/components/EntryForm/index.tsx` for the dialog body — no `<form>`, no
  `onSubmit` event, a `<div className={styles.form}>` with
  `display:flex; flex-direction:column; gap: var(--space-3)` and a plain click handler:
  ```tsx
  <TextField id={`${idPrefix}-name`} label="Nome" value={name} onChange={setName} />
  <SelectField id={`${idPrefix}-owner`} label="Responsável" value={ownerId}
    onChange={setOwnerId}
    options={people.map((person) => ({ value: person.id, label: person.name }))} />
  {error ? (<p className={styles.error}><span aria-hidden>▲</span> {error}</p>) : null}
  ```
- **Reuse** `Modal` — props verbatim `{ open, onClose, eyebrow?, title, children, footer? }`.
  It is a native `<dialog>` with `showModal()`, so Esc, focus return and the backdrop
  scrim are free; `footer` renders a right-aligned row and is where Cancelar/Importar go,
  as in `src/components/ConfirmDialog/index.tsx`:
  ```tsx
  footer={<><Button variant="ghost" onClick={onClose}>Cancelar</Button>
             <Button variant={variant} onClick={onConfirm}>{label}</Button></>}
  ```
  Gate the children on the open flag (`{open && <…/>}`) exactly as
  `src/components/EntryScreen/index.tsx:67-81` does — unmounting is how this repo resets
  a draft form's `useState`.
- **Field signatures, verbatim** — both take the value, not the event:
  ```ts
  type TextFieldProps = { label: string; value: string; onChange: (value: string) => void;
    id: string; placeholder?: string; error?: string; maxLength?: number };
  type SelectFieldProps = { id: string; label: string; value: string;
    options: { value: string; label: string }[]; onChange: (value: string) => void };
  ```
  `SelectField` has no empty option built in — prepend one if the person list can be empty.
- **Watch out for `Tooltip`: it takes no children.** Its props are `{ text: string; label?: string }`
  and it renders its own focusable `<button>` with an `Info` icon; reveal is pure CSS on
  its wrapper (`:hover`/`:focus-within`). A disabled `<button>` fires no events, so the
  tooltip must be a *sibling* of the disabled Importar button, not a wrapper. That also
  keeps the hint keyboard-reachable. `.actions` in `ReportView/style.module.scss` is
  `display:flex; flex-wrap:wrap; gap: var(--space-3)` with no `align-items` — add
  `align-items: center` or the tooltip trigger stretches to the row height.
- **Watch out for** `useReportView` being documented as pure: "nothing here calls a React
  hook and the whole view model is directly testable". Put the button, the dialog and all
  their state in a **new component folder** under `.../ReportView/components/`, mounted
  inside the existing `<div className={styles.actions}>` — `ReportView/index.tsx` is at
  98 lines against a 100-line cap, so it has room for one element and nothing else.
- **Reuse** `apiGet` / `apiPost` from `src/lib/api.ts`, and remember they never reject:
  guard `if (result.error || !result.data)`, never `?? null` alone.
- **The already-imported check** is `GET /api/ofx-imports?hash=${report.fileHash}` on
  mount and whenever the hash changes; a successful POST flips the same local flag
  without a refetch. `report.fileHash` arrives from task 02.
- **Watch out for** `Button`'s props being `{ variant?: "primary"|"ghost"|"danger"|"success"|"dashed" } & ButtonHTMLAttributes`
  — `disabled` passes straight through and has real disabled styling. The actions row
  already holds a `ghost` Fechar and a `primary` "Trocar arquivo" (inside `FilePicker`);
  decide the hierarchy rather than shipping two primaries by accident.
- **Watch out for** the dashboard: `src/app/api/dashboard/series.helper.ts` reconciles
  real against estimated with `Math.max(realIncome, estIncome)`, not a sum, so a first
  import visibly moves the balance line's dashed segment. Correct, not a bug to chase.
- **Watch out for** a purely historical statement: `derivePeriod` widens the period from
  the movements themselves, and if the resulting range excludes the current month the
  dashboard answers `out_of_range`. Do not clamp the imported months to "fix" it — the
  period is the output of the entries and `period.service.ts` explicitly forbids using it
  to reject one.

## Scope
- In: a new component folder under `.../ReportView/components/`, the `.actions` block in
  `ReportView/index.tsx`, and the `.actions` rule in `ReportView/style.module.scss`
- Out: `MonthRow/**` (task 03 owns it), `src/components/**` — reuse the primitives as
  they are; `e2e/` — task 05 owns the spec

## Verify
- Upload an OFX, open the dialog, confirm the identifier is pre-filled and the count
  matches the number of non-zero income + expense cells in the visible table.
- Import, then go to `/movimentacoes` and confirm the rows are there with the exact name
  `Entrada <identificador> <Mmm/AA>`. The screen refetches on mount only — it will not
  update a tab left open on it.
- Return to `/leitor-ofx`, upload the same file again, and confirm the button is disabled
  and the tooltip is reachable by keyboard.
- Import with no person registered and confirm the dialog refuses rather than posting an
  empty `ownerId`.
- `npm run lint` && `npm run build`. `wc -l` every file created or touched.

## Forbidden
- Do not add state, effects or hooks to `useReportView`, and do not put modal state in
  `EntryScreen` — it is already on the 100-line cap.
- Do not wrap the disabled button in `Tooltip`, and do not add a `children` prop to it.
- Do not send a movement whose `valueCents` is 0, and do not send more than one POST —
  the all-or-nothing guarantee lives in the single batch.
- Do not build a per-transaction picker: individual transactions never leave the server.
- Do not add a second close control to the Modal; it renders its own.
