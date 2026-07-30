# Shared DS select skin for MonthPicker and SelectField

## Outcome
- Every `<select>` in the app (month, year, Responsável, and every other
  `SelectField` call site) shows the DS caret instead of the browser's native
  arrow, in light and dark theme.
- The select box reads as an input sitting *on* a card: background one tier
  below the surface it is placed on, 2px border, right padding that clears the
  caret.
- `/movimentacoes`, `/configuracoes` and `/previsoes` all still fit at 375px
  with no horizontal overflow, and every select still answers a 44px tap.

## Context

**The design's select rule** (design `1c`, `Seletor de Vigência.dc.html`),
verbatim from the source, is the target:
```
appearance:none;width:100%;height:46px;background:var(--c-bg);
border:var(--border-2) solid var(--c-border);border-radius:var(--radius-sm);
padding:0 var(--space-6) 0 var(--space-3);font-size:var(--text-base);cursor:pointer
```
plus a caret drawn as an absolutely positioned chevron at `right:var(--space-3)`
in `--c-muted`. The design's `--c-*` aliases map to this repo as:
`--c-bg`→`--color-bg`, `--c-surface`→`--color-surface`,
`--c-raised`→`--color-surface-raised`, `--c-text`→`--color-text`,
`--c-muted`→`--color-text-muted`, `--c-border`→`--color-border`,
`--c-line`→`--color-border-subtle`, `--c-brand`→`--color-brand`.
Note `--color-line` does **not** exist here; subtle rules use
`--color-border-subtle`.

**Imitate** `src/components/SelectField/style.module.scss` — its `.select`
block is byte-for-byte duplicated in `src/components/MonthPicker/style.module.scss`
today, which is why both change together:
```scss
.select {
  min-height: 44px;
  padding: var(--space-2) var(--space-3);
  background: var(--color-surface);
  border: var(--border-2) solid var(--color-border);
  border-radius: var(--radius-sm);
  color: var(--color-text);
  font-family: var(--font-mono);
  font-size: var(--text-base);

  &:focus-visible {
    @include t.focus-ring;
  }
}
```

**Reuse** the shared-style-partial precedent
`src/styles/_swatch-colors.scss` — a partial in `src/styles/` consumed by two
unrelated components (`ColorPicker`, `PeopleSection`). A new
`src/styles/_select.scss` holding one mixin follows it, resolves through the
`src/styles` Sass load path, and keeps the skin in one place. Emit no CSS of its
own (mixin only), same as the `_*.scss` partial exception in ARCHITECTURE.md.

**Do not duplicate markup.** Two components need the caret; adding a wrapper
`<div>` + a lucide `<ChevronDown>` to each duplicates JSX in two files and would
then owe a shared component. Prefer a CSS-only caret whose colour is a token —
`mask-image` with an inline `data:image/svg+xml` chevron plus
`background-color: var(--color-text-muted)` gives a themeable caret with zero
markup change. A `background-image` data URI would hardcode the stroke colour
and cannot follow the theme, so it is not acceptable. Verify the caret actually
paints in both themes before calling this done.

**Watch out for:**
- Turbopack never resolves a Sass partial created while `next dev` is running —
  `touch src/styles/_select.scss` after creating it, or the build fails on
  `@use "select"` even though `npx sass` compiles fine.
- The design's 46px height replaces a `min-height: 44px`. 46 clears the 44px
  floor, but the +8px of right padding (`--space-6` vs `--space-3`) narrows the
  usable text area; `MonthPicker` puts two selects side by side inside a modal,
  so 375px is the case that can overflow. Measure it, don't assume.
- `MonthPicker`'s label is a `<span>`, not a `<label>` — accessible names come
  from `aria-label` on each select (`Início - mês`, `Fim - ano`, …). Do not
  touch that markup; `e2e/interval-lock.spec.ts` locates by those names.
- `npm run lint:fix` rewrites files outside this task — `git checkout --` the
  unrelated churn before committing.

## Scope
- In: `src/styles/_select.scss` (new), `src/components/SelectField/style.module.scss`,
  `src/components/MonthPicker/style.module.scss`, and `MonthPicker`'s
  `.selects`/`.field` layout if the caret padding forces it.
- Out: `MonthPicker/hook.ts`, `MonthPicker/index.tsx`, `SelectField/hook.ts`,
  `SelectField/index.tsx` (no markup change), `TextField`, `MoneyInput`,
  `src/styles/_tokens.scss` (no new token needed), anything under
  `src/app/previsoes/`.

## Verify
```bash
npm run lint
npm run test
```
`npm run test` is the regression gate here: `row-overflow.spec.ts`,
`row-columns.spec.ts` and `row-hit-target.spec.ts` measure real geometry on
`/movimentacoes` and `/configuracoes`, the two screens this task changes without
being asked to.

Then in the browser pane, at 375px and 1280px, in light and dark:
- `/previsoes` → open `Nova previsão` → confirm the caret renders and the two
  month selects fit side by side.
- `/movimentacoes` → open the form → same check.
Measure the rendered select height and the computed caret colour with
`javascript_tool` (`getComputedStyle`) rather than eyeballing; reading state in
the same call as a change returns the pre-change value, so read in a second call.

## Forbidden
- No new token in `src/styles/_tokens.scss`; every value comes from an existing
  one (rule 1 of `src/styles/README.md`).
- No hardcoded colour inside the caret asset — the chevron's colour must be a
  `var(--color-*)`.
- No radius above `--radius-lg`, no hard offset shadow (reserved for the primary
  action and the modal panel).
- Do not change any `aria-label`, `id`, or option `value` on the selects.
- Do not add a `data-testid`; this repo has none and locates by role/name.
