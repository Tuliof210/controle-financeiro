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

