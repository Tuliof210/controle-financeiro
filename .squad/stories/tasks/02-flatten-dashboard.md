# Flatten the dashboard into a single scroll

## Outcome
- No tab bar on `/`. Nothing on the dashboard is reachable only by clicking.
- One column, in this order: HeroCard, the three StatCards, "Evolução mensal",
  "Saldo acumulado", "Teto de Gastos", the savings-capacity banner, the goal
  cards.
- The e2e suite is green without any tab click.

## Context
Three tab panels become two role-named sections plus one card.

- **Delete** `components/TabBar/` (3 files, only consumer `Board/index.tsx:4,13`)
  and `components/ProjectionTab/` (3 files). ProjectionTab's `.tab` grid existed
  only to sit CeilingCard beside LimitCard at `md`; with LimitCard gone
  (task 01) a lone card needs no grid, so `Board` renders `<CeilingCard>`
  directly. Move ProjectionTab's two derivations into `Board/hook.ts` verbatim:
  ```ts
  ceiling: data.ceiling,
  // Both cards mark a month as projected by comparing it to this.
  current: data.range.current,
  ```
- **Rename** `components/GeneralTab/` → `components/Overview/` and
  `components/GoalsTab/` → `components/GoalsSection/`, renaming their exported
  symbols and prop types to match (`GeneralTabProps` → `OverviewProps`, etc.).
  A folder called `*Tab` on a screen with no tabs is a lie; the file cap makes
  merging their JSX into `Board/index.tsx` impossible anyway.
- **`Board` becomes the flat column.** Its `.board` rule is today
  `display:flex; flex-direction:column; gap: var(--space-6)` — identical to
  `DashboardScreen`'s `.screen`, to `GeneralTab`'s `.tab` and to `GoalsTab`'s
  `.tab`. Keep exactly one of those nested duplicates per surviving component;
  do not keep all four. **Do keep** `GeneralTab .kpis` (3 columns at `lg`) and
  `GoalsTab .grid` (2 columns at `md`) — neither is expressible by the parent
  column, and both use `minmax(0, 1fr)` deliberately (a bare `1fr` is what once
  pushed this page past 375px; see the comments in those files).
- **Delete the tab state**: `DashboardTab` and `useState<DashboardTab>("geral")`
  in `DashboardScreen/hook.ts`, the `tab`/`onSelectTab` it returns, the props
  threaded through `DashboardScreen/index.tsx:12,51`, and `LABELS`/`tab`/
  `onSelect` in `Board/hook.ts`. **`BoardData` must survive** in `Board/hook.ts`
  — Overview, GoalsSection and HeroCard all import it.
- **Reuse** `SectionCard` (`src/components/SectionCard`) if a heading is needed:
  `{ title, icon?, tone?, hint?, children }`, renders an `<h2>` plus a Tooltip
  named `Como ${title} é calculado`. The capacity banner currently hand-rolls
  that with `.eyebrowRow` + `<Tooltip>`; leaving it as-is is fine, but note the
  banner's `--color-surface-raised` background is what earns its `.eyebrow`
  contrast — dropping it inside a SectionCard (`--color-surface`) would break
  the ratio its own comment documents.
- **e2e, the one guaranteed failure**: `e2e/ceiling-page.helper.ts:33`
  ```ts
  await page.getByRole("button", { name: "Projeção" }).click();
  ```
  Delete that line. Nothing else downstream changes — `cardOf` scopes by the
  "Teto de Gastos" heading, not by a tab. Rename `openProjection` to match
  what it now does.
- **Watch out for** `e2e/ceiling.spec.ts:44,78,108`, which use
  `card.getByRole("img")` — including a `toHaveCount(0)` assertion. GoalCard's
  progress bar is also `role="img"` and now renders on the same page, so those
  locators stay correct **only** because they are scoped to `card`. Do not
  "simplify" `cardOf` away.
- **Watch out for** `styles.fact` in `GoalsTab/index.tsx:34,38`: there is no
  `.fact` rule, so it renders `class="undefined"` today. Pre-existing and
  harmless — carry it or clean it, but do not invent a `.fact` rule, which
  would shift spacing.

## Scope
- In: everything under `src/app/_components/DashboardScreen/`,
  `e2e/ceiling-page.helper.ts`.
- Out: the payload (`src/app/api/dashboard/`), the goal card's contents
  (tasks 03 and 04), `/configuracoes`.

## Verify
```
npm run lint
npm run build
npm run test
```
Then, with the dev server running, confirm by eye that `/` renders every
section in the order named in Outcome and that no `button` announces a tab.

## Forbidden
- Do not add a `?tab=` search param or any other way to hide a section —
  `DashboardScreen/hook.ts:18-21` records why this screen has no deep linking.
- Do not delete `HeroCard`, `StatCard`, `ChartCard`, `ChartFrame`,
  `MonthlyBarChart` or `BalanceLineChart`; they move, they do not change.
- Do not change what any card computes. This task is structure only.
