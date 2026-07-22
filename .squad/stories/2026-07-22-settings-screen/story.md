# Settings screen (Configurações)

## Description
Build the app's **Configurações** screen — the first feature with real
persistence and the first real Design System components. Today the route
(`src/app/configuracoes/page.tsx`) is a bare `<h1>`, there are no Prisma
models, no migrations, no DB file, no `src/core` / `src/infra` / `src/lib`
layers, no Zod, and no DS components (foundations/tokens only).

The screen lets the household configure four things, each persisted to the
local SQLite DB via Route Handlers:

- **Pessoas** — a list of people (name + a color from the DS palette). Every
  future real/expected entry will be tied to a person. CRUD: add, list,
  delete.
- **Range** — the global window of months the system "looks at" (e.g. Jan/25
  → Ago/28), chosen with custom month+year selectors. One global setting for
  the whole household. Used later to bound a slider when registering expected
  recurring entries.
- **Meta mensal** — the ideal monthly amount to save, a single global money
  value. Used later in charts.
- **Objetivos** — a list of long-term goals (name + target money value).
  Used later to compute progress from the mean/stddev of balances. CRUD: add,
  list, delete.

**Design must not be simplório** — it leans hard on the DS foundations
(angular/contained surfaces, vivid accents on extreme neutrals, pixel display
face for eyebrows, mono + `tabular-nums` for every number), with real empty
states, focus rings, and reduced-motion respected.

**Money inputs work in integer cents.** Display masks with a comma decimal
separator and left-pads with zeros (`0` → `0,00`, `5` → `0,05`, `12345` →
`123,45`). Typing and paste accept **only digits 0–9**; the comma and the
zero-padding come purely from the mask. This behavior lives in one shared
`MoneyInput` component reused by Meta mensal and Objetivos (and every future
money field).

## Product decisions (from refinement)
- **Objetivo** fields: name + target value (cents). No deadline/description yet.
- **Pessoa** fields: name (unique, required) + color (a key from a fixed DS palette).
- **Range** and **Meta mensal** are **global** (single-row `Settings`), not per-person.
- **Range UI**: custom month+year selectors built in DS style (not native
  `<input type="month">`, not a slider — the slider is reserved for future
  recurring-entry registration).

## Acceptance Criteria
- [ ] `/configuracoes` renders four DS-styled sections: Pessoas, Range, Meta mensal, Objetivos.
- [ ] Pessoas: add (name + color), list (name + color swatch), delete; empty state when none. Duplicate name is rejected with a clear message.
- [ ] Range: two custom month+year selectors (Início / Fim) with a readable "Jan/25 → Ago/28" summary; saving with Fim before Início is rejected. Persists and reloads.
- [ ] Meta mensal: a `MoneyInput` (cents, `,` mask, zero-pad, digits-only typing/paste) with an `R$` adornment; persists and reloads.
- [ ] Objetivos: add (name + target money), list (name + target, `tabular-nums`), delete; empty state when none.
- [ ] All money typing/paste accepts only 0–9; everything else is mask/pad. Verified by a unit test on the format/parse helpers.
- [ ] Every value survives a page reload (persisted in SQLite).
- [ ] `npm run lint`, `npm run test`, and `npm run build` are all green.
- [ ] No hardcoded color/space/radius/shadow/duration — tokens only. Every interactive element has a visible focus ring. Works in both light and dark themes.

## Definition of Done
- [ ] Prisma models (`Person`, `Goal`, `Settings`), a committed migration, and a generated client that `next build` can consume (`prisma generate` wired into the build/postinstall path).
- [ ] Clean-architecture data layer per `.squad/ARCHITECTURE.md`: `core/entities` types, `core/repositories` interfaces, `infra/repositories` Prisma implementations, one Prisma client singleton.
- [ ] Route Handlers for `people`, `goals`, `settings` following the thin-`route.ts` + `service.ts` split, Zod-validated at the boundary, returning the shared `{ data }` / `{ error: { message, code } }` envelope, with colocated service tests.
- [ ] Shared DS components under `src/components/`: `MoneyInput`, plus the form primitives the screen needs (`Button`, `TextField`, `MonthPicker`, `ColorPicker`).
- [ ] The screen wired end-to-end against the APIs, all files under the 100-line cap.

## Tasks
- [x] tasks/01-persistence-spine.md — Prisma models + migration + client singleton + core entities/repositories + infra Prisma impls + Zod dep
- [x] tasks/02-settings-api.md — Route Handlers + services + Zod + tests for people, goals, settings (shared HTTP envelope helper)
- [x] tasks/03-money-input.md — shared `MoneyInput` cents-masked component (digits-only, `,` mask, zero-pad) + helper test
- [x] tasks/04-form-primitives.md — shared DS primitives: `Button`, `TextField`, `MonthPicker` (mês+ano), `ColorPicker`
- [ ] tasks/05-settings-screen.md — the `/configuracoes` page + four sections wired to the APIs, composing the primitives
