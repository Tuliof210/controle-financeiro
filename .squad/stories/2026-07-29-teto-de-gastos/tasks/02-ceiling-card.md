# One figure the card can defend, and bars showing what survives it

## Outcome
- A card titled "Teto de Gastos" leads with a single labelled figure — the
  monthly ceiling, with its `/sem` and `/dia` splits — above the month list.
- Each month's bar is the share of that month's own projected balance that
  survives the ceiling. The month that pins it is the shortest bar and reads
  20%. Future months stay hatched.
- With no ceiling, the card names the first month that closes in the red and
  the size of the hole, and shows no bars.
- The tooltip describes the new arithmetic and states the horizon the figure
  is valid for. No copy anywhere still calls this "folga".

## Context
Task 01 has already reshaped the payload; read the type it landed before
anything else. `monthly > 0` guarantees every `cumulative` in the series is
positive, so the bar's divisor is safe without a guard beyond what
`sharePercent` already does.

- **Imitate `StatCard/index.tsx`** for the headline — it is the in-`SectionCard`
  version of the hero figure, unlike `HeroCard`, which inverts the surface and
  is a full-width headline:

  ```tsx
  <dl className={styles.headline}>
    <dt className={styles.caption}>Valor total no período</dt>
    <dd className={`${styles.total} ${tone ? styles[tone] : ""}`}>{total}</dd>
  </dl>
  ```

  and honour the comment beside it: *"The headline is a labelled figure like
  the other four, not a bare number — otherwise the biggest value on the card
  is the only one a screen reader announces without a name."* `HeroCard`'s
  `.factValue` + `.factSub` pair (`--text-md` bold beside `--text-xs` at .7
  opacity) is the idiom for hanging `/sem` and `/dia` off the big number.
- **Reuse** `sharePercent` in `DashboardScreen/list-cards.helper.ts`:
  `export function sharePercent(value: number, max: number): number` — returns
  `max > 0 ? (value / max) * 100 : 0`. The denominator here is the month's own
  `cumulative`, not the largest bar in the list.
- **Reuse `MeterRow`**, unchanged. Props verbatim:

  ```ts
  export type MeterRowProps = {
    label: string;
    percent: number;   // may exceed 100 — the bar clamps, the caller's text does not
    tone: "positive" | "negative";
    srLabel: string;
    children: ReactNode;
    projected?: boolean;
  };
  ```

  `tone` is a CSS-Modules string lookup (`styles[tone]`), so renaming
  `.positive`/`.negative` kills the colour with no compile error.
- **The hatch has no payload field.** `MeterRow/hook.ts:12-15`: *"Derived by
  the card from `month > range.current` — the payload marks no month itself."*
  `SlackCard/hook.ts:22` does `projected: month.month > current` (strictly
  greater, so the current month is not hatched) and `current` is threaded from
  `ProjectionTab/hook.ts`: *"It lives on the range, not on the rows, so the tab
  is the one place that reads it."* Keep that thread; the series still carries
  `month` for it.
- **Reuse `useShowAll`** (`DashboardScreen/show-all.hook.ts`) for the month
  list exactly as today: `CAP = 8`, chip `Ver todos (N)` / `Mostrar menos`,
  `hidden` meaning *there are hidden rows, render the button*. Shared with
  `LimitCard` — do not touch `CAP`.
- **The lie to delete** is `SlackCard/index.tsx:14-19` — the title `"Folga de
  gastos"` and the empty state *"Sem folga no período: o saldo acumulado
  projetado não cobre gastos adicionais."* The note about `SectionCard` taking
  no header action still holds: the chip right-aligns itself inside the body.
- **`HINTS.slack` (`hints.ts:43-49`) is wrong wholesale**, not stale in
  places: *"80% do menor saldo acumulado de ali até o fim do período… A barra é
  a folga do mês comparada à do mês mais folgado da lista."* Both clauses now
  describe something that no longer exists. `hints.ts` is 68 lines against a
  100 cap and the current entry spends 7 of them.
- **Two more copy sites break silently**, with no type error:
  `GoalsTab/hook.ts:17-18` (`"guardando 25% da menor folga do período"` /
  `"sem folga projetada no período"`) and `HINTS.goals` at `hints.ts:58-67`
  (*"25% da menor folga do período…"*). Both are now 25% of the ceiling. Fix
  the words only.
- **Money formatting**: `formatMoney` → `R$ 1.234,56`, used by the card today
  for all three figures; `formatMoneyShort` → `R$ 1.234`, what `HeroCard` and
  `GoalCard` use for big figures. `formatYyyymm` → `"Ago/26"`.
- **Watch the file cap.** `SlackCard/hook.ts` is 36 lines and grows most;
  `index.tsx` 47, `style.module.scss` 13. When a hook nears 100 the repo
  extracts a sibling `*.helper.ts` (precedent: `GoalCard/timeline.helper.ts`);
  it never moves logic into `index.tsx`.

## Scope
- In: `SlackCard/` (renaming the folder to match the new title is expected),
  `ProjectionTab/index.tsx` and `hook.ts` for the import, `hints.ts`,
  `GoalsTab/hook.ts` captions.
- Out: `MeterRow/`, `MeterList/`, `show-all.hook.ts`, `list-cards.helper.ts`,
  `SectionCard/` — all reused as they are. `GoalCard/` and `goals.helper.ts`:
  the Objetivos card's layout and arithmetic are a separate story, only its
  wording changes here.

## Verify
- `npm run lint`, then `npx tsc --noEmit` — this task is where the tree goes
  green again after 01.
- Drive the browser preview to the dashboard's Projeção tab. Read the hero
  figure and, from the same `/api/dashboard` response in the network panel,
  confirm it equals `ceiling.monthly` and that each bar's width equals
  `remaining / cumulative` for its month.
- Confirm the tightest month is the shortest bar and measures 20%, that months
  after the current one are hatched and the current one is not, and that the
  "Ver todos" chip still expands past 8 months.
- Force the empty state (an owner whose projection goes underwater) and confirm
  the named month and shortfall match `firstRed`, with no bars rendered.
- `wc -l` every touched file, stylesheets included.

## Forbidden
- A per-month total, weekly or daily figure. The splits belong to the one
  headline; repeating them per row rebuilds the bug this story removes.
- Making the bar relative to the largest bar in the list. The denominator is
  each month's own projected balance — that is what makes the pinning month
  read 20%.
- A bare number as the headline, unlabelled.
- Editing `MeterRow` to accept the new shape. If it does not fit, the card
  adapts, not the shared row.
- Leaving the word "folga" anywhere in `src/`.
