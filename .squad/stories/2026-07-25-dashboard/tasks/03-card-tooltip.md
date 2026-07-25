# `Tooltip` component + `hint` slot on `SectionCard`

## Description

Every dashboard card has to explain the logic behind its own number — the
reconciliation rule (`max(real, estimado)`), the suffix-minimum safe-to-spend
formula and the coverage definition are not self-evident from a figure on a
card. The owner asked for a tooltip on each card.

**No tooltip primitive exists today.** Grepping `src/` for `tooltip`,
`popover`, `role="tooltip"` and `aria-describedby` returns zero hits; the only
`title=` occurrences are the `title` **prop** of `SectionCard` / `Modal` /
`ConfirmDialog`, never the HTML attribute. So this task adds the primitive.

Two pieces:

1. **`src/components/Tooltip`** — a small info affordance: a `lucide-react`
   `Info` icon that reveals a short explanatory bubble on hover **and** on
   keyboard focus, linked to its trigger via `aria-describedby`.
2. **`hint?: string` on `SectionCard`** — the tooltip renders in the card's
   title row, next to the heading. Adding one optional prop to the existing
   shared card is far better than teaching nine dashboard cards to place their
   own tooltip, and `SectionCard` is already the container every card in this
   app uses.

Both are shared components used by tasks 04, 05 and 06, so they live in
`src/components/` from the start rather than being promoted later.

Keep it CSS-driven. Show/hide is `:hover` / `:focus-visible` / `:focus-within`
on the wrapper — no `useState`, no positioning library, no portal, no
click-outside handler. `SectionCard` has no `overflow: hidden`
(`SectionCard/style.module.scss` sets only display/gap/padding/background/
border/radius), so an absolutely-positioned bubble escapes the card fine.
Native `popover="hint"` is not broadly supported and `popover="auto"` requires
a click, so neither is a shortcut here.

## When to run

- Depends on: none
- Parallel-safe with: tasks 01 and 02 — disjoint files

## How-to

### Files

```
src/components/Tooltip/index.tsx
src/components/Tooltip/hook.ts
src/components/Tooltip/style.module.scss
```

Edited: `src/components/SectionCard/hook.ts`,
`src/components/SectionCard/index.tsx`,
`src/components/SectionCard/style.module.scss`.

The three-file folder is mandatory even though this component is small
(`.squad/ARCHITECTURE.md`): `index.tsx` blindly calls `hook.ts` and renders
what it returns — no logic, no state, no effects in `index.tsx`.

### `Tooltip`

```ts
// hook.ts
export type TooltipProps = { text: string };
export function useTooltip({ text }: TooltipProps) {
  const id = useId();
  return { text, id };
}
```

`useId()` is React's built-in and is SSR-safe — the id must be stable across
server and client render or hydration warns.

`index.tsx` renders roughly:

```tsx
<span className={styles.wrapper}>
  <button
    type="button"
    className={styles.trigger}
    aria-label="Como este número é calculado"
    aria-describedby={id}
  >
    <Info size={14} aria-hidden />
  </button>
  <span role="tooltip" id={id} className={styles.bubble}>
    {text}
  </span>
</span>
```

A `<button>`, not a `<span tabIndex={0}>` — it must be reachable by Tab, and a
button is the only element that is focusable without an explicit `tabIndex`
and announced as interactive. `aria-label` is required on it because the icon
is the only content. Do **not** reuse `IconButton`: it carries `variant`
styling and a `--space`-sized hit area meant for row actions, and it would
need overriding on every axis.

The bubble stays in the DOM at all times (`opacity`/`visibility`, not
`display: none` or conditional rendering) so `aria-describedby` always
resolves to a real element.

### `Tooltip` styling

`@use "theme" as t;` at the top — `src/styles` is on the Sass load path
(`next.config.ts` `sassOptions.loadPaths`).

- `.wrapper` — `position: relative; display: inline-flex;`
- `.trigger` — reset the button (`background: none; border: 0; padding: 0;
  cursor: help;`), `color: var(--color-text-muted)`, `&:focus-visible {
  @include t.focus-ring; }` (the established pattern in `Button`,
  `IconButton`, `MonthRangeSlider`)
- `.bubble` — `position: absolute`, `opacity: 0; visibility: hidden`,
  `transition` on `--duration-fast` with `--ease-snappy`, revealed by
  `.wrapper:hover .bubble` and `.wrapper:focus-within .bubble`. Styling:
  `background: var(--color-surface-raised)`, `border: var(--border-2) solid
  var(--color-border)`, `border-radius: var(--radius-0)`,
  `@include t.elevation(overlay)` (the DS reserves the blur shadow for
  floating layers — menu, popover, modal, toast), `z-index: var(--z-dropdown)`,
  `padding: var(--space-3)`, `font-family: var(--font-mono)`,
  `font-size: var(--text-xs)`, `line-height: var(--leading-snug)`,
  `color: var(--color-text)`, a `width` capped with `max-width` around
  `--space-24` × 3 so long explanations wrap instead of stretching.

Zero hardcoded colours, spacings, radii, shadows or durations — the full rule
set is `src/styles/README.md` and it is non-negotiable. Position the bubble so
it does not fall off the viewport when the card is in the right-hand grid
column (anchor it to the trigger's right edge, or centre it and let
`max-width` keep it inside).

Respect `prefers-reduced-motion`: the duration tokens already collapse to
`0ms` under it, so using `var(--duration-fast)` is enough — do not hardcode a
transition time.

### `SectionCard` change

```ts
export type SectionCardProps = {
  title: string;
  icon?: LucideIcon;
  tone?: "positive" | "negative";
  hint?: string;   // new — renders a Tooltip in the title row
  children: ReactNode;
};
```

Pass `hint` through `useSectionCard` and render `{hint ? <Tooltip text={hint} /> : null}`
after the `<h2>` inside the existing `.titleRow`. `.titleRow` is already a flex
row; the tooltip should sit next to the title, not pushed to the far edge, so
do not add `margin-left: auto` unless you have looked at it in the browser and
decided otherwise.

The prop is optional, so all seven existing `SectionCard` call sites
(`EntrySection`, `PeopleSection`, `GoalsSection`, `MonthlyGoalSection`,
`RangeSection`) keep compiling untouched — verify with
`npx tsc --noEmit` that none of them regressed.

### No story file

Storybook's glob is `stories: ["../src/**/*.mdx"]` (`.storybook/main.ts`) —
MDX foundations docs only. A `*.stories.tsx` would be **silently ignored**, so
do not write one.

### No component test

Vitest runs in the `node` environment with no setup file; jsdom is not
installed and `@testing-library/react` is not a dependency (the
`@testing-library/*` packages under `node_modules` are phantom transitive deps
of Storybook). Every one of the 16 existing test files targets a pure
function. `useTooltip` is a `useId()` pass-through with no branch, so there is
nothing worth extracting to a helper — say so in the PR rather than adding a
test infrastructure this story does not need.

### Verification

```bash
npm install && npm run db:setup && npm run lint && npm run test && npx tsc --noEmit && npm run build
```

Baselines on `main` (anything beyond these is yours): `npm run lint` exit 1
with exactly 2 errors, both in `.design-sync/gen-cards.mjs` (1
`assist/source/organizeImports`, 1 formatter); `npm run test` exit 0, 16 files
/ 95 tests; `npx tsc --noEmit` exit 2 with exactly 1 error in
`theme.helper.test.ts(21,22)`; `npm run build` exit 0.

Biome will enforce 100 lines per file and per function, 2-space indent, double
quotes, line width 80, and `organizeImports` as an error — there are no
`overrides` in `biome.json`.

Verify in the browser against an existing screen before the dashboard exists —
temporarily pass a `hint` to a card on `/configuracoes`, then:

- hover the icon → the bubble appears
- Tab to the icon → the bubble appears on focus too (this is the part that
  usually gets missed)
- Esc / blur → it disappears
- toggle the theme in the header → the bubble is legible in both light and
  dark (both are token-driven, so this should follow for free — confirm it)
- the bubble is not clipped by the card border and does not overflow the
  viewport from a right-column card

Remove the temporary `hint` before opening the PR. Start the dev server from
inside the worktree on a spare port — `preview_start`'s `{name}` launcher runs
from the main checkout, not from a worktree — then `preview_start` with
`{url: "http://localhost:<port>"}`.
