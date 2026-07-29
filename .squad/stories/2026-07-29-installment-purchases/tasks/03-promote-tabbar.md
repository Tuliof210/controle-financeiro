# TabBar stops belonging to the dashboard

## Outcome
- `TabBar` lives in `src/components/TabBar` and takes an arbitrary string id.
- The dashboard's three tabs still switch, still announce `aria-pressed`, and
  look identical — this task changes no pixel and no behaviour.

## Context

- **Why now.** ARCHITECTURE.md's Promotion rule: a component used from outside
  its current parent's scope moves to the nearest shared `components/` folder.
  Task 04 needs it from `/parcelamentos`.

- **The only coupling is the id type.** `src/app/_components/DashboardScreen/
  components/TabBar/hook.ts` is the entire file:

  ```ts
  import type { DashboardTab } from "../../hook";
  export type Tab = { id: DashboardTab; label: string; active: boolean };
  export type TabBarProps = { tabs: Tab[]; onSelect: (id: DashboardTab) => void };
  export function useTabBar({ tabs, onSelect }: TabBarProps) { return { tabs, onSelect }; }
  ```

  `DashboardTab = "geral" | "projecao" | "metas"` is declared in
  `DashboardScreen/hook.ts:6`. Generify to `<Id extends string>` — `Tab<Id>`,
  `TabBarProps<Id>` — so the dashboard keeps its narrow union at the call site
  and `/parcelamentos` brings its own.

- **Keep the a11y decision and its comment verbatim.** From
  `TabBar/index.tsx`:

  > Deliberately NOT the ARIA tabs pattern: `role="tab"` promises a roving
  > tabindex and arrow-key navigation, and claiming the role without
  > implementing it is worse than not claiming it. `aria-pressed` buttons are
  > announced correctly and keyboard-operable with no extra code.

  `role="tab"` / `aria-selected` appear nowhere in `src/` — do not introduce
  them. The wrapper is `<fieldset className={styles.bar} aria-label="Seções do
  painel">`; that label is dashboard-specific once shared, so it becomes a
  prop (task 04 passes the `/parcelamentos` one).

- **Move the stylesheet as-is.** `TabBar/style.module.scss` carries
  `min-height: 44px` per tab ("README rule 7(e) is a floor"),
  `&[aria-pressed="true"] { background: var(--color-text); color:
  var(--color-bg); font-weight: var(--weight-bold); }`, and deliberately no
  `overflow: hidden` so the focus ring survives. Preserve all three.

- **The consumer to update**, `DashboardScreen/components/Board/index.tsx`
  (19 lines) — only its import path and the new label prop change:

  ```tsx
  <TabBar tabs={tabs} onSelect={onSelect} />
  ```

  `Board/hook.ts` keeps `const LABELS: [DashboardTab, string][]` untouched.

- **Watch out for** Turbopack never seeing a Sass file created while it is
  running — after `git mv` of the `.module.scss`, `touch` it, or a running
  `npm run dev` fails with "Can't find stylesheet to import" that a `.next`
  wipe does not fix.

## Scope
- In: `src/components/TabBar/{index.tsx,hook.ts,style.module.scss}` (moved),
  `src/app/_components/DashboardScreen/components/Board/{index.tsx,hook.ts}`
  for the import and the label prop.
- Out: `DashboardScreen/hook.ts`'s `DashboardTab` union and the tab state
  itself — the local-state-over-`?tab=` decision documented there stands.
  No new tab, no changed label.

## Verify
- `npm run lint`, `npx tsc --noEmit`.
- `npm run dev` and click all three dashboard tabs; confirm the pressed tab
  still inverts (background `--color-text`, text `--color-bg`) and that
  `git status` shows the old folder gone, not copied.
- `npm run test` — `e2e/ceiling-page.helper.ts` drives this component through
  `page.getByRole("button", { name: "Projeção" }).click()`, so a regression in
  the button role or its accessible name reddens `ceiling.spec.ts`.
- `wc -l` every touched file.

## Forbidden
- Leaving a copy behind under `DashboardScreen/` — this is a move.
- `role="tab"`, `aria-selected`, or a roving tabindex.
- Widening the component while it is being moved: no icons, no counts, no
  variants. It gains exactly one prop (the `aria-label`) and one type
  parameter.
