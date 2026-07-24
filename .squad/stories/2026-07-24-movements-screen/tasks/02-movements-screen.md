# Movements screen — MovementsScreen, modal form (single-month select), row, section

## Description
Build the `/movimentacoes` UI as a near-exact mirror of the Recorrências screen,
with the one difference that a movement has a **single month** picked in the
add/edit modal via a `<select>` bounded to the global period (no ranges, no
sliders). Replaces the `<h1>Movimentações</h1>` stub.

Reuse the shared primitives as-is: `Button` (variants `primary|ghost|danger|
success`), `MoneyInput`, `TextField`, `Modal`, `ConfirmDialog`, `IconButton`,
`SectionCard` (optional `tone: "positive"|"negative"`), `useProfile`
(`@/components/ProfileProvider/hook`, sentinel `"familia"` = everyone), and the
`--color-positive`/`--color-negative` tokens.

## When to run
- Depends on: 01 (needs the `Movement` entity, `/api/movements`, and
  `MOVEMENT_TYPES`). Run `npm install` is not needed, but this task's worktree
  must branch from a `main` that already has task 01 merged.
- Parallel-safe with: none

## How-to
Mirror `src/app/recorrencias/` structure under `src/app/movimentacoes/`. Every
component keeps the repo's `index.tsx` + `hook.ts` + `style.module.scss` +
`*.helper.ts` split; files stay ≤100 lines (Biome cap).

### A. Page
`src/app/movimentacoes/page.tsx` — replace the stub with (mirror
`recorrencias/page.tsx`):
```tsx
import { MovementsScreen } from "./_components/MovementsScreen";
export default function Page() {
  return <MovementsScreen />;
}
```
Nav already lists `/movimentacoes` (`AppShell/.../Aside/hook.ts`) — no nav change.

### B. Screen — `_components/MovementsScreen/`
Mirror `RecurrencesScreen/` (index.tsx, hook.ts, style.module.scss,
movements.helper.ts). Swap `Recurrence`→`Movement`, `/api/recurrences`→
`/api/movements`, "recorrência"→"movimentação" in labels/messages.
- `hook.ts` (`useMovementsScreen`): copy `RecurrencesScreen/hook.ts` verbatim —
  same `ModalState` union, same load (`apiGet<Movement[]>("/api/movements")` +
  people + settings), same `period` derivation
  (`settings?.rangeStart != null && settings?.rangeEnd != null ? {start,end} :
  null`), same `openAdd/openEdit/openDelete/close`, `persist`, `onAdd`
  (`apiPost`), `onUpdate` (`apiPut` with `{ id, ...values }`), `onConfirmDelete`
  (`apiDelete("/api/movements?id="+id)`), and `splitByType(visibleFor(...))`.
  **Follow the `api.ts` never-rejects contract** — check `result.error` before
  `result.data` (never `try/catch` around the helpers).
- `movements.helper.ts`: mirror `recurrences.helper.ts` — a 3-line
  `visibleFor(all: Movement[], profile)` (`profile === "familia" ? all :
  all.filter(m => m.ownerId === profile)`) and `splitByType(movements)` →
  `{ income, expense }`. Colocate a `movements.helper.test.ts` (mirror
  `recurrences.helper.test.ts`; the `make()` fixture uses `month: 202601`).
- `index.tsx` (`MovementsScreen`): mirror `RecurrencesScreen/index.tsx` — `h1`
  "Movimentações", `.grid` of two `MovementSection`s ("Entradas"
  `icon={ArrowDownCircle} tone="positive"`, "Saídas" `icon={ArrowUpCircle}
  tone="negative"`), the add/edit `Modal`s rendering `MovementForm`, and the
  `ConfirmDialog`. Titles: "Adicionar movimentação" / "Editar movimentação",
  confirm message `Excluir "${modal.movement.name}"?`.

### C. Modal form — `_components/MovementsScreen/components/MovementForm/`
Mirror `RecurrenceForm/` (index/hook/style) but **replace the whole interval
editor with a single bounded month `<select>`**.
- Feature-local month helper `MovementForm/month.helper.ts` (+ `.test.ts`).
  buildMonths + formatYyyymm are the two pure utilities the select needs, and
  both currently live *inside* the recurrences feature (volatile — the owner is
  reworking recurrences' interval UI). To keep movements decoupled, copy these
  two tiny functions here, importing their primitives from the stable shared
  module `@/components/MonthPicker/month.helper` (`MONTH_LABELS`, `splitYYYYMM`,
  `composeYYYYMM`):
  ```ts
  import {
    MONTH_LABELS,
    composeYYYYMM,
    splitYYYYMM,
  } from "@/components/MonthPicker/month.helper";

  // ponytail: duplicated (buildMonths/formatYyyymm) from the recurrences feature
  // on purpose — decouples movements from that volatile interval code. Promote to
  // a shared month module if a third consumer appears (rule of three).
  export function buildMonths(start: number, end: number): number[] {
    const months: number[] = [];
    let { year, month } = splitYYYYMM(start);
    let current = start;
    while (current <= end) {
      months.push(current);
      month += 1;
      if (month > 12) { month = 1; year += 1; }
      current = composeYYYYMM(year, month);
    }
    return months;
  }

  export function formatYyyymm(value: number): string {
    const year = Math.trunc(value / 100);
    const month = value % 100;
    return `${MONTH_LABELS[month - 1]}/${String(year % 100).padStart(2, "0")}`;
  }
  ```
  Test: `buildMonths` (multi-month, year-boundary, single, start>end → []) and
  `formatYyyymm` (e.g. 202608 → "Ago/26").
- `hook.ts` (`useMovementForm`): mirror `RecurrenceForm/hook.ts` but:
  - `MovementFormValues = { name; valueCents; type: Movement["type"]; ownerId;
    month: number }`.
  - `MovementFormProps` identical to `RecurrenceFormProps` (still takes
    `period: { start; end } | null`, `people`, `initial?`, `onSubmit`, ...).
  - Replace the intervals state with a single `month` state, seeded from
    `initial?.month ?? defaultMonth`, where `defaultMonth` = the current month if
    it falls inside the period, else `period.start`:
    ```ts
    const current = currentYYYYMM(); // from @/components/MonthPicker/month.helper
    const defaultMonth = period
      ? Math.min(Math.max(current, period.start), period.end)
      : 0;
    ```
    (YYYYMM is monotonic as an int, so min/max clamps correctly.)
  - `const monthOptions = period ? buildMonths(period.start, period.end) : [];`
  - `canSubmit = period !== null && name.trim().length > 0 && valueCents >= 1 &&
    ownerId !== "" && monthOptions.includes(month)`.
  - `handleSubmit` emits `{ name: name.trim(), valueCents, type, ownerId, month }`.
  - Keep the `defaultOwnerId` logic (profile-or-first-person) from RecurrenceForm.
- `index.tsx`: mirror `RecurrenceForm/index.tsx` — Nome TextField, Valor
  MoneyInput, the Entrada/Saída type toggle (`SELECTED_VARIANT = { income:
  "success", expense: "danger" }`, `MOVEMENT_TYPES` from `@/lib/movement-types`),
  the Responsável owner `<select>`, then **the period-gated month select**:
  ```tsx
  {period ? (
    <select
      aria-label="Mês"
      className={styles.select}
      value={month}
      onChange={(e) => setMonth(Number(e.target.value))}
    >
      {monthOptions.map((m) => (
        <option key={m} value={m}>{formatYyyymm(m)}</option>
      ))}
    </select>
  ) : (
    <p className={styles.guard}>
      Defina o período global em Configurações para cadastrar movimentações.
    </p>
  )}
  ```
  then the error line and the submit `Button disabled={!canSubmit}`.
- `style.module.scss`: copy `RecurrenceForm/style.module.scss` (`.form`,
  `.typeToggle`, `.field`, `.label`, `.select`, `.guard`, `.error`) — the
  `.select` rule already fits the month select.

### D. Row — `_components/MovementsScreen/components/MovementRow/`
Mirror `RecurrenceRow/` (index.tsx, style.module.scss). Same layout (owner
swatch via `styles[person.color]` + `@use "swatch-colors"`, name, value colored
by type via `styles[movement.type]` with `.income`/`.expense` →
positive/negative, edit/delete `IconButton`s). The period cell becomes a single
month: `{formatYyyymm(movement.month)}` (import from the local
`../MovementForm/month.helper`). `formatCents` from
`@/components/MoneyInput/money.helper`.

### E. Section — `_components/MovementsScreen/components/MovementSection/`
Mirror `RecurrenceSection/` (index/hook/style). Props `{ title; icon:
LucideIcon; tone: "positive"|"negative"; items: Movement[]; people; onAdd;
onEdit; onDelete }`. Resolves each row's owner via `people.find`, wraps
`SectionCard title icon tone`, empty → "Nenhuma movimentação cadastrada ainda.",
else `<ul>` of `MovementRow` keyed by `movement.id`, ending with a
`<Button onClick={onAdd}>Adicionar</Button>`.

## Verification
```
npx prisma generate
npm run db:setup
npm run lint
npm run test
npm run build
```
All green (fresh worktree: generate + db:setup first). Then live in the browser
(`npm run dev`; the `preview_start {name}` launcher runs from the main checkout,
so for a worktree start the dev server manually on a spare port and
`preview_start {url}`). Seed a global period in Configurações (or via SQL) and a
person first, then verify:
- Open Movimentações → two sections (Entradas green / Saídas red), empty state.
- Add a movement: Nome, Valor, toggle Entrada/Saída (green/red), Responsável,
  and a **single Mês select** listing only the period's months. Save → the row
  appears under the right section with the value colored by type and the month
  shown as e.g. "Ago/26".
- Edit → the modal reopens with the saved month selected; change it, save; the
  row updates.
- Delete → ConfirmDialog → row removed.
- Switch the header profile selector to a person → only that owner's movements
  show; back to "Família" → all show.
- With no global period set, the modal shows the guard and Save is disabled.
