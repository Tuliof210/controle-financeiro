# Drop the average spending hypothesis

## Outcome
- The Teto de Gastos card shows ONE headline and a 4-column table (Mês, Saldo
  acum., Teto do mês, Sobra). No copy anywhere on the dashboard says "média dos
  tetos" or "gastar a média".
- The dashboard payload no longer carries `Ceiling.average`,
  `CeilingMonth.averageBalance` or `CeilingMonth.averageLeft`.
- The savings-capacity banner and the goal projections are numerically
  UNCHANGED by this task.

## Context

**The average is a payload field, not a computed view.** Delete it at the source
and TypeScript walks you to every consumer.

- `src/app/api/dashboard/ceiling-scenarios.helper.ts` — delete the whole file.
  Its `withAverage` is the only producer of the two average fields, and
  `CeilingSpend.cumulative` exists solely to feed it:
  `return spends.map(({ cumulative, ...spend }, index) => ({ ...spend, averageBalance: cumulative - monthly * index, averageLeft: cumulative - monthly * (index + 1) }));`
  Move `CeilingSpend` into `ceiling.helper.ts` minus `cumulative`, or drop the
  type and push `CeilingMonth` objects directly — `buildCeiling` stops needing a
  second pass at all (`months: spends` instead of `withAverage(...)`).
- `src/app/api/dashboard/ceiling.helper.ts` is **exactly 100 lines — the hard
  cap**. Lines that go: the `withAverage` import (2), `const average = rates(...)`
  (83), `average,` (87), the `withAverage(...)` call (92), and the comment block
  at 79-82 explaining why `savingPace` recomputes its own quotient. Task 02 needs
  the headroom this frees, so do not spend it.
- **`savingPace` does NOT read `ceiling.average`** — it recomputes off
  `ceiling.months`: `const total = ceiling.months.reduce((sum, month) => sum + month.budget, 0); return Math.floor(total / (PACE_DIVISOR * ceiling.months.length));`
  So pace and goals are untouched. Do not "simplify" `pace.helper.ts` back into
  `ceiling.helper.ts` — its own header records that the merge breaks the cap.
- **`CeilingCard/hook.ts` (89 lines)** loses `averageSpend`, the `average:` branch
  of the row map, and three `hero` fields — plus `ratio`, which is average-derived:
  `ratio: \`${(monthly / average.monthly).toFixed(1).replace(".", ",")}× a média\``.
- **Re-home the `monthsLeft` chip.** It renders only inside the dying
  `<Headline caption="Média dos tetos">`, and `e2e/ceiling-expect.helper.ts:27`
  asserts it. Hang it on the surviving headline (which loses `ratio`, so its chip
  slot is free). `Hero/style.module.scss` then loses its whole
  `.hero > :last-child` block (the divider between two headlines) and the `md`
  two-column `grid-template-columns` — one child needs neither.
- **Column-position rules to re-index.** `MonthTable/style.module.scss:54-57`
  and `_stacked.scss` both key off `tbody td:nth-child(2), tbody td:nth-child(5)`.
  Cell 5 no longer exists; cell 2 no longer separates anything from anything.
  `_groups.scss` loses `.toAverage`, the `& + &` rule inside `.table .group`, and
  — since one group strip labelling one group says nothing — probably `.group`,
  `.dot` and `.toCeiling` with the whole `<thead>` group row. `.table .month` and
  `.current` must survive; if what is left fits under the 100-line cap, fold
  `_groups.scss` back into `style.module.scss` rather than keeping a partial for
  two rules.
- **The four disambiguating `aria-label`s die with the second block** — their
  stated reason ("Four of the six headers read identically") is gone. That makes
  `ScenarioCells`' `blockLabel` prop pointless; the remaining `data-label`s can be
  literal. `ScenarioCells` is now rendered once — inline it back into `MonthTable`
  per ARCHITECTURE's recursion rule, provided both files stay under 100 lines.
- **`negative` becomes provably dead.** `CeilingCard/hook.ts:26-30` records why:
  a ceiling is floored against a suffix minimum at or below the month's own
  balance, so `ceilingLeft` can never go under 0 — only `averageLeft` could.
  Drop the flag and the `.negative` / `.mark` rules with it.
- **`hints.ts` `ceiling`** — everything after the first semicolon describes the
  deleted scenario: `"…Semanal e diário dividem esse valor por 4 e por 30. A média é o teto médio de todos os meses restantes; a tabela compara gastar o teto de cada mês com gastar essa média."`
  Rewrite the tail. Task 03 will add the cap sentence — leave room.
- **e2e.** Delete `e2e/ceiling-average.helper.ts` whole (58 lines), and with it
  `ceiling.spec.ts`'s import block and its last test
  (`test("the average is the mean of every month the card lists", ...)`). Rescue
  `expectHeadlineIsFirstRow` into `ceiling-expect.helper.ts`, reading
  `card.locator("dd").first()` directly instead of through the deleted `readHero`.
  In `ceiling-page.helper.ts`, `readMonths` reads cells positionally — drop
  `averageBalance: parseCents(row[4])`, `average: …row[5]`, `averageLeft: …row[6]`;
  `row[1..3]` are unchanged. In `ceiling-expect.helper.ts`, `expectScenarios`
  loses 4 of 6 assertions, INCLUDING the cross-scenario compounding check
  `expect(month.ceilingBalance - previous.ceilingLeft).toBe(month.averageBalance - previous.averageLeft)`.
  Replace it with its ceiling-only equivalent — `month.ceilingBalance` equals the
  previous month's `ceilingLeft` — or the accumulator loses its only coverage.
- **Nothing else named "média"/"average" may change**: `Stats.mean`/`median`,
  `HeroCard`'s `média R$ x/mês` subtitles, `SavingsSection`'s
  `"25% da média dos tetos do período"` (that is `pace`), and every `@media`
  query.

## Scope
- In: `src/app/api/dashboard/ceiling*.ts`, everything under
  `src/app/_components/DashboardScreen/components/CeilingCard/`, `hints.ts`,
  `e2e/ceiling*.ts`.
- Out: `pace.helper.ts`, `goals.helper.ts`, `series.helper.ts`,
  `SavingsSection/`, `Overview/`, `src/generated/`, and the 80% cap itself —
  task 02 owns it. `buildCeiling`'s signature does not change here.

## Verify
- `npm run lint` — must not add a `noExcessiveLinesPerFile` info; main has 5.
- `wc -l` every touched file, `.scss` included (Biome never reads Sass).
- `npm run build`
- `npm test`
- `grep -rn "média\|average\|Average" src/app e2e/` — the only survivors are the
  ones the Context lists as untouchable.
- The stacked breakpoint is a MEASUREMENT tuned for 7 columns (`_stacked.scss`:
  "The table's intrinsic width with the current data is 799px; 839 leaves ~40px").
  With 4 columns it is stale. Re-measure in the browser at the card's narrowest
  layout, then set `@container (max-width: …)` from what you measured and rewrite
  the comment with the new figures. Do not guess, and do not delete the stacked
  tier — at 375px a 4-column money table still cannot fit.

## Forbidden
- Do not change any figure the card produces for the ceiling scenario. The
  budgets, `ceilingBalance` and `ceilingLeft` are byte-identical after this task.
- Do not touch `pace`, `goals`, or the savings banner's numbers or copy.
- Do not add a new `e2e/*.spec.ts` file — worker count scales with spec FILES and
  the suite's geometry specs redden under it.
