# Three time-to-complete metrics per goal

## Outcome
- Each goal card shows its name, its target, and three lines — dedicated,
  parallel, one-at-a-time — each with a month count and the month it lands in.
- The goal cards are ordered cheapest target first.
- With a capacity of 0, all three lines read "ritmo zero" and no card claims a
  date.
- No progress bar, no percentage badge, no "o período cobre X de Y", no
  "precisaria de R$ X/mês" anywhere on the card.

## Context
The three questions, per the owner (2026-07-30), all answered from `pace`
(task 03) and the goals list.

- **The contract** replacing `GoalProjection` in `src/app/api/dashboard/types.ts`:
  ```ts
  // null exactly when the saving pace is 0 — the card renders "ritmo zero".
  export type GoalPace = { months: number; doneMonth: number } | null;

  export type GoalProjection = {
    id: string;
    name: string;
    targetCents: number;
    dedicated: GoalPace;  // A — the whole capacity, this goal alone
    parallel: GoalPace;   // B — capacity split evenly across every goal
    serialized: GoalPace; // C — whole capacity, one goal at a time, cheapest first
  };
  ```
- **The arithmetic**, in `src/app/api/dashboard/goals.helper.ts`. Sort by
  `targetCents` ascending FIRST (`Array.sort` is stable, so ties keep the
  repository's `createdAt` order — the existing sort comment says exactly
  this), then, with `queued` the running sum of `targetCents` up to and
  including the goal:
  - A: `Math.ceil(targetCents / pace)`
  - B: `Math.ceil((targetCents * count) / pace)` — integers throughout; this is
    `ceil(target / (pace / count))` without ever forming a fractional share
  - C: `Math.ceil(queued / pace)`
  `Math.ceil`, never round: the existing comment states it —
  > "a wait always rounds UP, and a target smaller than one month's pace is
  > still one month, never zero."
- **`doneMonth` for each metric** is `addMonths(current, months - 1)`, reusing
  the rule already in `goals.helper.ts:44-49`: saving starts in the CURRENT
  month, so a one-month goal completes this month, not the next. `addMonths`
  (`src/lib/months.ts`) is `addMonths(value: number, count: number): number`
  and handles the December rollover arithmetically.
- **No period clamp.** The owner's decision: a metric landing after the end of
  the global period still shows its month. Drop "ALÉM DO PERÍODO" and every
  test for `months <= monthsAhead` — `monthsAhead` and `accruedCents` and
  `neededCents` all die with it, along with the `Horizon` type's reason to
  carry `monthsAhead` at all (keep only what the three formulas need: `pace`,
  `current`, and the goal count).
- **The card.** `GoalCard/hook.ts` collapses to name, target and the three
  metrics. Dead once the bar goes: `percent`, `full`, `badge`, `covered`,
  `srLabel`, and the `sharePercent` / `formatMoneyShort` imports (`sharePercent`
  itself stays in `list-cards.helper.ts` — CeilingCard calls it).
  `timeline.helper.ts` loses `noteLabel` entirely (its non-null branch merely
  repeated what `etaLabel` already said) and its `formatMoney` import; keep one
  formatter for a metric line, singularising the way `etaLabel` does today:
  ```ts
  `~${months} ${months === 1 ? "MÊS" : "MESES"}`
  ```
- **The card's dead SCSS**: `.badge`, `.badgeFull`, `.covered`, `.track`,
  `.fill`, `.fillFull`, `.note`, and `.head` (whose only job is
  `justify-content: space-between` against the badge). `.card`, `.name`,
  `.icon`, `.iconFull`, `.eta` survive. Run `wc -l` on the file after editing.
- **Watch out for** the stale invariant comments this task invalidates:
  `types.ts:62-64` ("the completion date, the meter's length and its colour can
  never tell three different stories"), `goals.helper.ts:44-49`, and
  `GoalCard/hook.ts:12-32` — all of them are about a meter that will not exist.
  `.squad/learnings.md` records that meter bug; leaving the comments pointing
  at a deleted meter is how it comes back.
- **Watch out for** `e2e/ceiling.spec.ts`, which asserts
  `card.getByRole("img")` counts. Removing GoalCard's `role="img"` bar only
  reduces the page's total; the assertions are card-scoped and must stay green.
- **Labels** — pt-BR, uppercase like the existing `.eta`: "DEDICADO",
  "EM PARALELO", "UM DE CADA VEZ". Each line reads `<label> ~N meses · Mmm/AA`,
  or `<label> RITMO ZERO` when the metric is null. Meaning must not be
  colour-only (`src/styles/README.md` rule 7) — these are words already, so no
  extra `aria-label` is needed once the `role="img"` bar is gone.

## Scope
- In: `src/app/api/dashboard/{types.ts,goals.helper.ts,payload.helper.ts}`,
  `src/app/_components/DashboardScreen/components/GoalCard/`, and the goals
  section's ordering/props.
- Out: the capacity figure itself (task 03), the capacity banner's two facts,
  CeilingCard, anything under `src/core/` or `src/infra/`.

## Verify
```
npm run lint
npm run build
npm run test
```
Then read the real payload instead of assuming: with the dev server up,
`curl -s 'http://localhost:3000/api/dashboard?owner=familia' | jq '.data.goals'`
— confirm `targetCents` is ascending, that `dedicated.months <=
serialized.months` for every goal, that they are equal for the first, and that
`parallel.months` is never smaller than `dedicated.months`.

## Forbidden
- Do not order the cards by anything but `targetCents` ascending — metric C is
  defined by that queue, and a list in a different order would contradict it.
- Do not reintroduce a coverage percentage under a new name. The owner replaced
  it with these three metrics because it was a fourth way of saying metric A.
- Do not special-case a goal already "achieved" — there is no savedCents, no
  contributions table, and nothing in the app records money set aside.
