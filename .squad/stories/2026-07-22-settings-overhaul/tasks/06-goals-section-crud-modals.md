# Rework Objetivos — list + add-modal + per-row edit/delete-confirm modals

## Description
Same rework as Pessoas (task 05), applied to the Objetivos section: a **list**
of goals (name + target money in `tabular-nums`), an **Adicionar** button that
opens an add-**modal**, and per-row **Editar** + **Excluir** icon buttons —
Editar opens a prefilled edit-modal, Excluir opens a **confirm** modal. Add and
Edit share one form body (name + target). Empty state when none. Keep the "—
progresso em breve" placeholder on each row (progress is a future story).

## When to run
- Depends on: 02 (IconButton, angular Button), 03 (Modal + ConfirmDialog), 04 (goals PUT endpoint) — and transitively 01 (working DB)
- Parallel-safe with: 05, 07

## How-to
Current code (read first):
`src/app/configuracoes/_components/SettingsScreen/components/GoalsSection/`
— `hook.ts` (state `goals|name|targetCents|error`, `refetch` via `useCallback`,
`onAdd` POST with client-side `targetCents < 1` rejection, `onDelete` DELETE),
`index.tsx` (a `<ul>` of rows: `name + R$<target, tabular-nums> + "— progresso
em breve" + <Button variant="danger">Remover</Button>`, then an inline `.form`
of `TextField` + `MoneyInput` + `<Button>Adicionar</Button>`).

Consume: `@/components/Modal`, `@/components/ConfirmDialog`,
`@/components/IconButton`, `apiPut` from `@/lib/api`, lucide `Pencil`/`Trash2`.
Mirror task 05's structure so the two sections stay consistent.

**1. Extract a shared `GoalForm` child** — `GoalsSection/components/GoalForm/`
(three files): `TextField` (name) + `MoneyInput` (target, cents) + submit
`Button` + inline error. Props: `{ initial?: {name,targetCents}; error?;
onSubmit; submitLabel }`. Keep the existing **client-side `targetCents < 1`
rejection** ("Informe um valor maior que zero") in the submit path.

**2. Rework `GoalsSection`:**
- **List rows**: name + target (`.target` keeps `font-variant-numeric:
  tabular-nums`) + "— progresso em breve" placeholder + an `IconButton` **Editar**
  (`<Pencil/>`, `aria-label="Editar <name>"`) + an `IconButton danger` **Excluir**
  (`<Trash2/>`, `aria-label="Excluir <name>"`). Replace the text "Remover".
  Extract a `GoalRow` child if the row gets busy (recursion rule).
- **Empty state**: keep "Nenhum objetivo cadastrado ainda." (or the existing
  copy — match what's there).
- **Adicionar** button opens the add-modal.
- **Modals**: add-`Modal` (title "Adicionar objetivo", body `GoalForm`),
  edit-`Modal` (title "Editar objetivo", prefilled `GoalForm`), `ConfirmDialog`
  for delete (message naming the goal).
- **hook.ts**: extend with modal state (`none|add|edit|delete` + target goal) and
  handlers `onAdd` (POST), `onUpdate` (`apiPut("/api/goals", {id, name,
  targetCents})`), `onConfirmDelete` (DELETE) — each refetch + close, each
  checking `result.error` and surfacing it inside the modal via `GoalForm`'s
  `error` prop. Reuse the existing `refetch`/error pattern. Mind the **100-line
  cap** — extract a `*.helper.ts` if the hook overflows.

**Money formatting:** reuse the existing cents formatter this section already
uses for display (`formatCents` or equivalent — find it in the current
`GoalsSection`), and `MoneyInput`'s existing cents API for the form.

**Do NOT:** add goal progress, deadlines, sorting, or a shared generic CRUD
abstraction across sections (YAGNI). No new dependency.

**Verification:**
- Run `npm run db:setup` in the worktree first (needs task 01).
- `npm run lint`, `npm run test`, `npm run build` all green.
- Browser preview `/configuracoes`, both themes: Adicionar opens a modal, adds a
  goal (target masks to cents, `< 1` rejected inside the modal), closes, list
  refreshes. Editar opens prefilled; saving updates the row. Excluir → confirm →
  Cancelar aborts / Excluir removes. Empty state returns when the last goal is
  gone. Modals close on `Esc`/backdrop; focus returns to trigger; focus rings
  present. Confirm via screenshots + `read_network_requests` (POST/PUT/DELETE
  2xx). Target renders in `tabular-nums`.
