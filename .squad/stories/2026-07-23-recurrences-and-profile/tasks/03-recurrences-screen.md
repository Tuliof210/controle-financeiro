# Recurrences screen: two lists + CRUD modals + person select + month-range slider + profile filter

## Description
Fill the stubbed `/recorrencias` route with the Recurrences screen. Two
separate lists — **Entradas** (type `income`) and **Saídas** (type `expense`).
Each row: owner (color swatch + name), recurrence name, value `R$ x.xxx,xx`,
and the month sub-period label (`Ago/26 → Dez/26`), plus edit + delete icon
buttons. Add/Edit use a modal form; Delete uses `ConfirmDialog`. The form
captures name, value, owner (person `<select>`), and the active month
sub-period via a **two-thumb range slider** bounded by the global Settings
period. The whole screen is filtered by the active profile (task 02): a
selected person shows only their recurrences; "Família" shows all.

## When to run
- Depends on: **tasks/01** (the `/api/recurrences` API + `Recurrence` entity)
  AND **tasks/02** (`useProfile()` from `src/components/ProfileProvider`).
- Parallel-safe with: none.
- After merging 01 & 02 into this worktree's base, run `npm install` +
  `npm run db:setup` (node_modules + SQLite file are not shared across
  worktrees — see learnings) before hitting the API.

## How-to

**Reference implementation to copy:** the whole Settings screen, especially
PeopleSection (list + add/edit modals + delete confirm) and its 3-file layout.
- Screen shell: `src/app/configuracoes/page.tsx` + `_components/SettingsScreen/{index.tsx,hook.ts,style.module.scss}`.
- CRUD section: `.../SettingsScreen/components/PeopleSection/{index.tsx,hook.ts}`
  + `components/{PersonRow,PersonForm}/`. **Use the discriminated-union modal
  state from `GoalsSection/hook.ts`** (`{ type:"none" } | { type:"add"; kind } |
  { type:"edit"; recurrence } | { type:"delete"; recurrence }`) — it carries the
  row into edit/delete cleanly.
- Primitives (all under `src/components/`, all 3-file, props from their
  `hook.ts`): `Modal` (`{open,onClose,title,children,footer?}`),
  `ConfirmDialog` (`{open,onClose,onConfirm,title,message}`), `MoneyInput`
  (`{valueCents,onChange,ariaLabel?}`, cents-based;
  `money.helper.ts` → `formatCents`/`digitsToCents`), `TextField`
  (`{label,value,onChange,id,error?,maxLength?}`), `Button`
  (`{variant?:"primary"|"ghost"|"danger"}`), `IconButton`
  (`{variant?,"aria-label":required}`, icons `Pencil`/`Trash2` from lucide,
  `variant="danger"` on delete).
- Client API: `src/lib/api.ts` (`apiGet/apiPost/apiPut/apiDelete`, return
  `{ data } | { error }`, read `.error` before `.data`).
- Month helpers: `src/components/MonthPicker/month.helper.ts` exports
  `MONTH_LABELS`, `splitYYYYMM`, `composeYYYYMM`. Types tuple:
  `src/lib/recurrence-types.ts` (from task 01).

### 1. Route + screen shell
- `src/app/recorrencias/page.tsx` → reduce to
  `import { RecurrencesScreen } from "./_components/RecurrencesScreen"; export default function Page(){ return <RecurrencesScreen />; }`
  (imitate `configuracoes/page.tsx`).
- `src/app/recorrencias/_components/RecurrencesScreen/{index.tsx,hook.ts,style.module.scss}`
  (`"use client"`). The hook: fetch recurrences (`apiGet<Recurrence[]>("/api/recurrences")`),
  people (`apiGet<Person[]>("/api/people")`), settings
  (`apiGet<Settings>("/api/settings")` for the slider bounds
  `rangeStart`/`rangeEnd`). Read `const { profile } = useProfile()`. Derive the
  visible set: `profile === "familia" ? all : all.filter(r => r.ownerId === profile)`.
  Split into `income` / `expense`. Own the discriminated-union modal state +
  the CRUD handlers (POST/PUT to `/api/recurrences`, DELETE via
  `?id=`), each doing `if (result.error) return setError; close(); refetch()`.
  Keep the hook ≤100 lines — extract the fetch-all + the filter/split into a
  `recurrences.helper.ts` (+ test for the split-by-type/owner-filter) if tight.

### 2. Two lists
Render two `SectionCard`-style blocks (reuse
`.../SettingsScreen/components/SectionCard` — it's shared: `{title, icon?}`).
"Entradas" (icon e.g. `ArrowDownCircle`) and "Saídas" (`ArrowUpCircle`), each
with its rows + an "Adicionar" `Button` that opens the add modal **pre-set to
that type** (`open({type:"add", kind:"income"|"expense"})`). Empty state per
list mirrors PeopleSection's `.empty` paragraph. Repeated row markup →
`components/RecurrenceRow/` (presentational, no `hook.ts`, like `PersonRow`):
owner swatch (`person.color`) + name, recurrence name, `R$ {formatCents(valueCents)}`,
the period label, and edit/delete `IconButton`s. Resolve `ownerId`→person from
the people list passed down (the row gets the resolved `person` or
`ownerName`/`ownerColor` as props — don't refetch per row).

Period label helper — `recurrence-range.helper.ts` (+ test):
`formatYyyymm(n)` → `${MONTH_LABELS[month-1]}/${String(year).slice(2)}` (e.g.
`202608` → `"Ago/26"`), and `formatPeriod(start,end)` → `"Ago/26 → Dez/26"`.
(`RangeSection/range.helper.ts` does the same for its own use — don't import
across the settings folder; a small local helper is cleaner.)

### 3. Form — `components/RecurrenceForm/{index.tsx,hook.ts,style.module.scss}`
Props: `{ initial?: RecurrenceFormValues; error?: string; onSubmit; submitLabel;
people: Person[]; period: { start: number; end: number } | null }`. Fields:
- name → `TextField`.
- value → `MoneyInput` (cents).
- owner → a native `<select>` of `people` (copy `MonthPicker`'s `<select>`
  markup). Default to the first person, or the currently-active profile person
  if one is selected. `aria-label="Responsável"`.
- type → since add is opened per-list the type is known; still show a small
  toggle (two `Button`s or a `<select>`) so edit can change it. `RecurrenceFormValues`
  includes `type`.
- month sub-period → `<MonthRangeSlider>` (new component, below), bounded by
  `period`.
Client-side validation in the hook (mirror `GoalForm`): value ≥ 1, name
non-empty, owner set, and `rangeStart <= rangeEnd`; merge `localError ?? error`
for display; disable submit while invalid. **If `period` is null** (no global
period set in Settings), render an inline message ("Defina o período global em
Configurações para cadastrar recorrências.") and disable submit — the slider
has no bounds. Conditionally MOUNT the form inside the modal
(`{modal.type === "add" && <RecurrenceForm .../>}`) so its `useState` resets
each open, exactly like PeopleSection.

### 4. New primitive — `MonthRangeSlider`
A two-thumb slider selecting a start and end month within
`[period.start, period.end]` (inclusive, `YYYYMM`). Put it at
`.../RecurrenceForm/components/MonthRangeSlider/` (local until a 2nd consumer
needs it, per the promotion rule). Three files.
- Build the discrete month list once: iterate `composeYYYYMM` from
  `period.start` to `period.end` into an array `months: number[]`; the slider
  operates on **indices** `0..months.length-1`.
- Markup: two overlaid `<input type="range" min=0 max={months.length-1}>`
  (start thumb + end thumb) over a track, plus a filled segment `<div>` between
  the two thumbs. Value labels above: `formatYyyymm(months[startIdx]) → formatYyyymm(months[endIdx])`.
- Logic in `hook.ts`: clamp so `startIdx <= endIdx` on every change (if the user
  drags start past end, pin them together). Emit `onChange({ rangeStart:
  months[startIdx], rangeEnd: months[endIdx] })`. Props:
  `{ months: number[]; rangeStart: number; rangeEnd: number; onChange }`.
- Accessibility: each `<input>` gets an `aria-label` ("Mês inicial" / "Mês
  final"). **Learnings gotcha:** never mix a `:hover`/pseudo rule with an inline
  `style` on the same property — put thumb/track styling in the
  `.module.scss`, use inline style ONLY for the dynamic fill offset/width
  (computed %). Keep each file ≤100 lines.
- If a single month range (`period.start === period.end`) or an empty list,
  degrade gracefully (one fixed month, slider disabled) rather than crash.

### Verification
- `npm install && npm run db:setup` in the worktree (after basing on 01+02).
- `npm run lint` clean (100-line file+function caps — this task creates many
  small files by design), `npm test` (new helper tests green), `npm run build`.
- Browser (worktree preview per learnings: dev server on a spare port +
  `preview_start {url}`; also note the `read_page`-after-`navigate` empty-page
  retry, and check modal state in a SEPARATE js call after a click since React
  updates are async):
  1. Seed data: ensure Settings has a global period (set one in
     `/configuracoes` if empty) and at least 2 people exist.
  2. `/recorrencias` shows Entradas + Saídas lists (empty states first).
  3. "Adicionar" under Entradas → modal → fill name/value/owner, drag the
     slider to a sub-period → save → row appears in Entradas with the right
     owner swatch, value, and `Mmm/AA → Mmm/AA` label. Repeat under Saídas.
  4. Edit a row (values prefilled incl. slider position); Delete confirms via
     dialog and removes the row.
  5. In the header (task 02), pick a person → both lists filter to theirs;
     pick "Família" → all return.
  6. With Settings period empty, the form shows the guard message and Save is
     disabled (no crash).
