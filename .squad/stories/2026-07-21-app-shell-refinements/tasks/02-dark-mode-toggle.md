# Dark-mode toggle (persistent, no flash)

## Description
Add a two-state (light/dark) dark-mode toggle to the header. The choice persists
to `localStorage` and, when unset, initializes from `prefers-color-scheme`. A
pre-paint inline script in the root layout applies the theme before first paint so
there is no theme flash. This task also introduces `lucide-react` (the story's
chosen icon library) and uses it for the toggle's sun/moon icon and — for
consistency now that the lib is present — swaps the header's `☰` hamburger glyph
for a lucide `Menu` icon.

The token layer already supports theming: `[data-theme="dark"]` on `<html>`
overrides the light defaults, and `:root:not([data-theme="light"])` under
`@media (prefers-color-scheme: dark)` covers the no-explicit-choice case
(`src/styles/_tokens.scss`). So the toggle's only job is to set/clear the
`data-theme` attribute on `document.documentElement` and remember the choice.

## When to run
- Depends on: 01 (builds on the finalized header structure/styles from task 01).
- Parallel-safe with: none in practice — installs `lucide-react`, which task 03
  also needs, so run 02 before 03.

## How-to

Conventions: component = `index.tsx` (logic-free) + `hook.ts` + `style.module.scss`;
tokens only; ≤100 lines/file. Tests run in a **node** environment (no jsdom
configured), and the toggle's only logic is a trivial string flip — so **no unit
test** here; the behavior (persistence + no flash) is verified in the browser.

### 1. Install the dependency
`npm install lucide-react` (from the worktree root). It supports React 19 / Next 16.
Confirm it lands in `dependencies` in `package.json` and that `package-lock.json`
updates.

### 2. Pre-paint theme script — `src/app/layout.tsx`
Add an inline IIFE as the **first child of `<body>`**, and add
`suppressHydrationWarning` to the `<html>` element (the script mutates
`data-theme` on `<html>` before React hydrates, which would otherwise log an
attribute-mismatch warning):
```tsx
const THEME_INIT = `(function(){try{var s=localStorage.getItem('theme');var t=s||(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`;

// ...
<html lang="en" suppressHydrationWarning className={`${pressStart2P.variable} ${jetBrainsMono.variable}`}>
  <body>
    {/* biome-ignore lint/security/noDangerouslySetInnerHtml: pre-paint theme init to avoid FOUC */}
    <script dangerouslySetInnerHTML={{ __html: THEME_INIT }} />
    <AppShell>{children}</AppShell>
  </body>
</html>
```
Note on Biome: `dangerouslySetInnerHTML` may trip `noDangerouslySetInnerHtml`. If
lint flags it, run `npx biome explain <rule>` to confirm the exact rule id/group
(it can shift across Biome releases — see `.squad/learnings.md`) and adjust the
`biome-ignore` line to match. This is the standard, safe theme-init pattern (a
static string, no user input).

### 3. ThemeToggle component — new folder
`src/components/AppShell/components/Header/components/ThemeToggle/`

`hook.ts` — read the theme the inline script already set, then flip on click:
```ts
import { useEffect, useState } from "react";

export function useThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark" | null>(null);

  useEffect(() => {
    const current = document.documentElement.getAttribute("data-theme");
    setTheme(current === "dark" ? "dark" : "light");
  }, []);

  const toggle = () => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      try {
        localStorage.setItem("theme", next);
      } catch {}
      return next;
    });
  };

  return { theme, toggle };
}
```

`index.tsx` — render sun when dark (click → light) / moon when light (click →
dark). `theme` is `null` until mount; render a fixed-size empty slot then, to keep
the button from resizing (mirrors the greeting's after-mount pattern and avoids a
hydration mismatch on the icon):
```tsx
"use client";

import { Moon, Sun } from "lucide-react";
import { useThemeToggle } from "./hook";
import styles from "./style.module.scss";

export function ThemeToggle() {
  const { theme, toggle } = useThemeToggle();

  return (
    <button
      type="button"
      className={styles.toggle}
      onClick={toggle}
      aria-label={theme === "dark" ? "Ativar tema claro" : "Ativar tema escuro"}
    >
      {theme === null ? (
        <span className={styles.slot} aria-hidden />
      ) : theme === "dark" ? (
        <Sun size={20} aria-hidden />
      ) : (
        <Moon size={20} aria-hidden />
      )}
    </button>
  );
}
```

`style.module.scss` — same button look as the header's sidebar toggle (transparent,
no radius, hover surface, focus ring), pushed to the far right of the header:
```scss
@use "theme" as t;

.toggle {
  margin-left: auto; // header-level positioning; the "no margin" rule is nav-link-scoped
  border: none;
  background: transparent;
  color: var(--color-text);
  line-height: 1;
  padding: var(--space-2);
  cursor: pointer;

  &:hover {
    background: var(--color-surface-raised);
  }
  &:focus-visible {
    @include t.focus-ring;
  }
}

.slot {
  display: block;
  width: 20px;  // ponytail: matches lucide size={20}; no size-scale token yet
  height: 20px;
}
```
`// ponytail: this toggle and the header's sidebar toggle share a look — extract a
shared Button component only if a third icon-button appears.`

### 4. Header wiring — `src/components/AppShell/components/Header/`
- `index.tsx`: import `{ Menu }` from `lucide-react` and `{ ThemeToggle }` from
  `./components/ThemeToggle`. Replace the `☰` text child of the sidebar-toggle
  button with `<Menu size={20} aria-hidden />` (keep the button, its
  `aria-label`, `aria-expanded`, `aria-controls`, `onClick`). Render
  `<ThemeToggle />` as the **last** child of `<header>`, after the greeting.
- `style.module.scss`: no structural change needed — `.header` is already
  `display:flex; align-items:center; gap:…`, and `ThemeToggle`'s `margin-left:auto`
  pushes it to the right. If the menu-toggle icon needs vertical centering, ensure
  `.toggle` keeps `display:flex; align-items:center` (add if the glyph→icon swap
  leaves it misaligned).

## Verification
- `npm run lint` — green (resolve the `noDangerouslySetInnerHtml` suppression as
  in step 2 if it fires).
- `npm run test` — green (no new tests; existing suite unaffected).
- `npm run build` — compiles with `lucide-react` imported.
- Browser (start `next dev` manually in the worktree on a spare port, then
  `preview_start {url}` — see `.squad/learnings.md`):
  - Header shows the menu icon + greeting on the left and the sun/moon toggle on
    the right.
  - Click the toggle: theme flips; icon and `aria-label` swap; `<html>`'s
    `data-theme` changes (check via devtools).
  - Reload: the chosen theme persists (localStorage) **and there is no flash** of
    the other theme before paint. Test both directions (choose dark, reload;
    choose light, reload).
  - No hydration warnings in the console on load.
