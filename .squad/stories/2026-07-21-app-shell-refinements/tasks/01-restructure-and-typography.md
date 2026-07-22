# Restructure the grid + typography corrections

## Description
Correct the app-shell layout and its typography — no new features, no new
dependencies. Three coherent changes in one pure-CSS/markup pass:

1. **Full-height aside.** Flip the shell grid so the aside is a full-height left
   column, and the right column splits into header (top) + main (below).
2. **Sharp, flush, padding-only nav links.** Remove `border-radius` from the nav
   link (so hover/active corners are square, matching the DS "angular" pillar),
   remove the list `gap` so links are flush, and rely on link padding only. The
   header's sidebar-toggle button loses its radius too, for consistency.
3. **Display font gets a home.** Press Start 2P (`--font-display`) is loaded but
   used nowhere. Add a wordmark ("CF", placeholder) at the top of the aside, and
   style the page `<h1>` titles with the display font via a global `_base.scss`
   rule. Everything else stays JetBrains Mono; sizes/weights/tracking from tokens.

## When to run
- Depends on: none
- Parallel-safe with: none — tasks 02 and 03 build on the files this task
  finalizes (Header/Aside/NavItem styles), so they run after this lands.

## How-to

Conventions (from `.squad/ARCHITECTURE.md` + `src/styles/README.md`): tokens only
(`var(--token-name)`, `@include t.focus-ring`); never hardcode
color/spacing/radius/shadow/duration; ≤100 lines/file; `index.tsx` stays
logic-free.

### 1. Grid — `src/components/AppShell/style.module.scss`
Flip the named areas so `aside` spans both rows. Replace the `.shell` block's
`grid-template-areas` and update the leading comment:
```scss
// Named-area contract shared with Header (grid-area: header) and Aside
// (grid-area: aside) — the aside name spans both rows, so it fills full height.
.shell {
  display: grid;
  grid-template-columns: auto 1fr;
  grid-template-rows: auto 1fr;
  grid-template-areas:
    "aside header"
    "aside main";
  min-height: 100vh;
}
```
`.main` is unchanged. (When the aside is hidden via the toggle, its `display:none`
collapses the `auto` column to 0 and header+main take the full width — verify.)

### 2. Aside — `src/components/AppShell/components/Aside/style.module.scss`
- Change `.aside` `padding: var(--space-4)` → `padding: 0` (the wordmark and links
  provide their own padding so hover/active backgrounds are full-bleed). Keep
  `grid-area`, `display:flex`, `flex-direction:column`, the `width: 240px` (+ its
  ponytail comment), `border-right`, `background`, and the `&[hidden]{display:none}`
  override.
- Add a `.brand` block:
```scss
.brand {
  padding: var(--space-4);
  border-bottom: var(--border-1) solid var(--color-border-subtle);
  font-family: var(--font-display);
  font-size: var(--text-md);
  line-height: var(--leading-tight);
  letter-spacing: var(--tracking-display);
  color: var(--color-text);
}
```
- In `.top, .bottom`, **remove** `gap: var(--space-1)` (links must be flush).
  Keep `list-style:none; margin:0; padding:0; display:flex; flex-direction:column`.
  Keep `.bottom { margin-top: auto; }` — that's a container pin, not a link margin,
  and is required to push Configurações to the bottom.

### 3. Aside markup — `src/components/AppShell/components/Aside/index.tsx`
Add the wordmark as the first child of `<aside>`, before `<nav>`:
```tsx
<aside id="app-sidebar" className={styles.aside} aria-label="Navegação principal" hidden={!open}>
  <div className={styles.brand}>CF</div>
  <nav className={styles.nav}>
    ...
  </nav>
</aside>
```
`CF` is a placeholder wordmark (Controle Financeiro) — the owner may rename it.
Keep it a plain non-interactive element (there is already a Dashboard link to `/`).

### 4. NavItem — `src/components/AppShell/components/Aside/components/NavItem/style.module.scss`
Replace `.link` so it has **no** `border-radius` and larger padding for the
full-bleed rows (task 03 will later switch `display:block` → flex to seat an icon):
```scss
.link {
  display: block;
  padding: var(--space-3) var(--space-4);
  color: var(--color-text);
  font-family: var(--font-mono);
  font-size: var(--text-base);
  text-decoration: none;

  &:hover {
    background: var(--color-surface-raised);
  }
  &:focus-visible {
    @include t.focus-ring;
  }
  &[aria-current="page"] {
    background: var(--color-brand);
    color: var(--white);
  }
}
```
(The removed `border-radius: var(--radius-md)` is the whole point — no rounded
hover/active corners.)

### 5. Header toggle — `src/components/AppShell/components/Header/style.module.scss`
In `.toggle`, delete the `border-radius: var(--radius-md);` line (sharp corners,
consistent with the nav). Leave everything else (`background:transparent`, hover
background, `@include t.focus-ring`, padding) as is. The `.header` and `.greeting`
blocks are unchanged — the greeting is already token-correct (`--font-mono`,
`--text-lg`, `--weight-medium`).

### 6. Page `<h1>` titles — `src/styles/_base.scss`
Add a global `h1` rule so the route titles (Dashboard, Movimentações, …) render in
the pixel display font. Append after the existing `body` rule:
```scss
h1 {
  margin: 0;
  font-family: var(--font-display);
  font-size: var(--text-lg);
  font-weight: var(--weight-regular);
  line-height: var(--leading-tight);
  letter-spacing: var(--tracking-display);
  color: var(--color-text);
}
```
Press Start 2P is wide — verify in the browser that "Movimentações"/"Configurações"
don't overflow `<main>` at a normal viewport; if it reads too large/wraps badly,
drop to `--text-md`. (`_base.scss` is a global base layer, so this styles every
route's `<h1>` at once — that's intended.)

## Verification
- `npm run lint` — Biome all-green (a pre-existing, unrelated `biome.json`
  deprecation *info* is expected).
- `npm run test` — still green (no new logic; the existing greeting test stands).
- `npm run build` — compiles.
- Browser (per `.squad/learnings.md`: `preview_start`'s `{name}` launcher runs from
  the main checkout, not this worktree — start `next dev` manually inside the
  worktree on a spare port, then `preview_start` with `{url: "http://localhost:<port>"}`):
  - Aside runs the full viewport height on the left; header sits top-right, `<main>`
    below it.
  - Toggling the sidebar hides it and `<main>` reflows to full width.
  - Nav hover/active backgrounds are square-cornered and span the full aside width,
    with no gaps between rows.
  - The "CF" wordmark shows in Press Start 2P at the top of the aside; the page
    `<h1>` renders in Press Start 2P.
  - Check both light and dark themes (set `data-theme` on `<html>` via devtools).
