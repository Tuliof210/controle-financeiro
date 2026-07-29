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
- [src/app/api/dashboard/goals.helper.ts:34] `accruedCents = pace * monthsAhead` became sound when `pace` turned into a share of a sustainable monthly rate, but nobody has decided that 25% of the ceiling is the right rate to offer — the number was inherited from the formula it replaced, until the owner revisits the Objetivos card (2026-07-29)
- [src/components/EntryScreen/components/Sections/style.module.scss:31] the two-column container query only guarantees a post-split column stays above RowGrid's one-line floor, not that it stays above the single-column width it replaces — measured on /recorrencias, a row is 683px wide at 768px (single column) and 640px at 1440px (two columns), narrower after growing — until the query also compares against the pre-split width, not just the floor (2026-07-29)
- [src/styles/_theme.scss:20] the `"rail": 1904px` derivation comment says crossing it used to cost "80px (.main's padding going `--space-4` to `--space-10` on both sides)", but that's the new padding total, not the amount lost — the actual per-side delta is (40-16)=24px, ×2 sides = 48px; the 1904px value itself is unaffected (it solves against the 80px total correctly), only the comment's arithmetic is off, until someone next touches this comment (2026-07-29, found in PR #83 review)
- [src/components/RowGrid/style.module.scss:63, _gutter.scss:7] two separate `[data-cell="who"]` rule blocks (one setting `margin-inline-start: 0` in `_gutter.scss`, one setting `grid-area: who` in `style.module.scss`) could be one — split across files by the 100-line-cap fix in PR #83, cosmetic only, until someone merges them without pushing either file back over its own cap (2026-07-29, found in PR #83 review)
