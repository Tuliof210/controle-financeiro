# Primitives — restyle Button, IconButton, Modal, SectionCard, the inputs and Tooltip

## Description
Ten shared components carry the new look into every screen. Restyling them is
one coherent PR rather than five, because they ripple: `SectionCard` alone has
**13 import sites across all five screens**, `Button` has 13, `Modal` has 6.
Splitting them would mean a half-redesigned app between merges.

Two shape changes ride along, and they are the only non-cosmetic edits here:
- **`Button` gains a `dashed` variant.** The design's "Adicionar entrada",
  "Adicionar saída", "Nova recorrência", "Adicionar pessoa" and "Adicionar
  objetivo" are all the same full-width dashed-outline button that fills on
  hover. Five call sites in three later tasks — that belongs in `Button`, not
  copy-pasted into each screen.
- **`Modal` gains an `eyebrow` prop** and its close control becomes a real
  `IconButton`, retiring the literal `✕` inside a ghost `Button` that already
  carries a `// ponytail: … swap for IconButton` note.

Everything else is paint: radii move from `--radius-0` up one step, cards get
display-font eyebrows, the primary button gets the hard offset shadow task 01
tokenised.

**Modal forms are not restructured.** The design shows a `Cancelar` + CTA
footer on every modal; building it means moving the submit out of five form
bodies, two of which sit within six lines of the 100-line cap. Decided out
during refinement — say so in the PR body as a deliberate deviation.

## When to run
- Depends on: 01-foundations.md (consumes `--elevation-press`,
  `--elevation-press-active`, `--elevation-panel`). Run after it merges and
  `git fetch origin main` first.
- Parallel-safe with: 02-shell.md. That task touches `AppShell/**`, a new
  `PageHeader/`, and the five screens' `index.tsx`; this one touches only the
  ten primitive folders below. No file overlaps.

## How-to

### Files
```
src/components/Button/       index.tsx | hook.ts | style.module.scss
src/components/IconButton/   style.module.scss
src/components/Modal/        index.tsx | hook.ts | style.module.scss
src/components/SectionCard/  index.tsx | style.module.scss
src/components/TextField/    style.module.scss
src/components/SelectField/  style.module.scss
src/components/MoneyInput/   style.module.scss
src/components/MonthPicker/  style.module.scss
src/components/ColorPicker/  style.module.scss
src/components/Tooltip/      style.module.scss
```
Nine of the ten are style-only. `Button` and `Modal` are the two with a prop
change; `SectionCard/index.tsx` changes only because the title element gets a
new class.

### 1. `Button`
Today: `min-height: 44px`, `padding: var(--space-2) var(--space-4)`,
`border: var(--border-2) solid transparent`, `border-radius: var(--radius-0)`,
mono `--text-base`, hover `filter: brightness(0.92)`, active `0.84`, no shadow.
Variants `primary | ghost | danger | success`.

Changes:
```scss
.button {
  border-radius: var(--radius-sm);
  border-color: var(--color-border);   // the frame is now always visible
  font-weight: var(--weight-bold);
}

.primary {
  background: var(--color-brand);
  color: var(--white);
  @include t.elevation(press);

  &:active:not(:disabled) {
    transform: translate(2px, 2px);
    @include t.elevation(press-active);
  }
}
```
The 2px displacement plus the shortened shadow is what makes the press read as
physical — ship both or neither. Keep the existing `filter: brightness()`
hover; it composes fine with the shadow.

`danger` and `success` keep their fills and get the same border treatment, but
**no press shadow** — README rule 3, as amended in task 01, scopes the hard
shadow to the primary action. `ghost` is unchanged apart from the radius.

**New `dashed` variant** — add `"dashed"` to the variant union in `hook.ts`:
```scss
.dashed {
  justify-content: center;
  width: 100%;
  background: transparent;
  color: var(--color-text);
  border: var(--border-2) dashed var(--color-border);

  &:hover:not(:disabled) {
    background: var(--color-brand);
    color: var(--white);
    border-style: solid;
    filter: none;   // the fill IS the hover; brightness on top muddies it
  }
}
```
Consumers that need the negative-tinted hover (the "Adicionar saída" button in
task 06) compose it at the call site with an extra class — **do not** add a
`dashed-danger` variant for one use.

Disabled stays as today: raised fill, subtle border, muted text — not opacity.
And it must beat the new shadow: add `box-shadow: var(--elevation-flat)` to the
`:disabled` block, or a disabled primary keeps casting a shadow it cannot act
on.

### 2. `IconButton`
Style-only. Keep 44×44 and the required `aria-label`. Change
`border-radius` to `--radius-sm` and let the `danger` variant pick up the
design's hover: `background: var(--color-negative); color: var(--white);
border-color: var(--color-negative)` — the quiet resting state (red icon on a
transparent surface) stays exactly as it is.

### 3. `Modal`
Keep the native `<dialog>` + `showModal()` entirely. Three invariants that a
restyle can silently kill, all documented in the file already:
- `hook.ts` detects a backdrop click with `e.target === ref.current`. **The
  `<dialog>` must stay the backdrop and `.panel` must stay a strictly inner
  box.** Moving padding or background onto the `<dialog>` itself makes every
  content click close the modal.
- The `biome-ignore lint/a11y/useKeyWithClickEvents` on that handler is
  justified by `<dialog>`'s native Esc. Changing the element turns the
  suppression into a real bug.
- `::backdrop` is styled here and inherited by `ConfirmDialog`.

Style changes:
```scss
.dialog {
  border-radius: var(--radius-md);
  @include t.elevation(panel);   // 8px 8px 0 — the design's signature
}
```
Header becomes sticky with the eyebrow above the title:
```tsx
<header className={styles.header}>
  <div>
    {eyebrow ? <p className={styles.eyebrow}>{eyebrow}</p> : null}
    <h2 className={styles.title}>{title}</h2>
  </div>
  <IconButton aria-label="Fechar" onClick={onClose}><X size={16} /></IconButton>
</header>
```
```scss
.header {
  position: sticky; top: 0;
  display: flex; align-items: flex-start; justify-content: space-between;
  gap: var(--space-4);
  padding: var(--space-6);
  background: var(--color-surface-raised);   // must match .panel, or the
  border-bottom: var(--border-2) solid var(--color-border);  // body shows through
}
.eyebrow {
  margin: 0 0 var(--space-3);
  color: var(--color-brand);
  font-family: var(--font-display);
  font-size: var(--text-2xs);
  letter-spacing: var(--tracking-wide);
}
```
`eyebrow` is an **optional** prop — `ConfirmDialog` does not pass one and must
keep working. `X` comes from `lucide-react`; the `IconButton`'s hover already
turns red via the `danger` variant, which is the design's behaviour.

The `title` keeps `--font-display` at `--text-lg` (existing) — the design draws
`--text-md`, but `_base.scss` and every other title in the app are at `lg`;
consistency wins over a 4px difference.

### 4. `SectionCard`
The most visible change in the story, and the one that reaches all five
screens. Today: `padding: var(--space-6)`, `background: var(--color-surface)`,
`border: var(--border-2) solid var(--color-border)`,
`border-radius: var(--radius-0)`, title `<h2>` in mono `--text-md` bold.

```scss
.card { border-radius: var(--radius-md); }
.title {
  font-family: var(--font-display);
  font-size: var(--text-2xs);
  font-weight: var(--weight-regular);
  letter-spacing: var(--tracking-wide);
  text-transform: uppercase;
}
```
`text-transform` rather than uppercasing the strings: the titles are also read
by screen readers and are reused as `Tooltip` labels
(`Como {title} é calculado`), and Press Start 2P has no lowercase glyphs worth
looking at anyway. Icon drops from `size={18}` to `size={16}` to sit with the
smaller label.

**Do not add `overflow: hidden` to `.card`.** Every card's `Tooltip` trigger
uses `@include t.focus-ring`, which is an `outline` with `outline-offset: 2px`
— an `overflow: hidden` ancestor clips it on all 13 cards at once, and nothing
tests focus rings.

`tone` keeps its dynamic `styles[tone]` lookup (`.positive` / `.negative`).
Those class names are a **CSS-Modules string lookup**: renaming them breaks the
tint with no compile error and no test failure. Leave the names alone.

### 5. The inputs — `TextField`, `SelectField`, `MoneyInput`, `MonthPicker`, `ColorPicker`
Style-only, and the same four edits in each: `border-radius: var(--radius-sm)`,
keep `--border-2 solid var(--color-border)`, keep the 44px floor (`MoneyInput`
uses `min-height: var(--space-12)` = 48px — leave it), keep
`@include t.focus-ring`.

`ColorPicker` has a second outline on `.selected`
(`var(--border-3) solid var(--color-border)`, `outline-offset: 2px`) that
stacks with the focus ring on the same 44px swatch. They encode different
states — **keep both distinguishable**; if the new radius makes them read as
one, change the selected state's colour, not its presence.

`MoneyInput`'s three caret handlers (`onFocus`, the post-reformat
`useLayoutEffect`, and `onSelect`) are load-bearing and stay untouched: without
them a mid-field insert shifts the value by a decimal place. Nothing in this
task goes near `hook.ts`.

### 6. `Tooltip`
Style-only, and the most fragile file in the set. Three things must survive:
- The bubble is **always in the DOM**, hidden with `opacity` + `visibility`, so
  `aria-describedby` always resolves. Never `display: none`, never conditional
  rendering.
- The 44×44 `::after` hit target is an absolutely-positioned pseudo-element,
  not padding, so the title row does not grow. It also **bridges the gap to the
  bubble**: with `--duration-fast` at `0ms` under `prefers-reduced-motion`, a
  pointer crossing dead space hides the bubble (WCAG 1.4.13 Hoverable). If you
  change `top: calc(100% + var(--space-2))` you must re-check that the overlay
  still reaches the bubble. Neither value is tested.
- `.wrapper[data-dismissed] &` wins by specificity over `:hover` /
  `:focus-within` — that is Esc-to-dismiss. Reordering the selectors can invert
  it.

Change only `border-radius: var(--radius-sm)` on `.bubble` and leave the rest.

### Verify
Run from inside the task worktree, never the main checkout:

```bash
npm install && npm run db:setup && npm run lint && npx vitest run --exclude '**/.claude/**' && npx tsc --noEmit && npm run build
```

Baselines: lint **2 errors + 1 info**, tsc **1 error**, test **45 files / 321
tests** plus whatever earlier tasks added — re-measure on the merged `main`.
Never run `npm run lint:fix`.

`tsc` is the real gate here: adding `"dashed"` to the `Button` variant union
and `eyebrow?` to the `Modal` props is exactly the kind of change that breaks a
call site you did not open. All 13 `Button` and 6 `Modal` importers are listed
below — if `tsc` is clean, none of them needed touching, which is the intended
outcome.

### Browser check
Start the dev server from inside the worktree on a spare port and
`preview_start` with `{url: "http://localhost:<port>"}`. Walk **every** screen,
because that is where the 13 `SectionCard` sites live:

- `/` — the dashboard's cards (StatCard ×3, both ChartCards, Slack, Limit,
  Goals, and the `Notice` states).
- `/movimentacoes` and `/recorrencias` — the two `EntrySection` cards, the
  add/edit `Modal`s and the delete `ConfirmDialog`.
- `/configuracoes` — all four sections and their four modals.
- `/leitor-ofx` — `UploadCard` and, after a parse, `ReportView`.

Then specifically:
- Press and hold a primary button: it shifts 2px and the shadow shortens.
  Release: it returns. A **disabled** primary casts no shadow.
- Tab to a `Tooltip` trigger, a nav item, a `ColorPicker` swatch and a
  `MoneyInput`: the focus ring is visible and **not clipped** on any of them.
- Hover a `Tooltip` icon and travel the pointer down to the bubble without it
  disappearing — then repeat with `prefers-reduced-motion` forced on
  (`resize_window` does not do this; set it via the browser's emulation or by
  temporarily checking that `--duration-fast` computes to `0ms`).
- Open a modal: the panel has the 8px offset shadow, the header is sticky when
  the body scrolls, Esc closes it, a backdrop click closes it, and a click
  **inside** the panel does not.
- Both themes, and 375px.

Remember: a `computer` click can report success while landing on nothing —
confirm with a fresh `read_page` or `read_network_requests`, never the click's
own response.

### Anything else you touch
No `hook.ts` logic changes except the two prop-type widenings named above. No
test file should need editing — if one does, a return shape moved and the
change has outgrown this task.

Full ripple list, for the PR body and for your own re-check:
- **`SectionCard` (13):** `ChartCard`, `GoalsCard`, `LimitCard`, `Notice`,
  `SlackCard`, `StatCard`, `GoalsSection`, `MonthlyGoalSection`,
  `PeopleSection`, `RangeSection`, `ReportView`, `UploadCard`, `EntrySection`.
- **`Button` (13):** `GoalForm`, `GoalsSection`, `MonthlyGoalSection`,
  `PersonForm`, `PeopleSection`, `RangeSection`, `FilePicker`, `ReportView`,
  `IntervalList`, `EntryForm`, `EntrySection`, plus `ConfirmDialog` and `Modal`
  via relative imports.
- **`Modal` (6):** `GoalsSection`, `MonthlyGoalSection`, `PeopleSection`,
  `RangeSection`, `EntryScreen`, `ConfirmDialog`.
- **`IconButton` (5):** `GoalsSection`, `PersonRow`, `CopyButton`,
  `IntervalList`, `EntryRow` — plus `Modal`'s new close button.
- **`Tooltip` (1 importer, `SectionCard`)** — therefore every card that passes
  a `hint`, i.e. the whole dashboard.
