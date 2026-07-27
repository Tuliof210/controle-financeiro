# The shell — dark collapsible rail, Monevo brand, header, mobile bottom nav, page header

## Description
This is the frame every screen sits in, and the task that makes the app look
like the design at a glance. Five pieces:

1. **The rail** goes dark in both themes (the `--rail-*` tokens task 01 added),
   264px wide, and gains a real **collapsed state** — 80px, icons only, labels
   gone. Today's `AppShell` has an all-or-nothing `hidden` that removes the
   sidebar entirely; that becomes the collapse-to-rail behaviour instead.
2. **The Monevo brand.** The rail's head shows a pixel-block mark, `MONEVO`
   and `PANORAMA FINANCEIRO`, replacing today's literal `CF` text.
3. **The header** gains a second line under the greeting, and its controls are
   restyled — but the `ProfileSelect` stays a native `<select>` and the
   `ThemeToggle` keeps its behaviour exactly.
4. **A mobile bottom nav**, because today the 240px sidebar simply eats a
   375px viewport until the user finds the hamburger. This is the first real
   responsive behaviour in the shell.
5. **A shared page header block** — brand eyebrow, display title, muted
   subtitle — replacing the bare `<h1>` on all five screens.

Everything here is layout and paint. No screen gains an action it did not have,
no data is fetched that was not fetched before.

## When to run
- Depends on: 01-foundations.md (consumes `--rail-bg/-fg/-muted/-line/-hover`).
  Run after it merges and `git fetch origin main` first.
- Parallel-safe with: 03-primitives.md — 03 touches only `src/components/{Button,
  IconButton,Modal,SectionCard,TextField,SelectField,MoneyInput,MonthPicker,
  ColorPicker,Tooltip}`, this task touches only `AppShell/**`, the new
  `PageHeader/`, and the five screens' `index.tsx` where the `<h1>` lives. The
  five screen files are the only shared surface and 03 does not open them.

## How-to

### Files
```
src/components/AppShell/index.tsx | hook.ts | style.module.scss          (edit)
src/components/AppShell/components/Aside/index.tsx | hook.ts | style.module.scss  (edit)
src/components/AppShell/components/Aside/components/NavItem/**           (edit)
src/components/AppShell/components/Header/index.tsx | hook.ts | style.module.scss (edit)
src/components/AppShell/components/Header/today.helper.ts + today.helper.test.ts  (new)
src/components/AppShell/components/Header/components/ProfileSelect/style.module.scss (edit)
src/components/AppShell/components/Header/components/ThemeToggle/style.module.scss   (edit)
src/components/AppShell/components/Header/components/Avatar/ index|hook|style        (new)
src/components/AppShell/components/BrandMark/ index|hook|style                       (new)
src/components/AppShell/components/BottomNav/ index|hook|style                        (new)
src/components/AppShell/nav.ts                                                        (new)
src/components/PageHeader/ index|hook|style                                           (new)
src/app/page.tsx-side screens' index.tsx × 5                                          (edit: swap <h1> for <PageHeader>)
```

Every component folder is exactly three files: `index.tsx` blindly calls the
folder's `hook.ts` and renders JSX with **no logic, state or effects**;
`hook.ts` holds everything else; `style.module.scss` uses `@use "theme" as t;`
and `var(--token)` only.

### 1. `nav.ts` — one nav definition, two consumers
`Aside` and the new `BottomNav` render the same five destinations. Duplicating
the array is exactly the repetition the architecture forbids, so lift it out of
`Aside/hook.ts` into a plain module beside `AppShell/index.tsx`:

```ts
import {
  ArrowLeftRight, FileUp, LayoutDashboard, Repeat, Settings,
  type LucideIcon,
} from "lucide-react";

export type NavEntry = { href: string; label: string; short: string; icon: LucideIcon };

// `short` is the mobile bottom-nav label — the full ones do not fit in a fifth
// of 375px.
export const NAV: NavEntry[] = [
  { href: "/", label: "Dashboard", short: "Painel", icon: LayoutDashboard },
  { href: "/movimentacoes", label: "Movimentações", short: "Mov.", icon: ArrowLeftRight },
  { href: "/recorrencias", label: "Recorrências", short: "Fixos", icon: Repeat },
  { href: "/leitor-ofx", label: "Leitor OFX", short: "OFX", icon: FileUp },
  { href: "/configuracoes", label: "Configurações", short: "Ajustes", icon: Settings },
];
```

The design's own icon set is hand-drawn `<path d>` strings; keep lucide (28
files in this repo already use it). The short labels above are the design's
verbatim.

Note this flattens today's split between `TOP_ITEMS` and a `BOTTOM_ITEM`
(Configurações was pinned to the bottom with `margin-top: auto`). The design
puts all five in one list under a `MENU` heading — keep the single list, and
let the rail's footer hold only the collapse button.

### 2. `BrandMark` — the Monevo mark
No lucide equivalent exists, so this is the story's one inline SVG. Transcribe
it from the design verbatim (it is a four-column ascending bar chart in pixel
blocks, tallest column topped by an accent block):

```tsx
<svg width="21" height="21" viewBox="0 0 32 32" role="img" aria-label="Monevo">
  <rect x="1" y="25" width="6" height="4" rx="1" fill="currentColor" />
  <rect x="1" y="19.5" width="6" height="4" rx="1" fill="currentColor" />
  <rect x="1" y="14" width="6" height="4" rx="1" fill="currentColor" />
  <rect x="1" y="8.5" width="6" height="4" rx="1" fill="currentColor" />
  <rect x="9" y="25" width="6" height="4" rx="1" fill="currentColor" />
  <rect x="9" y="19.5" width="6" height="4" rx="1" fill="currentColor" />
  <rect x="17" y="25" width="6" height="4" rx="1" fill="currentColor" />
  <rect x="17" y="19.5" width="6" height="4" rx="1" fill="currentColor" />
  <rect x="17" y="14" width="6" height="4" rx="1" fill="currentColor" />
  <rect x="25" y="25" width="6" height="4" rx="1" fill="currentColor" />
  <rect x="25" y="19.5" width="6" height="4" rx="1" fill="currentColor" />
  <rect x="25" y="14" width="6" height="4" rx="1" fill="currentColor" />
  <rect x="25" y="8.5" width="6" height="4" rx="1" fill="currentColor" />
  <rect x="25" y="3" width="6" height="4" rx="1" fill="var(--color-accent)" />
</svg>
```

`currentColor` everywhere except the accent cap, so the mark inherits whatever
box it sits in. The box itself (both in the rail head and, later, in the mobile
header) is 36×36, `background: var(--color-brand)`, `color: var(--white)`,
`--border-2 solid var(--color-border)`, `--radius-sm`.

Its `hook.ts` has nothing to compute — that is fine; the folder still gets the
three-file split (the repo already has that precedent). Keep the `role="img"` +
`aria-label`: it is the only place the product name is announced when the rail
is collapsed.

### 3. `Aside` — the dark rail
Structure, top to bottom: brand head (72px, bottom border in `--rail-line`) →
`MENU` label → the five `NavItem`s → a footer holding only the collapse button.
**No `RESERVA` widget** — cut during refinement, there is no such data.

`style.module.scss`:
```scss
.aside {
  display: flex;
  flex-direction: column;
  // ponytail: two raw widths, deliberately not a --size-* token family — a
  // token family plus a Foundations page for two numbers in one file is not
  // worth it. Promote if a third fixed width shows up.
  width: 264px;
  background: var(--rail-bg);
  color: var(--rail-fg);
  border-right: var(--border-2) solid var(--color-border);
  overflow: hidden;
  transition: width var(--duration-slow) var(--ease-snappy);
}
.collapsed { width: 80px; }
```

The collapsed state hides labels, not items. Do it with a modifier class on the
aside plus `.collapsed .label { display: none; }` — **not** by conditionally
rendering the `<span>`, so the width transition has something stable to animate
and the DOM does not churn on every toggle.

`NavItem` active state, replacing today's flat brand block:
```scss
.link {
  display: flex; align-items: center; gap: var(--space-3);
  width: 100%; min-height: 44px; padding: var(--space-3);
  border-left: var(--border-3) solid transparent;
  border-radius: var(--radius-sm);
  color: var(--rail-fg);
  font-size: var(--text-base);
  white-space: nowrap;
  transition: background var(--duration-fast) var(--ease-snappy);
  @include t.focus-ring;

  &:hover { background: var(--rail-hover); }

  &[aria-current="page"] {
    background: var(--color-brand);
    color: var(--white);
    border-left-color: var(--color-accent);
  }
}
```
**`aria-current="page"` must stay the styling hook.** It is simultaneously the
accessibility signal and the selector; moving the style to a class quietly
decouples the two, and nothing tests it.

Icon `size={18}`, `aria-hidden`, `flex: none` so it does not shrink in the
collapsed rail. Idle items keep the design's `opacity: .75` on the icon and
`.85` on the label.

Keep `aria-label="Navegação principal"` on the `<nav>` and `id="app-sidebar"`
on the aside — the header's `aria-controls` points at that id.

### 4. `AppShell` — layout and collapse state
Today the shell is a CSS grid with `grid-template-areas: "aside header" / "aside main"`
and `hook.ts` is `useState(true)` + `toggle`, with an explicit
`// ponytail: no persistence` note. **Keep the no-persistence decision** — the
design treats collapse as a session-level preference too, and adding
`localStorage` here is out of scope.

Rename the state to say what it now means (`collapsed`, default `false`) and
pass it to `Aside`. Drop the `hidden` attribute and its
`&[hidden] { display: none }` override — the aside is always in the DOM at
desktop width now.

`main` gets the design's page padding and max width:
```scss
.main {
  grid-area: main;
  min-width: 0;
  padding: var(--space-4);
  padding-bottom: var(--space-12);
  background: var(--color-bg);

  @include t.bp("md") { padding: var(--space-10); }
}
.page { max-width: 1560px; margin: 0 auto; width: 100%; }
```

### 5. Mobile — the `md` breakpoint, mobile-first
The design switches at 860px. This repo's `$breakpoints` map is closed
(`sm 480 / md 768 / lg 1024 / xl 1280`) and the `bp()` mixin is **min-width
only**. Use `md` (768px) as the boundary rather than adding a fifth breakpoint
for one screen — and write the CSS mobile-first so `bp()` fits:

- Below `md`: `.aside { display: none }`, `.bottomNav { display: flex }`, and
  `main` gets `padding-bottom: 96px` so the last card clears the bar.
- At `md` and up (`@include t.bp("md")`): `.aside { display: flex }`,
  `.bottomNav { display: none }`, `main` returns to `--space-12` bottom padding.

The grid needs the same treatment: below `md` it is a single column
(`grid-template-areas: "header" "main"`), at `md` and up it is today's two.

`BottomNav`:
```scss
.nav {
  position: fixed; left: 0; right: 0; bottom: 0;
  z-index: var(--z-sticky);
  display: flex;
  background: var(--rail-bg);
  border-top: var(--border-2) solid var(--color-border);
}
.item {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: var(--space-1);
  flex: 1; min-height: 60px; padding: var(--space-3) var(--space-1);
  border-top: var(--border-3) solid transparent;
  color: var(--rail-muted);
  font-size: var(--text-2xs);
  @include t.focus-ring;

  &[aria-current="page"] { color: var(--color-accent); border-top-color: var(--color-accent); }
}
```
Icons `size={19}`, `aria-hidden`; label is `entry.short`. Same
`pathname === href` exact-equality active rule as `NavItem` — reuse it rather
than re-deriving, and note there is no nested route in this app, so exact
equality is correct for all five.

The hamburger in the header is desktop-only (it toggles the rail, which does
not exist below `md`) — hide it with the same breakpoint, and in its place show
the 36×36 `BrandMark` box the design puts there.

### 6. `Header`
Layout: 72px tall, `padding: 0 var(--space-4)` → `var(--space-10)` at `md`,
`background: var(--color-surface)`, `border-bottom: var(--border-2) solid
var(--color-border)`, `position: sticky; top: 0; z-index: var(--z-sticky)`.

Order: hamburger (desktop) / brand mark (mobile) → greeting block (flex 1,
`min-width: 0`) → `ProfileSelect` → `ThemeToggle` → `Avatar`. Everything but
the greeting is `flex: none`.

The greeting block is two lines:
```tsx
<div className={styles.greetingBlock}>
  <p className={styles.greeting}>{greeting}</p>
  <p className={styles.today}>{today}</p>
</div>
```
`.greeting` at `--text-md`, `.today` at `--text-2xs`, muted,
`letter-spacing: var(--tracking-wide)`; both
`white-space: nowrap; overflow: hidden; text-overflow: ellipsis`.

`today.helper.ts` (new, **pure and tested**):
```ts
// "DOM, 26 JUL 2026" — the design's second header line. The design also
// appended "· DADOS ATÉ … · PROJEÇÃO ATÉ …", which needs the settings range
// the header does not fetch; the date alone is the honest half.
export function formatToday(now: Date): string
```
Build it with `Intl.DateTimeFormat("pt-BR", …)` or the repo's existing
`MONTH_LABELS`, uppercase, and pick one — do not hand-roll a weekday array if
`Intl` already gives you one. `today.helper.test.ts`: a fixed `new Date(...)`
per weekday boundary and one month-name case. Inject `now` as an argument
exactly as `greeting.helper.ts` already does, so the test needs no clock
mocking.

Render it in the **same effect that already computes the greeting** — the
header is a client component whose greeting is deliberately empty on the server
to avoid a hydration mismatch. Do not add a second effect, and do not compute
either during render.

`Avatar` (new, small): a 38×38 `--radius-full` circle,
`background: var(--color-surface-raised)`, `--border-2 solid var(--color-border)`,
`--text-sm`, containing the initials of the active profile label — the first
letter of the first two words, uppercased, falling back to one letter. Get the
label from `useProfile()`, which `Header/hook.ts` already calls. It is
decorative: `aria-hidden`, and it must not be a button (there is no menu behind
it). `--radius-full` is legal here — README rule 2 names avatars as the
exception.

`ProfileSelect` keeps its native `<select>`, its `aria-label="Perfil ativo"`
and its 44px min-height; only the frame changes (`--border-2 solid
var(--color-border)`, `--radius-sm`, `background: var(--color-surface)`). The
design's chip-with-dot-and-chevron is **not** built — decided during
refinement.

`ThemeToggle` keeps every behaviour including the `theme === null` placeholder
span that prevents a first-paint layout shift. Restyle only: 44×44 (the design
draws 38 — the floor wins), `--border-2 solid var(--color-border)`,
`--radius-sm`, `background: var(--color-text); color: var(--color-bg)` as the
design's inverted chip.

### 7. `PageHeader` — the shared block
```
src/components/PageHeader/index.tsx | hook.ts | style.module.scss
```
Props: `{ eyebrow: string; title: string; subtitle: string }`. `hook.ts` just
passes them through — that is honest for a pure presentational block and keeps
the folder shape uniform.

```tsx
<header className={styles.header}>
  <p className={styles.eyebrow}>{eyebrow}</p>
  <h1 className={styles.title}>{title}</h1>
  <p className={styles.subtitle}>{subtitle}</p>
</header>
```
```scss
.eyebrow {
  margin: 0 0 var(--space-3);
  color: var(--color-brand);
  font-family: var(--font-display);
  font-size: var(--text-2xs);
  letter-spacing: var(--tracking-wide);
}
.title {
  font-size: var(--text-lg);
  @include t.bp("md") { font-size: var(--text-2xl); }
}
.subtitle {
  margin: var(--space-3) 0 0;
  max-width: 56ch;
  color: var(--color-text-muted);
  font-size: var(--text-sm);
  text-wrap: pretty;
}
```
`h1` already gets `--font-display`, `--leading-tight` and `--tracking-display`
from `_base.scss`; only the size overrides. **No action button** — decided
during refinement.

Swap the bare `<h1>` for `<PageHeader … />` in all five screens, with the
design's exact copy:

| screen | eyebrow | title | subtitle |
|---|---|---|---|
| `DashboardScreen/index.tsx` | `PAINEL` | `Dashboard` | `Onde o dinheiro da família está hoje e para onde ele vai.` |
| `MovementsScreen` (via `EntryScreen`) | `LANÇAMENTOS` | `Movimentações` | `Entradas e saídas pontuais de cada pessoa da casa.` |
| `RecurrencesScreen` (via `EntryScreen`) | `AUTOMÁTICO` | `Recorrências` | `O que se repete todo mês — a base de toda a projeção.` |
| `OfxScreen/index.tsx` | `IMPORTAÇÃO` | `Leitor OFX` | `Leia o extrato do banco direto no navegador, sem subir nada.` |
| `SettingsScreen/index.tsx` | `AJUSTES` | `Configurações` | `Pessoas, período, meta e objetivos da família.` |

The design's dashboard subtitle ends "…para onde ele vai até Dez/27", naming
the configured range end. The header does not have the range; drop the clause
rather than fetch settings for a sentence.

**`EntryScreen/index.tsx` is shared by Movimentações and Recorrências** and is
the single tightest file in the repo — **102 effective lines against a 100-line
cap**. It already takes a `heading` string prop; widen that to the three
strings (or a small object) rather than adding JSX to the file, and if the
change pushes it over, that is the signal to lift its two `Modal` blocks into a
child component, not to squeeze. Count by hand: the rule reports at `info` and
does not count lines inside a JSX expression, so nothing will tell you.

### Verify
Run from inside the task worktree, never the main checkout:

```bash
npm install && npm run db:setup && npm run lint && npx vitest run --exclude '**/.claude/**' && npx tsc --noEmit && npm run build
```

`npm install` matters: task 01 may have landed manifest changes whose
`node_modules` a fresh worktree does not have. Baselines: lint **2 errors + 1
info**, tsc **1 error**, test **45 files / 321 tests** plus whatever task 01
added — re-measure on the merged `main` rather than reusing the number. Never
run `npm run lint:fix`.

### Browser check
`preview_start`'s `{name}` launcher runs from the MAIN checkout — start the dev
server manually from inside the worktree on a spare port and `preview_start`
with `{url: "http://localhost:<port>"}`.

- The rail is dark on a light background; toggle the theme and confirm it goes
  to `--ink-800` rather than staying identical.
- Collapse: the rail animates to 80px, labels disappear, icons stay centred,
  and the active item's accent left edge survives. Expand again.
- Click each of the five nav items; the active one takes the brand fill in both
  the rail and (at 375px) the bottom nav.
- `resize_window` to 375px: the rail is gone, the bottom nav is fixed at the
  bottom with five items, the header shows the brand mark instead of the
  hamburger, and **the last card is not hidden behind the bar** — scroll to the
  bottom of Movimentações and check.
- Back to desktop: the bottom nav is gone, the rail is back.
- The page header block reads correctly on all five screens.
- No console error; the page body does **not** scroll horizontally at 375px.

Two tool traps recorded in `.squad/learnings.md` that will bite here: a
`computer` click can report success while landing on nothing — confirm the
effect with a fresh `read_page`, not the click's own response; and any state
read in the SAME `javascript_tool` call as the thing that changed it reports
the PRE-change value, so re-read in a separate call before concluding the
collapse is broken.

### Anything else you touch
No API call changes. `ProfileProvider`, `greeting.helper.ts`,
`ThemeToggle/hook.ts` and `theme.helper.ts` keep their behaviour byte for byte
— only their styles move. `greeting.helper.test.ts` and
`theme.helper.test.ts` must still pass untouched; if either needs editing, the
change has gone further than this task allows.
