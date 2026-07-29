# Every statement about this repo is true again

## Outcome
- No document claims `e2e/` is empty, and none claims a flag that is set nowhere.
- The component-structure rule accounts for the Sass partials that already exist.
- `row-columns.spec.ts`'s width constants are explained by what actually happens
  at them after task 03.
- Closes `.squad/debt.md:28`, `:32`, `:39`.

## Context
This task runs last on purpose: tasks 02–05 move the numbers and files these
documents describe, so it records what landed rather than what was planned.

**Drift 1 — the three-file rule vs. two existing fourth files.**
`.squad/ARCHITECTURE.md:18-27` says *"Every component is a folder with exactly
three files"* and lists `index.tsx`, `hook.ts`, `style.module.scss`. Line 28 is
blank; line 29 begins *"Because the component is `index.tsx`, …"*.

Two `_*.scss` partials already break it, each forced by the 100-line cap in the
same document, and each says so in its own header:
- `src/components/RowGrid/_tiers.scss` ← `style.module.scss:1-4`: *"The narrow
  tiers are a partial of their own — this file was already at the repo's 100-line
  cap as a subgrid, and the two collapses read as one idea. Not a component: a
  mixin definition, no output of its own."*
- `src/components/EntryRow/_meta.scss` ← same shape.

`EntryScreen/` also carries a fourth file, `types.ts`, and six component folders
carry a `*.helper.ts` (`EntryForm/`, `ProfileProvider/`, `Header/` with two,
`ThemeToggle/`, `Avatar/`, `RecurrencesScreen/`) — the doc's own **File size**
section already sanctions *"extract a helper"*, so the rule as written contradicts
a rule two sections down. Task 05 may add another child folder, and task 02 may
add a `src/styles/` partial; write the sentence against what exists when you run.

**Drift 2 — `e2e/` is not empty, and the flag does not exist.**
`.squad/ARCHITECTURE.md:130-135`, verbatim:
```
`npm run test:e2e` — aliased as `npm run test` — is the whole suite
(Playwright, `playwright.config.ts`). Specs live in `e2e/` — empty for now, so
the run passes with `--pass-with-no-tests`. The
run boots its own `next dev` on :3100 (never reusing a running one) against a
throwaway `e2e.db` that it deletes and re-migrates via `db:setup` every time —
`dev.db` is never touched.
```
`CLAUDE.md:24-26`, verbatim:
```
- `npm run test:e2e` (aliased as `npm run test`) — Playwright; boots its own
  dev server on :3100 against a throwaway `e2e.db`, never `dev.db`. Specs go
  in `e2e/` (empty for now)
```
Both false. `npx playwright test --list` exits 0 without booting a server and
reports `Total: 53 tests in 5 files` **today** — re-run it, since tasks 01, 03, 04
and 07 all add assertions. `--pass-with-no-tests` appears in no executable config:
not in `package.json`, not in `playwright.config.ts`. Its only three occurrences
are prose — `ARCHITECTURE.md:132`, `debt.md:39`, and
`.squad/stories/2026-07-29-teto-de-gastos/tasks/03-ceiling-e2e.md:18`. That last
one also says "4 specs and 51 tests", stale from before `ceiling.spec.ts`.

Do **not** count with `grep -c 'test('` — it returns 10, because most tests are
generated inside `for (const list of LISTS)` loops.

**Drift 3 — `PINCHED`'s comment.** `e2e/row-columns.spec.ts:11-14`:
```ts
// The app's worst width, and one neither endpoint above reaches: the two-column
// Configurações grid has kicked in but the viewport has not grown to pay for
// it, so a row gets 148px — narrower than the 291px it gets at 375px.
const PINCHED = 768;
```
Already stale before this story: SettingsScreen moved to a container query, so at
a 768px viewport its container is far under 1016 and the two-column grid does not
kick in. Task 03 then moves the rail off 768 entirely. Whatever 768 (or its
replacement) means when you run, say that — and measure it rather than asserting a
new pixel figure from this file.

- **Watch out for** the header block at `row-columns.spec.ts:5-17`, which also
  carries measured claims about `WIDE = 1440` and `NARROW = 375` and about the
  one-line floor. Task 02 makes the floor a symbol and task 03 changes what the
  shell leaves a row; re-read that whole block, not just the `PINCHED` lines.
- **Watch out for** `RowGrid/style.module.scss:10-15`, which says a row is
  *"680px at a 764px viewport, 372px at 768px, where the aside appears"* — task 03
  is specifically meant to kill that. If it did, this comment is now false too.
- **Verify with** `npx playwright test --list`, `sh .claude/ps-check.sh`.

## Scope
- In: `.squad/ARCHITECTURE.md`, `CLAUDE.md`, `e2e/row-columns.spec.ts` comments,
  `src/components/RowGrid/style.module.scss` comments, and the entries this story
  closes in `.squad/debt.md`.
- Out: any executable code or assertion. `.squad/stories/2026-07-29-teto-de-gastos/`
  — a shipped story's task files are a historical record, not live documentation.
  `.squad/learnings.md`.

## Verify
```
npx playwright test --list
npm run lint
sh .claude/ps-check.sh
```
`ps-check.sh` must report `needs attention: 0` and a debt count reduced to the
three entries this story does not close (the OFX re-import undo, the 25% goal
pace, and the deliberate tier-reading assertion at `e2e/row-columns.spec.ts:95`).
Every other entry leaves because its code changed — remove those entries here,
in this task, once the code that earned them has landed.

## Forbidden
- Do not add `--pass-with-no-tests` to make the docs true; delete the claim.
- Do not remove a debt entry whose fix did not actually land in tasks 01–07. An
  entry leaves by being fixed, never by being reworded.
- Do not touch `.squad/debt.md:25` (OFX re-import), `:34` (EntryRow duration —
  declined by the owner, its `until` is already correct), or `:40` (goal pace).
- Do not restate anything already in CLAUDE.md or ARCHITECTURE.md in the other
  file; fix each claim where it lives.
