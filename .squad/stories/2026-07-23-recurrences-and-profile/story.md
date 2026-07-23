# Recurrences registration screen + header profile selector

## Description
Add a **Recurrences** feature: recurring planned income and expenses (the
"expected entries" concept in PRODUCT.md), registrable per family member. This
fills the already-stubbed `/recorrencias` route (nav item already exists).

A recurrence has: **name**, **value** (monthly amount, stored in cents),
**type** (income "entrada" or expense "saída"), **owner** (a Person), and its
own **active month sub-period** (start→end, `YYYYMM`) chosen with a two-thumb
range slider bounded by the global period configured in Settings
(`Settings.rangeStart`/`rangeEnd`). Example: a salary that recurs Ago/26→Dez/26.

The screen shows **two separate lists** — Entradas (income) and Saídas
(expenses). Each item is a row with edit/delete actions. Add/Edit/Delete are
done through modals (reusing the existing `Modal` + `ConfirmDialog` +
`PeopleSection` CRUD pattern).

Separately, add a **profile selector to the header**, next to the dark-mode
toggle. Options: **Família** (see everyone) or each individual Person. The
selection (1) adapts the greeting (e.g. "Boa tarde, Ana" / "Boa tarde,
Família") and (2) filters the Entradas/Saídas lists to the selected person's
recurrences (Família shows all). The selection is shared client state — this
introduces the project's first React Context provider, mounted in `AppShell`
and seeded from `localStorage` (mirroring how `ThemeToggle` persists).

## Acceptance Criteria
- [ ] `GET/POST/PUT/DELETE /api/recurrences` exist, validated with Zod, using the
      `{ data } / { error: { message, code } }` envelope and Prisma error-code
      mapping (`P2025`→404) exactly like `/api/people` and `/api/goals`.
- [ ] A `Recurrence` Prisma model + migration exist with fields
      `{ id, name, valueCents, type, ownerId (→ Person), rangeStart, rangeEnd,
      createdAt }`; `Person` gains the back-relation. `npm run db:setup` applies
      cleanly.
- [ ] `/recorrencias` renders two lists (Entradas, Saídas). Each row shows the
      owner (color swatch + name), the recurrence name, the value as
      `R$ x.xxx,xx`, and the month sub-period label (e.g. `Ago/26 → Dez/26`),
      plus edit and delete icon buttons.
- [ ] Adding/editing a recurrence opens a modal with: name (TextField), value
      (MoneyInput), owner (a person `<select>`), type (fixed by which list's
      "Adicionar" was clicked, or a toggle in the form), and a two-thumb month
      range slider bounded by the global Settings period. Deleting confirms via
      `ConfirmDialog`. All persist and refetch on success; errors surface inline.
- [ ] The header shows a profile `<select>` immediately left of the theme
      toggle. Selecting "Família" or a person updates the greeting AND filters
      both lists. The choice persists across reloads (`localStorage`).
- [ ] When no global period is set in Settings, the recurrence form explains it
      and blocks submission (the slider needs bounds) — it does not crash.

## Definition of Done
- [ ] `npm run lint` clean (Biome, incl. the 100-line file AND function caps).
- [ ] `npm test` passes (new `service.test.ts` for the recurrences API + any
      new pure helper has a colocated `*.test.ts`).
- [ ] `npm run build` succeeds.
- [ ] Every new component follows the 3-file pattern (`index.tsx` JSX-only /
      `hook.ts` logic / `style.module.scss`) and every token is a `var(--*)`.

## Tasks
- [x] tasks/01-recurrence-data-layer-and-api.md — Prisma model + migration, entity, repository, `/api/recurrences` CRUD (backend only)
- [ ] tasks/02-profile-context-and-header-selector.md — first Context provider in AppShell, header profile `<select>`, greeting adapts
- [ ] tasks/03-recurrences-screen.md — `/recorrencias` two lists + CRUD modals + person select + month-range slider + profile filter (depends on 01 & 02)
