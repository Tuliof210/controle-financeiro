# Semantic entrada/saída colors (toggle, labels, list values)

## Description
The Entrada/Saída type toggle renders both types identically: the selected one
is always `--color-brand` (violet, Button `primary`) and the unselected one is
`ghost`, regardless of income vs expense. The recurrence list amounts render in
neutral `--color-text`, and the "Entradas"/"Saídas" section labels are neutral
too.

Give the two types a distinct, semantic color:
- **income ("Entrada") → `--color-positive`** (green)
- **expense ("Saída") → `--color-negative`** (red)

Applied to: the toggle buttons (colored when selected), the "Entradas"/"Saídas"
section labels, and the amount value of each row in the list.

Both tokens already exist for light + dark + `prefers-color-scheme` in
`src/styles/_tokens.scss:53-54, 81-82, 102-103` and are covered by the parity
test `src/styles/tokens.test.ts:28-29`. **Reuse them — add no new token**
(adding one would require updating `REQUIRED_SEMANTIC_COLORS` or the test
fails). Precedent for this exact mapping: `src/styles/docs/Colors.mdx:67-68`
(`+R$` green / `−R$` red).

## When to run
- Depends on: none
- Parallel-safe with: 01. **NOT parallel-safe with 03** — both edit
  `RecurrenceForm/index.tsx` (this task the toggle block, 03 the slider block)
  and `RecurrenceRow/*` (this task the value color, 03 the period display).
  Land this one **before** 03 (it's the smaller diff), or expect a merge
  conflict in those two files.

## How-to
The `Button` component only has `primary | ghost | danger` variants today; the
red one (`danger`) already maps to `--color-negative`, but there is **no green
variant**. Add one, then use both on the toggle.

1. **New Button variant** — `src/components/Button/`:
   - `hook.ts:4` — extend the variant union with `"success"` (or `"positive"`;
     pick one name and use it consistently).
   - `style.module.scss` — add a `.success` (or `.positive`) rule mirroring the
     existing `.danger` block (`:48-60`) but using `--color-positive`. Match
     `.danger`'s hover/text-color treatment so it reads as a peer variant.
   - Keep `Button` files under the 100-line cap.

2. **Toggle buttons** — `RecurrenceForm/index.tsx:47-57`:
   The loop over `RECURRENCE_TYPES` renders
   `<Button variant={type === kind ? "primary" : "ghost"}>`. Change the
   selected variant to depend on the type:
   - selected `income` → `success`/`positive`
   - selected `expense` → `danger`
   - unselected (either) → `ghost` (unchanged)
   Keep the file under 100 lines (it's a tiny change).

3. **Section labels** — `RecurrencesScreen/index.tsx` renders the "Entradas" /
   "Saídas" section headings. Give the Entradas heading `--color-positive` and
   the Saídas heading `--color-negative`. Prefer a modifier class in the
   relevant `style.module.scss` consuming `var(--color-positive|negative)` via
   `@use "theme" as t;` — do not hardcode a hex. (If the two sections are one
   reused sub-component, pass the type/color down rather than duplicating.)

4. **List amount values** — `RecurrenceRow/`:
   `style.module.scss` has `.value { color: var(--color-text) }`. Add
   type-conditioned color: income rows → `--color-positive`, expense rows →
   `--color-negative`. Add a modifier class (e.g. `.income`/`.expense`) applied
   in `RecurrenceRow/index.tsx` based on the recurrence `type`
   (`"income"`/`"expense"`, from `src/lib/recurrence-types.ts`). Do **not** use
   an inline `style={{color}}` for anything that also has a `:hover`/pseudo rule
   on the same property — the inline style silently wins over the pseudo-class
   (known project gotcha); use a class.

Exact type literals: `"income"` / `"expense"` (union at
`src/core/entities/recurrence.entity.ts:5`, UI labels
`RecurrenceForm/index.tsx:11` = `{ income: "Entrada", expense: "Saída" }`).

Styling rules (non-negotiable, see `src/styles/README.md`): `.module.scss`
files consume tokens via `@use "theme" as t;` + `var(--token-name)` — never
hardcode a color.

Testing / verification:
- No new unit test required (pure styling; token parity already guarded by
  `tokens.test.ts`).
- Manual smoke test: `npm run dev`, open Recorrências.
  1. Toggle Entrada → button turns green; toggle Saída → button turns red;
     unselected stays ghost.
  2. Add one income and one expense recurrence → list amounts show green vs red;
     section headings colored.
  3. Toggle dark mode (header theme switch) → colors remain correct and legible
     in dark.

Verification commands (repo root):
```
npm run lint
npm run test
npm run build
```
All three must be green.
