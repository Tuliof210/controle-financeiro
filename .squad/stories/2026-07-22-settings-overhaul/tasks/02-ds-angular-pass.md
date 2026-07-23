# DS angular pass — flatten radius, rework Button borders, add IconButton

## Description
Make the shared primitives fully angular and fix the button borders. Today the
settings screen (and the whole app) reads too rounded, and `Button` hardcodes
one near-black 2px border on every variant with opacity-only hover and a
border-carrying "ghost". This is an **app-wide** DS change — it edits the shared
components, so every screen goes flatter (intended, per `src/styles/README.md`:
angular/"borders as structure"). It also adds the compact **IconButton** the
row edit/delete controls (tasks 05/06) need.

## When to run
- Depends on: none
- Parallel-safe with: 01, 03, 04

## How-to
**A `--radius-0` token already exists** (`src/styles/_tokens.scss:149`,
`--radius-0: 0`). Flatten every rectangular surface to it. **Leave
`--radius-full` alone** where it dresses the sidebar avatar / status dots.

**1. Flatten radius** — change each `border-radius` token to `var(--radius-0)`:
- `src/components/Button/style.module.scss:10` (`--radius-md` → `--radius-0`)
- `src/components/TextField/style.module.scss:20` (`--radius-md` → `--radius-0`)
- `src/components/MonthPicker/style.module.scss:25` (`--radius-md` → `--radius-0`)
- `src/components/MoneyInput/style.module.scss:10` (`--radius-md` → `--radius-0`)
- `src/components/ColorPicker/style.module.scss:13` (`.swatch`, `--radius-md` → `--radius-0`)
- `src/app/configuracoes/_components/SettingsScreen/components/SectionCard/style.module.scss:8` (`.card`, `--radius-lg` → `--radius-0`)
- `src/app/configuracoes/_components/SettingsScreen/components/PeopleSection/style.module.scss:29` (`.swatch`, `--radius-sm` → `--radius-0`)

(Grep the whole `src/` tree for `border-radius` to catch any surface these
lists miss — flatten all except avatar/status-dot uses of `--radius-full`.)

**2. Rework Button borders + states** — `src/components/Button/`. Today the base
`.button` (style.module.scss:9) sets `border: var(--border-2) solid
var(--color-border)` for **all** variants; `.primary`/`.danger`/`.ghost` only
set bg/color; hover is `opacity: 0.85`; `:disabled` is `opacity: 0.5` only;
`.ghost` still carries the solid border. Make borders variant-aware and add the
missing states, honoring the "borders as structure" pillar:
- **primary / danger**: keep a structural border, but make it read as part of
  the fill (a same-hue darker shade or a deliberate token) rather than a black
  outline clashing with the vivid fill. Add a real **active** (pressed) state
  and a distinct **disabled** state (muted bg + muted border, not just opacity).
- **ghost**: not solid-bordered — transparent/`--color-border-subtle` at most;
  hover keeps the existing `background: var(--color-surface-raised)`.
- Keep the `@include t.focus-ring` focus treatment. Keep min-height 44px.
- The exact border look is a taste call — **ship a clean default and get the
  owner's sign-off at PR review** (the owner flagged "bordas erradas" without
  specifying the target). Note the chosen direction in the PR body.

**3. Add `IconButton`** — `src/components/IconButton/` (three files:
`index.tsx`, `hook.ts`, `style.module.scss`). A compact **square** button for a
single lucide icon (used by rows for Editar/Excluir). Requirements: **≥44px hit
target** (constitution), `--radius-0`, angular border consistent with the
reworked Button, a `variant` (`ghost` default; `danger` for trash) mirroring
Button's variants, a required `aria-label` (icon-only ⇒ no text label), the
focus ring, and hover/active states. Imitate `Button/hook.ts`'s prop-spread +
`styles[variant]` composition pattern. Renders `{icon}` children (caller passes
`<Pencil size={18} />` etc.). Keep each file under 100 lines.

**Exemplars:** `Button/` for the variant/prop pattern; `_theme.scss`
(`focus-ring`) for focus; `_tokens.scss` for border/color tokens.

**Do NOT:** add a size-scale system, a tooltip, or an icon-loading abstraction
(YAGNI — one square size + variants is enough).

**Verification:**
- `npm run lint`, `npm run test`, `npm run build` all green.
- Browser preview `/configuracoes` (and one other screen, e.g. `/`): every card,
  button, input, select, swatch renders **fully square**; the avatar stays
  round. Confirm computed `border-radius: 0px` on a card and a button via
  `javascript_tool` `getComputedStyle`.
- Buttons: hover/active/disabled and both variants read correctly in **light
  and dark** (`resize_window` colorScheme, or the in-app theme toggle).
- `IconButton`: renders a centered icon in a ≥44px square with a visible focus
  ring; screenshot it in both variants.
