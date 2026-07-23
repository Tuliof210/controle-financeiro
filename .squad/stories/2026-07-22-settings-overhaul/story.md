# Settings screen overhaul — fix the 500, go fully angular, list + modal CRUD

## Description
The just-merged **Configurações** screen (`/configuracoes`, PR #15) is broken
and off-brand. Two classes of problem:

1. **Nothing works — every section 500s ("Erro inesperado").** Root cause is
   confirmed: `prisma.config.ts` reads `datasource.url` from
   `process.env.DATABASE_URL` with **no fallback**, but the repo has **no
   `.env`** (only `.env.example`). So the Prisma CLI can't migrate → `dev.db`
   is a **0-byte file with no tables** → every runtime query throws SQLite
   `no such table` (the runtime client *does* fall back to `file:./dev.db`, so
   it connects to the empty DB instead of failing loudly) → the un-`try/catch`'d
   `GET` handlers return 500 → `src/lib/api.ts` renders the generic "Erro
   inesperado". A fresh checkout has **no automated path** to a working DB (no
   `db:setup`/migrate npm script, nothing documented).

2. **Design and UX miss the mark.** The screen is too rounded (all four cards
   use `--radius-lg` = 6px, the app's max; every primitive uses `--radius-md` =
   4px) when the DS constitution is angular/"0 radius first". Button borders are
   a single hardcoded near-black 2px on every variant with opacity-only hover
   and a border-carrying "ghost". And the interaction model is wrong: the owner
   wants each section to be a **list of configured items with an "Adicionar"
   button that opens a modal**, and **per-row Editar/Excluir buttons that open
   modals** — not the current always-visible inline forms.

This story fixes the persistence setup durably, applies a fully-angular
(`--radius-0`) DS pass to the shared primitives, adds the missing update
endpoints, builds the first real overlay primitives (Modal + ConfirmDialog +
IconButton), and reworks every section into the list/summary + modal-CRUD
pattern.

## Product & design decisions (from refinement)
- **Every section edits via modal.**
  - **Pessoas** and **Objetivos** (collections): a list of existing rows, an
    **Adicionar** button opening an add-modal, and per-row **Editar** (pencil)
    + **Excluir** (trash) icon buttons — Editar opens a prefilled edit-modal,
    Excluir opens a **confirm** modal.
  - **Range** and **Meta mensal** (singletons): a single read-only **summary
    row** showing the saved value + one **Editar** button opening an
    edit-modal. **No Add/Delete** — there is only ever one of each.
- **Fully square.** `--radius-0` on every rectangular surface — cards, buttons,
  inputs, selects, swatches. `--radius-full` stays **only** for the sidebar
  avatar and status dots. This is an **app-wide** change (it edits the shared
  primitives), so Dashboard / Movimentações / Recorrências go flatter too —
  intended, per the DS constitution.
- **Button borders reworked**: variant-aware borders with real
  hover/active/disabled states; the "ghost" variant stops carrying a solid
  border. Exact look confirmed with the owner at PR review.
- **Delete is a confirm modal**, never a one-click destructive action.
- **The DB fix is durable**, not a one-off `.env`: align the config fallback,
  add a `db:setup` npm script, and document the setup step.
- **No schema change.** `Person`/`Goal` already have every column edit writes;
  the only migration is *applying the existing* `init_settings` migration.

## Acceptance Criteria
- [ ] `/configuracoes` loads with **zero 500s** on a fresh checkout after the
      documented setup step; all four sections fetch and render their data.
- [ ] Pessoas: shows a list of people (color swatch + name); **Adicionar**
      opens a modal (name + color) that creates and refreshes the list; each
      row has **Editar** (opens a prefilled modal that updates) and **Excluir**
      (opens a confirm modal that deletes); empty state when none; duplicate
      name rejected with a clear message in the modal.
- [ ] Objetivos: same list + add-modal + row Editar/Excluir-confirm pattern
      (name + target money, `tabular-nums`); empty state when none.
- [ ] Range: a summary row ("Jan/25 → Ago/28", or a placeholder when unset) +
      one **Editar** button opening a modal with the two month+year selectors;
      Fim-before-Início rejected in the modal; persists and reloads.
- [ ] Meta mensal: a summary row showing the saved value + one **Editar**
      button opening a modal with the `MoneyInput`; persists and reloads.
- [ ] All rectangular surfaces render at `--radius-0` (fully square) app-wide;
      only the avatar/status dots stay rounded. No `border-radius` above 0 on
      cards, buttons, inputs, selects, or swatches.
- [ ] Button variants have intentional, variant-aware borders and real
      hover/active/disabled states; ghost is not solid-bordered.
- [ ] Modals: open/close via the trigger, backdrop click, and `Esc`; focus is
      trapped and returns to the trigger on close; a visible focus ring on
      every control; respects `prefers-reduced-motion`.
- [ ] `npm run lint`, `npm run test`, `npm run build` all green.
- [ ] No hardcoded color/space/radius/shadow/duration — tokens only. Works in
      both light and dark themes.

## Definition of Done
- [ ] Persistence setup fixed durably: config fallback aligned with the runtime
      client, a `db:setup` script that applies the migration, the setup step
      documented, and the `GET` handlers no longer 500 on a DB error (they
      return the standard `{ error }` envelope). `/configuracoes` works end to
      end with no manual `.env` fiddling on a fresh checkout.
- [ ] Update (`PUT`) endpoints for **people** and **goals** — thin `route.ts`
      + `service.ts`, Zod-validated, mapping `P2025`→404 (and `P2002`→409 for
      people), a repository `update` method on each interface + Prisma impl,
      with colocated service tests.
- [ ] A reusable **Modal** primitive (`src/components/Modal`) + a thin
      **ConfirmDialog** wrapper + a compact **IconButton**, all following the
      three-file structure, the angular tokens, and the accessibility rules
      (focus trap, `Esc`, backdrop, ≥44px hit targets, focus ring).
- [ ] All four sections reworked to the list/summary + modal-CRUD pattern
      above, each still under the 100-line file cap, tokens-only, both themes.

## Tasks
- [x] tasks/01-fix-persistence-setup.md — fix the 500: config fallback, `db:setup` script, apply migration, harden GET error handling, document setup
- [x] tasks/02-ds-angular-pass.md — flatten all primitives + SectionCard to `--radius-0`, rework Button borders/states, add `IconButton`
- [x] tasks/03-modal-primitive.md — build `Modal` (native `<dialog>`) + `ConfirmDialog` shared components
- [x] tasks/04-people-goals-update-endpoints.md — add `PUT` update endpoints + repo `update` methods for people and goals, with service tests
- [ ] tasks/05-people-section-crud-modals.md — rework Pessoas into list + add-modal + per-row edit/delete-confirm modals
- [ ] tasks/06-goals-section-crud-modals.md — rework Objetivos into list + add-modal + per-row edit/delete-confirm modals
- [ ] tasks/07-range-meta-summary-edit-modal.md — rework Range + Meta mensal into a summary row + Editar modal
