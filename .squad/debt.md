# Debt — <project>

A place in the code that is knowingly wrong and that nobody is fixing now. Two
sources, no others: a review finding the owner declined, and a shortcut the
implementation took on purpose. Both are decisions someone already made — this file
only stops them from being made again, at full price, every round.

Not learnings. A learning is a rule for code that does not exist yet and points at no
line. Debt points at a line — that is the whole test: **can you name the file, it is
debt; can you not, it is a learning.** Not a task either: what is being fixed is a
task, debt is what was declined. Not a `window:`: a window already has the task that
closes it and `ps-check.sh` blocks the merge until it lands. Nothing here has a
closer, which is exactly why each entry has to say what would earn it one.

No cap — debt grows honestly and capping it would only make the file lie. It is kept
short another way: `sh .claude/ps-check.sh` flags an entry whose path no longer
exists (the code went away, the debt went with it) and one with no `until` (a debt
that cannot say what would make it worth paying is a wish, not a debt). An entry
leaves by being fixed, or by the code being deleted — never by being reworded.

Format: `- [<path>:<line-or-symbol>] <what is wrong>, until <what earns it a fix> (YYYY-MM-DD)`

---

- [prisma/schema.prisma:OfxImport] nothing links a movement back to the import that wrote it and nothing clears a `fileHash`, so deleting the imported rows on /movimentacoes leaves that statement permanently unimportable — the owner declined an undo when the story was scoped, until wanting to re-import a statement after correcting it (2026-07-28)
- [e2e/row-columns.spec.ts:95] `aligns its columns` reads which collapse tier the browser chose and asserts against that choice, so nothing reddens if RowGrid's 439px or 279px thresholds move — deliberate, so a moved threshold changes what is asserted instead of breaking it, until a spec pins the thresholds themselves (2026-07-29)
- [src/components/EntryRow/index.tsx:37] the metadata line shows `Owner · Interval(s)` where the design and task 03 both specify a duration too (`24 meses`) — dropped as the line is already tight at 375px and the duration is derivable from the intervals beside it, until the line gains room (2026-07-29)
- [src/components/EntryScreen/components/Sections/style.module.scss:31] the two-column container query only guarantees a post-split column stays above RowGrid's one-line floor, not that it stays above the single-column width it replaces — measured on /previsoes, a row is 683px wide at 768px (single column) and 640px at 1440px (two columns), narrower after growing — until the query also compares against the pre-split width, not just the floor (2026-07-29)
- [src/components/RowGrid/style.module.scss:63, _gutter.scss:7] two separate `[data-cell="who"]` rule blocks (one setting `margin-inline-start: 0` in `_gutter.scss`, one setting `grid-area: who` in `style.module.scss`) could be one — split across files by the 100-line-cap fix in PR #83, cosmetic only, until someone merges them without pushing either file back over its own cap (2026-07-29, found in PR #83 review)
- [e2e/interval-lock.spec.ts:1] 119 lines against the 100-line cap, so Biome reports a 5th over-cap info — splitting into another SPEC file would raise Playwright's worker count and load every other spec harder, until `OWNER_NAME`/`FORECAST_NAME`/`beforeAll`/`openAddExpense` move to a new `e2e/interval.helper.ts`, which is not a spec and leaves the worker count alone (2026-07-29, found in PR #89 review)
- [src/app/previsoes/_components/ForecastsScreen/components/ForecastForm/components/IntervalList/components/IntervalCard/style.module.scss:26] `.eyebrow` and `.lock` each repeat the same five-declaration micro-label block (mono, `--tracking-wide`, `--color-text-muted`, uppercase, small size) that `DashboardScreen/components/Headline`'s `.caption` already holds, and `.eyebrow` sets `--text-xs` where every other eyebrow in the repo uses `--text-2xs` — until one local mixin holds the five, which also gives back the room the 100-line cap took when `_checkbox.scss` and `_summary.scss` split off (2026-07-29, found in PR #89 review)
- [src/app/previsoes/_components/ForecastsScreen/components/ForecastForm/components/IntervalList/components/IntervalCard/style.module.scss:5, src/app/previsoes/_components/ForecastsScreen/components/ForecastForm/components/IntervalList/components/IntervalCard/_summary.scss:5] both comments name the surface-tier direction backwards, and in opposite directions about the same token pair — the card is `--color-surface`, one tier BELOW the modal's `--color-surface-raised`, and the strip is one tier ABOVE the card — what renders is correct in both themes, only the prose misleads, until someone next edits either file (2026-07-29, found in PR #89 review)
- [src/components/Tooltip/style.module.scss:@include t.bp("md")] from `md` up the hint bubble is still centred on its trigger with no collision detection, so `/` overflows 12px horizontally at exactly 1024px, where `.kpis` goes to three columns and the rightmost StatCard's tooltip sits close enough to the edge to spill — identical on `main`, found only because this story put `/` under the same measurement as the other routes, and left alone because a review fix must not quietly repair a neighbouring defect; `"/"` cannot join `ROUTES` in `e2e/row-overflow.spec.ts` until it goes, until CSS anchor positioning (`position-try`) ships in Safari or the bubble pins below `xl` rather than `md` (2026-07-30, found in PR #90 review)
