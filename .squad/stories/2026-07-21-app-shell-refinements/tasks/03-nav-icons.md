# Nav menu icons

## Description
Give each nav item a `lucide-react` icon to the left of its label. The icon uses
`currentColor` (lucide's default `stroke`), so it inherits the link's color across
resting/hover/active/theme with no extra work.

## When to run
- Depends on: 02 (needs `lucide-react`, installed there). File-wise this task is
  independent of 02 (it touches Aside/NavItem, not the header), but it must run
  after 02 so the dependency exists.
- Parallel-safe with: none (chained after 02).

## How-to

Conventions: `index.tsx` logic-free; `hook.ts` holds data; tokens only; ≤100
lines/file. No new logic worth a test — presentational only.

Icon mapping (lucide-react):
- Dashboard → `LayoutDashboard`
- Movimentações → `ArrowLeftRight`
- Recorrências → `Repeat`
- Configurações → `Settings`

### 1. Item data — `src/components/AppShell/components/Aside/hook.ts`
Import the icons and attach one to each item:
```ts
import { ArrowLeftRight, LayoutDashboard, Repeat, Settings } from "lucide-react";
import { usePathname } from "next/navigation";

const TOP_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/movimentacoes", label: "Movimentações", icon: ArrowLeftRight },
  { href: "/recorrencias", label: "Recorrências", icon: Repeat },
];

const BOTTOM_ITEM = { href: "/configuracoes", label: "Configurações", icon: Settings };

export function useAside() {
  const pathname = usePathname();
  return { topItems: TOP_ITEMS, bottomItem: BOTTOM_ITEM, pathname };
}
```

### 2. NavItem — `src/components/AppShell/components/Aside/components/NavItem/`
`hook.ts` — widen the props to carry the icon and pass it through:
```ts
import type { LucideIcon } from "lucide-react";

type UseNavItemProps = {
  href: string;
  label: string;
  active: boolean;
  icon: LucideIcon;
};

export function useNavItem({ href, label, active, icon }: UseNavItemProps) {
  return { href, label, active, icon };
}
```
`index.tsx` — render the icon before the label (alias the component to a
capitalized local so JSX treats it as a component):
```tsx
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { useNavItem } from "./hook";
import styles from "./style.module.scss";

type NavItemProps = {
  href: string;
  label: string;
  active: boolean;
  icon: LucideIcon;
};

export function NavItem(props: NavItemProps) {
  const { href, label, active, icon: Icon } = useNavItem(props);

  return (
    <li>
      <Link href={href} className={styles.link} aria-current={active ? "page" : undefined}>
        <Icon className={styles.icon} size={18} aria-hidden />
        <span>{label}</span>
      </Link>
    </li>
  );
}
```

### 3. NavItem styles — `src/components/AppShell/components/Aside/components/NavItem/style.module.scss`
Switch `.link` from `display: block` to a flex row so the icon and label sit inline;
keep everything else task 01 set (no radius, padding, mono, hover/active). Add an
`.icon` rule:
```scss
.link {
  display: flex;
  align-items: center;
  gap: var(--space-3); // internal icon↔label gap (not a between-links margin)
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

.icon {
  flex-shrink: 0;
}
```
The `size={18}` prop (not a CSS px) sets the icon box — `// ponytail: icon pixel
size has no token yet; promote to a --size-* token if a size scale appears`. lucide
strokes with `currentColor`, so the icon already flips to `--white` on the active
row and follows the theme — no color rule needed on `.icon`.

## Verification
- `npm run lint` — green.
- `npm run test` — green.
- `npm run build` — compiles.
- Browser (start `next dev` manually in the worktree on a spare port, then
  `preview_start {url}` — see `.squad/learnings.md`):
  - Every nav row shows its icon left of the label, vertically centered.
  - On the active row, the icon is the same light color as the label (verify it's
    not stuck dark — `currentColor` should make it `--white`).
  - Hover a row: icon + label share the hover foreground; corners stay square.
  - Check both light and dark themes.
