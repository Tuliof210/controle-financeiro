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
- [src/app/leitor-ofx/_components/OfxScreen/components/ReportView/components/ImportAction/hook.ts:submit] a 409 `already_imported` renders the message but leaves the Importar button enabled, because `src/lib/api.ts` surfaces only `error.message` and drops `error.code` — only reachable when a second importer writes the same file mid-dialog, until `api.ts` carries the code through (2026-07-28)
- [src/components/EntryScreen/style.module.scss:19] the comment claims row width now grows monotonically with the window, but 764px→768px still drops a row from 680px to 372px and it stays stacked to ~1056px — the 1280px collapse is genuinely gone, this one is AppShell's 264px aside still keyed to `t.bp("md")` (src/components/AppShell/style.module.scss:16), until a change moves AppShell off that viewport breakpoint (2026-07-28)
- [.squad/ARCHITECTURE.md:19] the three-file component rule has no exception for Sass partials, but `src/components/RowGrid/_tiers.scss` and `src/components/EntryRow/_meta.scss` are both fourth files in their folders — the 100-line cap in the same document forced each split, until the rule gains a sentence permitting `_*.scss` inside a component folder (2026-07-29)
- [src/components/RowGrid/style.module.scss:59] `> [data-cell]:first-child { margin-inline-start: 0 }` keys on source position, not on column, so a goal row's name gets 0 and its amount 12px — pre-existing and unchanged by the row redesign, until the reset keys on the column (2026-07-29)
- [src/components/EntryScreen/index.tsx:1] 116 lines against ARCHITECTURE.md's 100-line cap — 114 before the row redesign, plus two for threading `renderBand` through both sections; Biome scores it `info`, so nothing fails, until the screen is split or the labels object absorbs another field (2026-07-29)
- [e2e/row-columns.spec.ts:95] `aligns its columns` reads which collapse tier the browser chose and asserts against that choice, so nothing reddens if RowGrid's 439px or 279px thresholds move — deliberate, so a moved threshold changes what is asserted instead of breaking it, until a spec pins the thresholds themselves (2026-07-29)
- [e2e/row-columns.spec.ts:11] the comment on `PINCHED` explains 768px by a 148px Configurações row, which task 04 removed when it moved SettingsScreen to a container query — the width still matters (an entry row is 372px there) but for a different reason, until the comment is rewritten (2026-07-29)
- [src/components/EntryScreen/style.module.scss:33] the 1016px two-column threshold is written by hand here and in `src/app/configuracoes/_components/SettingsScreen/style.module.scss:29`, both derived from RowGrid's 439px first tier — three numbers, no shared symbol, nothing fails if one moves, until a Sass symbol in `src/styles/` holds it (2026-07-29)
- [src/components/EntryRow/index.tsx:37] the metadata line shows `Owner · Interval(s)` where the design and task 03 both specify a duration too (`24 meses`) — dropped as the line is already tight at 375px and the duration is derivable from the intervals beside it, until the line gains room (2026-07-29)
- [e2e/ceiling.helper.ts:7] `BASE_URL`, `post`, `list` and `waitFor` are byte-identical to `e2e/seed.helper.ts:5,27-46` — the separate file keeps the four row specs' fixture data untouched, which a second exported seed function would have done too, until either copy's fetch plumbing needs a change (2026-07-29)
- [src/app/_components/DashboardScreen/list-cards.helper.ts:6] `sharePercent`'s comment says "a row's share of the largest row" and its parameter is named `max`, but `CeilingCard/hook.ts:25` passes each row's own `cumulative` as the denominator — two of three callers still match the comment, until a rename or a fourth caller makes the drift bite (2026-07-29)
- [src/app/_components/DashboardScreen/components/CeilingCard/hook.ts:46] "Vale pelos N meses do período" counts the months REMAINING, not the period's length — a Jan–Nov range read in July says "5 meses do período" for an 11-month period, until the wording says "meses restantes" (2026-07-29)
- [src/app/_components/DashboardScreen/components/CeilingCard/hook.ts:45] the `horizon` ternary's null branch is unreachable — `tightest` is null only when `monthly` is 0, which is the `empty` branch — but carries none of the "inert by construction, kept only to satisfy the type" comment `LimitCard/hook.ts:16` and `goals.helper.ts:14` use, until a reader has to re-derive the invariant (2026-07-29)
- [CLAUDE.md:26] this line and `.squad/ARCHITECTURE.md:131` both say specs live in `e2e/` "empty for now, so the run passes with `--pass-with-no-tests`" — there are 5 spec files and 53 tests, and that flag is set nowhere, so a run matching no tests would now fail rather than pass, until either document is next edited (2026-07-29)
- [src/app/api/dashboard/goals.helper.ts:34] `accruedCents = pace * monthsAhead` became sound when `pace` turned into a share of a sustainable monthly rate, but nobody has decided that 25% of the ceiling is the right rate to offer — the number was inherited from the formula it replaced, until the owner revisits the Objetivos card (2026-07-29)
- [src/components/EntryScreen/style.module.scss:37] the two-column container query only guarantees a post-split column stays above RowGrid's one-line floor, not that it stays above the single-column width it replaces — measured on /recorrencias, a row is 683px wide at 768px (single column) and 640px at 1440px (two columns), narrower after growing — until the query also compares against the pre-split width, not just the floor (2026-07-29)
