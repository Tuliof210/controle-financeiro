# Rework Pessoas — list + add-modal + per-row edit/delete-confirm modals

## Description
Turn the Pessoas section from an always-visible inline form into the target
pattern: a **list** of people (color swatch + name), an **Adicionar** button
that opens an add-**modal**, and per-row **Editar** (pencil) + **Excluir**
(trash) icon buttons — Editar opens a prefilled edit-modal, Excluir opens a
**confirm** modal. Add and Edit share one form body (name + color). Empty state
when none; duplicate name rejected inside the modal.

## When to run
- Depends on: 02 (IconButton, angular Button), 03 (Modal + ConfirmDialog), 04 (people PUT endpoint) — and transitively 01 (working DB)
- Parallel-safe with: 06, 07

## How-to
Current code (read first):
`src/app/configuracoes/_components/SettingsScreen/components/PeopleSection/`
— `hook.ts` (state `people|name|color|error`, `refetch` via `useCallback`,
`onAdd` POST, `onDelete` DELETE), `index.tsx` (a `<ul>` of rows, each `swatch +
name + <Button variant="danger">Remover</Button>`, then an inline `.form` of
`TextField` + `ColorPicker` + `<Button>Adicionar</Button>`), `style.module.scss`
(`.list/.row/.swatch/.name/.form`, plus `@use "swatch-colors"`).

Consume the new primitives: `@/components/Modal`, `@/components/ConfirmDialog`,
`@/components/IconButton`, and `apiPut` from `@/lib/api`. Lucide `Pencil` and
`Trash2` for the row icons (already-installed `lucide-react`).

**1. Extract a shared `PersonForm` child** — inside `PeopleSection/components/
PersonForm/` (three files). Body of both the add and edit modals: a `TextField`
(name) + `ColorPicker` (color) + a submit `Button`, plus the inline error
display. Props: `{ initial?: {name,color}; error?; onSubmit: ({name,color}) =>
void; submitLabel }`. Add-modal passes no `initial` (empty, submitLabel
"Adicionar"); edit-modal passes the person's current values (submitLabel
"Salvar"). This avoids duplicating the form JSX across two modals.

**2. Rework `PeopleSection`:**
- **List rows**: swatch + name + an `IconButton` **Editar** (`aria-label="Editar
  <name>"`, `<Pencil/>`) + an `IconButton danger` **Excluir**
  (`aria-label="Excluir <name>"`, `<Trash2/>`). Replace the old text "Remover"
  Button. If the row JSX gets busy, extract a `PersonRow` child (recursion rule).
- **Empty state**: keep "Nenhuma pessoa cadastrada ainda."
- **Adicionar**: a Button above/below the list that opens the add-modal.
- **Modals**: an add-`Modal` (title "Adicionar pessoa", body `PersonForm`), an
  edit-`Modal` (title "Editar pessoa", body prefilled `PersonForm`), and a
  `ConfirmDialog` for delete (message naming the person).
- **hook.ts**: extend with modal state — which modal is open
  (`none|add|edit|delete`) and the target person for edit/delete. Handlers:
  `onAdd` (POST → refetch → close), `onUpdate` (`apiPut("/api/people", {id,
  name, color})` → refetch → close), `onConfirmDelete` (DELETE → refetch →
  close). Reuse the existing `refetch` (`useCallback`) and the
  `result.error`-checking pattern already in this hook (surface the API error
  inside the modal via `PersonForm`'s `error` prop; keep the "Já existe uma
  pessoa com esse nome" duplicate message). Watch the **100-line cap** — if the
  hook exceeds it, extract the modal/target state into a small
  `use-person-modals.helper.ts` or split handlers into a `*.helper.ts`.

**Exemplars:** the existing `PeopleSection` for the fetch/refetch/error pattern;
`GoalsSection` mirrors the same shape (task 06 does the goal equivalent — keep
the two patterns consistent). `TextField`/`ColorPicker` props as already used.

**Do NOT:** add optimistic updates, inline-edit-in-place, drag-reorder, or a
generic CRUD-section abstraction (YAGNI). No new dependency.

**Verification:**
- Run `npm run db:setup` in the worktree first (needs task 01; a fresh worktree
  has an empty `dev.db`).
- `npm run lint`, `npm run test`, `npm run build` all green.
- Browser preview `/configuracoes`, both themes: Adicionar opens a modal, adds a
  person, closes, list refreshes. A duplicate name shows the error **inside** the
  modal (no 500). Editar opens a prefilled modal; changing name/color saves and
  the row updates. Excluir opens a confirm; Cancelar aborts, Excluir removes the
  row. Empty state returns when the last person is deleted. Modals close on
  `Esc`/backdrop; focus returns to the trigger. Every control has a focus ring.
  Confirm via screenshots + `read_network_requests` (POST/PUT/DELETE 2xx).
