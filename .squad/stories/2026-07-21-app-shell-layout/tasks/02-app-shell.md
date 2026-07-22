# App shell — header + collapsible aside + main

## Description
Build the persistent application shell and wire it into the root layout. The
shell is a client component `AppShell` that renders a `Header` (greeting +
sidebar toggle), an `<aside>` navigation, and a `<main>` holding the routed
`children`. The aside collapses by **fully hiding/showing** via a toggle button
in the header; when hidden, `<main>` takes the full width. The aside lists four
links via a repeated `NavItem` child: Dashboard (`/`), Movimentações
(`/movimentacoes`), Recorrências (`/recorrencias`) grouped at the top, and
Configurações (`/configuracoes`) pinned to the bottom. The active route is
highlighted. The header shows a time-based greeting with no name.

## When to run
- Depends on: 01 (the four routes must exist for the links to resolve and for a
  404-free browser check).
- Parallel-safe with: 01 at the file level (different files), but review this
  task after 01 has landed.

## How-to

### Conventions to obey (from .squad/ARCHITECTURE.md + src/styles/README.md)
- Every component is a folder of exactly three files: `index.tsx` (blindly calls
  its `hook.ts` and renders JSX — no logic), `hook.ts` (all state/effects/
  handlers/derived values), `style.module.scss` (Sass Module). Imitate the shape
  of `src/components/HomePage/`.
- Any JSX repeated >1× becomes a child component in a `components/` subfolder
  (recursion rule) → the nav link becomes a `NavItem` child.
- Max **100 lines per file** (Biome enforces it) — everything here fits easily.
- **Tokens only**: never hardcode a color/spacing/radius/shadow/duration. In
  `.module.scss`, `@use "theme" as t;` then `var(--token-name)` /
  `@include t.focus-ring;` etc. Load path `src/styles` is already configured.
- The `<html>`/`<body>`/fonts stay in the root layout; the shell mounts inside
  `<body>`.

### Files to create
```
src/components/AppShell/
  index.tsx                 # "use client"; renders Header + <aside> Aside + <main>{children}
  hook.ts                   # sidebar open state + toggle
  style.module.scss         # CSS grid: header row on top, aside | main below
  components/
    Header/
      index.tsx             # toggle button + greeting
      hook.ts               # greeting computed after mount; passes through toggle props
      style.module.scss
      greeting.helper.ts    # getGreeting(date) -> "Bom dia" | "Boa tarde" | "Boa noite"
      greeting.helper.test.ts
    Aside/
      index.tsx             # <aside> with <nav>: top <ul> (3 items) + bottom <ul> (settings)
      hook.ts               # nav items config + usePathname
      style.module.scss
      components/
        NavItem/
          index.tsx         # <li><Link/></li>
          hook.ts           # passes { href, label, active } through
          style.module.scss
```

### Wiring — `src/app/layout.tsx`
Keep the `<html>`/`<body>`/font-class setup; wrap children:
```tsx
import { AppShell } from "@/components/AppShell";
// ...
<body>
  <AppShell>{children}</AppShell>
</body>
```
`AppShell` is a client component with server-rendered `children` passed through
as a prop — the standard, allowed pattern; `children` (the route pages) stay
server components.

### AppShell
- `index.tsx`: add `"use client"` at the top (the state lives here).
  ```tsx
  "use client";
  import type { ReactNode } from "react";
  import { useAppShell } from "./hook";
  import { Header } from "./components/Header";
  import { Aside } from "./components/Aside";
  import styles from "./style.module.scss";

  export function AppShell({ children }: { children: ReactNode }) {
    const { open, toggle } = useAppShell();
    return (
      <div className={styles.shell}>
        <Header sidebarOpen={open} onToggleSidebar={toggle} />
        <Aside open={open} />
        <main className={styles.main}>{children}</main>
      </div>
    );
  }
  ```
- `hook.ts`:
  ```ts
  import { useState } from "react";
  export function useAppShell() {
    const [open, setOpen] = useState(true);
    return { open, toggle: () => setOpen((o) => !o) };
  }
  ```
  `useState(true)` matches on server and client → no hydration mismatch. Sidebar
  collapse state is not persisted — `// ponytail: no persistence; add localStorage
  when someone asks`.
- `style.module.scss`: CSS grid with named areas; the aside column collapses to
  0 when the aside is hidden (task 02 hides it via the `hidden` attribute).
  ```scss
  @use "theme" as t;
  .shell {
    display: grid;
    grid-template-columns: auto 1fr;
    grid-template-rows: auto 1fr;
    grid-template-areas: "header header" "aside main";
    min-height: 100vh;
  }
  .main {
    grid-area: main;
    min-width: 0;
    padding: var(--space-6);
    background: var(--color-bg);
  }
  ```
  Header, Aside and `.main` claim their grid areas (`header`, `aside`, `main`).
  Header/Aside set `grid-area` in their own modules — document this named-area
  contract with a short comment in each.

### Header
- `index.tsx` (`"use client"`): a toggle `<button>` + the greeting.
  ```tsx
  <header className={styles.header}>
    <button
      type="button"
      className={styles.toggle}
      aria-label="Alternar menu"
      aria-expanded={sidebarOpen}
      aria-controls="app-sidebar"
      onClick={onToggleSidebar}
    >
      ☰
    </button>
    <p className={styles.greeting}>{greeting}</p>
  </header>
  ```
- `hook.ts`: compute the greeting **after mount** to avoid an SSR/client
  hydration mismatch (`new Date()` differs between server time and the browser's
  local time). Render empty on first paint, fill in on mount:
  ```ts
  import { useEffect, useState } from "react";
  import { getGreeting } from "./greeting.helper";

  export function useHeader({ sidebarOpen, onToggleSidebar }: {
    sidebarOpen: boolean; onToggleSidebar: () => void;
  }) {
    const [greeting, setGreeting] = useState("");
    useEffect(() => setGreeting(getGreeting(new Date())), []);
    return { greeting, sidebarOpen, onToggleSidebar };
  }
  ```
- `greeting.helper.ts`:
  ```ts
  export function getGreeting(date: Date): string {
    const h = date.getHours();
    if (h < 12) return "Bom dia";
    if (h < 18) return "Boa tarde";
    return "Boa noite";
  }
  ```
- `greeting.helper.test.ts` (Vitest — mirror `src/styles/tokens.test.ts` /
  `src/app/api/health/service.test.ts` style): assert the boundaries with
  `new Date(2020, 0, 1, hour)` — 0 & 11 → "Bom dia"; 12 & 17 → "Boa tarde";
  18 & 23 → "Boa noite".
- `style.module.scss`: `grid-area: header;` flex row, `align-items: center`,
  `gap: var(--space-4)`, `padding: var(--space-3) var(--space-6)`,
  `border-bottom: var(--border-1) solid var(--color-border)`,
  `background: var(--color-surface)`. Toggle button: square-ish, transparent
  background, `border-radius: var(--radius-md)`, `color: var(--color-text)`,
  `cursor: pointer`, `&:focus-visible { @include t.focus-ring; }`, and a subtle
  `&:hover { background: var(--color-surface-raised); }` — keep hover in the
  stylesheet, never as an inline style (a prior bug: an inline style on the same
  property silently beats `:hover`). Greeting: `font-family: var(--font-mono)`,
  `font-size: var(--text-lg)`, `font-weight: var(--weight-medium)`,
  `color: var(--color-text)`.

### Aside
- `index.tsx` (`"use client"`): the root element is `<aside>` (owner asked for an
  `aside`); hide the whole thing with the `hidden` attribute when closed so it
  leaves the layout and the a11y/tab tree cleanly.
  ```tsx
  <aside
    id="app-sidebar"
    className={styles.aside}
    aria-label="Navegação principal"
    hidden={!open}
  >
    <nav>
      <ul className={styles.top}>
        {topItems.map((it) => (
          <NavItem key={it.href} {...it} active={pathname === it.href} />
        ))}
      </ul>
      <ul className={styles.bottom}>
        <NavItem {...bottomItem} active={pathname === bottomItem.href} />
      </ul>
    </nav>
  </aside>
  ```
- `hook.ts`:
  ```ts
  import { usePathname } from "next/navigation";
  export function useAside() {
    const pathname = usePathname();
    const topItems = [
      { href: "/", label: "Dashboard" },
      { href: "/movimentacoes", label: "Movimentações" },
      { href: "/recorrencias", label: "Recorrências" },
    ];
    const bottomItem = { href: "/configuracoes", label: "Configurações" };
    return { topItems, bottomItem, pathname };
  }
  ```
  Active match is exact equality (`pathname === href`). `// ponytail: exact match;
  switch to startsWith when nested routes appear`.
- `style.module.scss`: `grid-area: aside;` `display: flex; flex-direction:
  column; width: 240px;` (`// ponytail: fixed sidebar width — the DS has no size/
  width scale yet; promote to a --size-* token if more fixed widths appear`),
  `border-right: var(--border-1) solid var(--color-border)`,
  `background: var(--color-surface)`, `padding: var(--space-4)`. `.top` and
  `.bottom` are `<ul>` resets (`list-style: none; margin: 0; padding: 0; display:
  flex; flex-direction: column; gap: var(--space-1)`); put `margin-top: auto` on
  `.bottom` so Configurações pins to the bottom. The two `<ul>`s live in a flex
  `<nav>` that fills the aside height — make `nav { display:flex; flex-direction:
  column; flex: 1; }`.

### NavItem (recursion child, rendered 4×)
- `index.tsx`:
  ```tsx
  <li>
    <Link
      href={href}
      className={styles.link}
      aria-current={active ? "page" : undefined}
    >
      {label}
    </Link>
  </li>
  ```
  Import `Link` from `next/link`.
- `hook.ts`: passes `{ href, label, active }` through (keeps `index.tsx`
  logic-free per the convention).
- `style.module.scss`: `.link` → `display: block; padding: var(--space-2)
  var(--space-3); border-radius: var(--radius-md); color: var(--color-text);
  font-family: var(--font-mono); font-size: var(--text-base); text-decoration:
  none;`. `&:hover { background: var(--color-surface-raised); }`.
  `&:focus-visible { @include t.focus-ring; }`. Active state via the attribute:
  `&[aria-current="page"] { background: var(--color-brand); color: var(--white); }`.

### Accessibility checklist (must all hold)
- Toggle `<button type="button">` has `aria-label`, `aria-expanded={open}`,
  `aria-controls="app-sidebar"`, and a visible focus ring.
- `<aside id="app-sidebar" aria-label="Navegação principal">` is the
  `aria-controls` target; `hidden` when closed removes it from the tab order.
- The active link carries `aria-current="page"` and a non-color-only cue is not
  required here (text label present), but keep the focus ring on every link.

## Verification
- `npm run lint` — Biome all-green (line caps, formatting, unused imports).
- `npm run test` — the greeting helper test passes (`vitest run`).
- `npm run build` — compiles.
- `npm run dev`, then in the browser:
  - `/` renders the shell with `<h1>Dashboard</h1>` inside `<main>`.
  - The header toggle hides/shows the aside; `<main>` reflows to full width when
    hidden; the button's `aria-expanded` flips.
  - Each nav link navigates and its target renders only its `<h1>`; the current
    link is highlighted and has `aria-current="page"`.
  - The greeting appears and matches the time of day.
  - Toggle dark mode (set `data-theme="dark"` on `<html>` via devtools, or use an
    OS dark preference) — colors flip via tokens with readable contrast.
  - Tab through: the toggle button and each link show a focus ring.
