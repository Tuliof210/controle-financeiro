# Movements screen (single-month CRUD)

## Description
Implement the **Movimentações** screen at `/movimentacoes` (today a bare
`<h1>` stub). It mirrors the Recorrências screen's logic and UI almost exactly,
with **one structural difference**: a movement belongs to a **single month**
(one `YYYYMM` int), not a range/set of months. The user registers the total of
each entry (entrada) and each exit (saída), separated by owner — same two
sections, same per-owner filtering (the header profile selector), same
add/edit/delete-in-a-modal flow as Recorrências.

Scope decisions (confirmed with the owner):
- **Month is chosen inside the add/edit modal** (like Recorrências picks its
  period in the modal) — there is **no** top-level month selector scoping the
  screen. The two sections list all movements, filtered only by owner.
- The month **select is bounded to the global period** (Settings
  `rangeStart`/`rangeEnd`), and the form is **guarded** (shows "defina o período
  global") when no period is set — identical to Recorrências.
- **CRUD only.** No expected-vs-actual delta against recurrences here — that
  belongs to the later dashboard story.

A movement is the "actual entry" counterpart to a recurrence's "expected entry"
(see `.squad/PRODUCT.md`), but this story ships only the standalone CRUD screen.

Code identifiers are English (`Movement`, `/api/movements`); the user-facing
route stays `/movimentacoes`, consistent with the repo's English-code /
Portuguese-UI split. `Movement`/`movements` is confirmed free of collisions.

## Acceptance Criteria
- [ ] `/movimentacoes` renders a working screen mirroring `/recorrencias`: an
      "Entradas" section (green tone) and a "Saídas" section (red tone), each
      listing the movements of that type for the **active profile** (owner
      filter via the header profile selector; "familia" shows everyone).
- [ ] Adding/editing opens a **modal** with: Nome (TextField), Valor
      (MoneyInput), an Entrada/Saída type toggle (green/red selected), a
      Responsável owner `<select>`, and a **single Mês `<select>` bounded to the
      global period** (options labeled e.g. "Ago/26"). When no global period is
      set, the modal shows the "Defina o período global em Configurações" guard
      instead of the month select and Save is disabled.
- [ ] A movement persists exactly **one** month (`YYYYMM`). Each list row shows
      the owner swatch + name, the value colored by type (income green / expense
      red), and the month formatted as "Ago/26".
- [ ] Delete goes through the ConfirmDialog and removes the movement.
- [ ] Deleting a **person who still has movements** returns HTTP **409** (not a
      500) with a message that is not recorrências-specific.
- [ ] `npm run db:setup` applies the new `add_movements` migration idempotently.

## Definition of Done
- [ ] `npm run lint`, `npm run test`, and `npm run build` all green.
- [ ] `npm run db:setup` applies the `Movement` migration.
- [ ] Both tasks merged (each as its own PR).

## Tasks
- [x] tasks/01-movements-backend.md — Movement model + migration + entity/repository + /api/movements, and generalize the people-delete conflict message
- [ ] tasks/02-movements-screen.md — MovementsScreen + modal form with a bounded single-month select, row, section, and the /movimentacoes page
