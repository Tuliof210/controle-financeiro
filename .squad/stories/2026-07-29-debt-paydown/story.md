# Pay down the debt ledger

## Why
`.squad/debt.md` holds 16 entries. Thirteen have an answer nobody has written
down, and several are lies the repo tells its next reader: a comment that
contradicts the selector two lines below it, docs claiming `e2e/` is empty
against 53 passing tests, a dashboard sentence that reports the wrong number.

## Acceptance Criteria
- [x] Re-importing an OFX already on file leaves Importar disabled with its tooltip, on the server's answer alone
- [x] No viewport width makes an entry row narrower by growing the window *within a RowGrid column tier* — a separate, pre-existing gap across the two-column split itself is real and stays logged in `.squad/debt.md`, not silently fixed here
- [x] A goal row's name and its dropped amount start at the same x below the one-line floor
- [x] The ceiling card names how many months remain, not "do período"
- [x] RowGrid's one-line floor exists once as a Sass symbol; nothing hand-copies it
- [x] No tracked file exceeds the 100-line cap, and no doc statement about `e2e/` is false

## Definition of Done
- [x] `npm run lint` exits 0
- [x] `npx tsc --noEmit` exits 0 and silent
- [x] `npm run test:e2e` — 53+ tests, all green (66/66)
- [x] `sh .claude/ps-check.sh` reports `needs attention: 0`
- [x] `.squad/debt.md` retains only the entries this story does not close (5, one more than planned — task 03 surfaced a genuinely new gap, logged rather than hidden)

## Tasks
- [x] tasks/01-api-error-code.md — carry `error.code` through `api.ts`; ImportAction disables on a 409
- [x] tasks/02-row-floor-symbol.md — one Sass symbol for RowGrid's one-line floor; 439 and both 1016s derive from it
- [x] tasks/03-rail-breakpoint.md — the rail arrives only where the shell can afford it, killing the 764→768 cliff
- [x] tasks/04-row-gutter-column.md — RowGrid's gutter reset keys on the column, not on source position
- [x] tasks/05-entry-screen-split.md — EntryScreen under the 100-line cap via its repeated JSX
- [x] tasks/06-e2e-transport-helper.md — one home for the e2e fetch plumbing both seed helpers copy
- [x] tasks/07-dashboard-copy.md — ceiling card wording, and three dashboard comments that describe code that changed
- [x] tasks/08-docs-true.md — ARCHITECTURE/CLAUDE/spec comments stop asserting things that are false
