# Guard the half-to-half gap and the control pair

## Outcome
- `e2e/row-columns.spec.ts` asserts a **floor** on the gap between the data half
  and the controls, not only a ceiling — a row that lost every gutter goes red.
- It asserts the two icon buttons stay on one line and keep their 8px gap.
- `npm run test` green.

## Context
This story's two riskiest regressions are both invisible to the suite as it
stands, which is why they get a guard instead of a comment.

- The only gutter assertion today, in `e2e/row-columns.spec.ts`, is a ceiling
  and only runs for `list.bare`:
  `if (list.bare) expect(cells.edit.x - (cells.name.x + cells.name.width)).toBeLessThan(GUTTER + 1);`
  Collapse every gutter to 0 and it passes harder than before.
- The pair's `display: flex` + `gap` live in exactly one CSS rule and there is
  no `.actions` class anywhere to fall back to, so a mis-rooted selector leaves
  two 44px buttons separated by a whitespace character and free to wrap onto two
  lines. `e2e/row-overflow.spec.ts` only checks the buttons stay inside the
  `<li>`'s box — a taller row with a wrapped pair still passes.
- **Reuse** what `e2e/row.helper.ts` already exports, verbatim:
  ```ts
  export const GUTTER = 12;
  export const overlaps = (a: { y: number; height: number }, b: typeof a) =>
    a.y < b.y + b.height && b.y < a.y + a.height;
  export async function openRow(page: Page, list: (typeof LISTS)[number], name: string)
  ```
  `openRow` returns `{ name, value, valueRight, edit }`. The delete button's box
  is not returned yet — extend the return rather than re-querying in the spec,
  and follow its own locator idiom:
  `row.getByRole("button", { name: \`Editar ${name}\` })`, so the sibling is
  `\`Excluir ${name}\``.
- `overlaps` is how "same line" is already expressed in this suite — reuse it
  for the pair instead of comparing `y` directly.
- The pair gap is `var(--space-2)` = 8px (`src/styles/_tokens.scss`). Assert the
  measured value, do not re-derive the token in the spec.
- IconButtons are fixed 44px squares, so `boundingBox()` is honest for them —
  the `Range`-over-contents trick in `textRight` exists for stretched **text**
  cells and is not needed here.
- The spec runs its alignment cases at `WIDE = 1440` and `NARROW = 375`; add the
  guard where both widths exercise it, since the gutter has a different owner in
  each mode (task 01 for one-line, task 02 for stacked).
- **Verify the guard can fail**: temporarily remove the controls wrapper's `gap`
  (and separately its leading gutter), confirm red, then restore. A guard that
  was never seen red is not a guard.
- `e2e/row-columns.spec.ts` is 74 lines and `row.helper.ts` 77 — Biome's
  100-line cap **does** apply to `.ts`, unlike `.scss`. `wc -l` both.
- Do not leave a manual `next dev` running from the repo root — Next 16 refuses
  a second dev server from the same directory and `npm run test` boots its own
  on :3100 against a throwaway `e2e.db`.

## Scope
- In: `e2e/row-columns.spec.ts`, `e2e/row.helper.ts`.
- Out: `src/` entirely — if a guard goes red, the fix belongs in task 01's or
  task 02's files and this task is done when it is honestly green, not when it
  is loosened; `e2e/seed.helper.ts` and `e2e/row-overflow.spec.ts`;
  `e2e/ofx-import.spec.ts` (touches no rows).

## Verify
- `npm run lint`
- `npx playwright test row-columns.spec.ts` — green, and shown red once with the
  gap deliberately removed before restoring.
- `npm run test`
- `wc -l e2e/row-columns.spec.ts e2e/row.helper.ts`

## Forbidden
- Loosening or deleting an existing assertion to make room for the new ones.
- Selecting by `data-cell`, class name or child combinator — every locator in
  this suite is role/text based and stays that way, so the specs survive the
  next structural change too.
- Asserting a hand-measured pixel width of a wrapper or a cell; the guards are
  about the gap and the line, both derived from what the page actually renders.
- Adding a unit test runner or a component-level test — e2e is the only runner.
