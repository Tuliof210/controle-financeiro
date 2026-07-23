# Rework Range + Meta mensal — summary row + Editar modal

## Description
Range and Meta mensal are **singletons** (one global value each, stored in the
`Settings` row), not collections — so they don't get Add/Delete. Instead, each
becomes a read-only **summary row** showing the saved value, with a single
**Editar** button that opens a **modal** containing the editor. This makes the
whole settings screen edit-via-modal consistent. `settings` already has a `PUT`
endpoint — **no new API work**.

## When to run
- Depends on: 01 (working DB), 02 (angular Button/primitives), 03 (Modal)
- Parallel-safe with: 05, 06

## How-to
Current code (read first):
`src/app/configuracoes/_components/SettingsScreen/components/RangeSection/` and
`.../MonthlyGoalSection/`. RangeSection has a `touched`/`saved`/`savedRangeStart/
End` state machine driving two `MonthPicker`s + a `formatYyyymm` summary +
"Salvar"; `range.helper.ts` has `formatYyyymm` (with a `range.helper.test.ts`).
MonthlyGoalSection has a `MoneyInput` + `loaded` guard + "Salvar"/"Salvo".

Consume `@/components/Modal`. Keep the existing fetch/PUT logic and the subtle
guards already in these hooks (Range's `touched`/auto-seed handling, Meta's
`loaded`-before-save guard) — you're **moving the existing editors into a
modal**, not rewriting their persistence logic.

**Range (`RangeSection`):**
- **Summary row**: the current saved range rendered via `formatYyyymm`
  ("Jan/25 → Ago/28"), or a clear placeholder ("Nenhum período definido" / "—")
  when unset — reuse the existing saved-snapshot state (`savedRangeStart/End`) so
  the placeholder shows correctly on a fresh install. Beside it, an **Editar**
  Button.
- **Edit modal**: the two `MonthPicker`s (Início / Fim) + inline validation
  (keep "Fim não pode ser antes do Início") + a **Salvar** that PUTs and, on
  success, updates the saved snapshot and closes the modal. The auto-seed/
  `touched` guard from PR #15 still applies inside the modal (a `MonthPicker`
  self-seeds to the current month on `null`) — Salvar must not persist an
  untouched auto-seed; carry that logic in.
- Keep `range.helper.ts` + its test.

**Meta mensal (`MonthlyGoalSection`):**
- **Summary row**: the saved monthly goal formatted as `R$ x,xx`
  (`tabular-nums`), or a placeholder when unset/zero. Beside it, an **Editar**
  Button.
- **Edit modal**: the `MoneyInput` + a **Salvar** that PUTs and closes on
  success (keep the `loaded`-before-enable guard and the `result.error` check so
  a failed save doesn't falsely show success).

**Structure:** the modal body (pickers / money field + Salvar) is section-
specific, so it can stay inline in each section's `index.tsx`/`hook.ts` — no
shared form-extraction needed (unlike 05/06). Mind the **100-line cap**; if a
hook overflows once modal state is added, extract a `*.helper.ts`.

**Do NOT:** add Add/Delete to these sections; change the settings schema or the
`PUT` endpoint; convert them to a collection. No new dependency.

**Verification:**
- Run `npm run db:setup` in the worktree first (needs task 01).
- `npm run lint`, `npm run test` (existing `range.helper.test.ts` still passes),
  `npm run build` all green.
- Browser preview `/configuracoes`, both themes: each section shows a summary
  row + Editar. Range: Editar opens the pickers modal; Fim-before-Início rejected
  inside; a fresh/unset range shows the placeholder and Salvar stays disabled
  until a real pick; saving updates the summary and survives reload. Meta mensal:
  Editar opens the money modal; saving updates the summary and survives reload.
  Modals close on `Esc`/backdrop; focus returns to trigger; focus rings present.
  Confirm via screenshots + `read_network_requests` (PUT 2xx).
