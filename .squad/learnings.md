# Learnings — Pocket Squad

One kind of entry lives here: a fact about **this** repo or **this** tool that nobody
can derive by reading the code and that no linter, type-checker or test would catch.
Process steps and "always remember to" have never changed anything — they never
enter; `/ps:publish` routes them elsewhere or drops them.

Every rule is trying to leave. One that became a shared function, a lint config or a
task gets deleted here in the same PR — that is the goal, not a loss. The git log of
this file is the archive.

Cap: 6 KB (`sh .claude/ps-check.sh` reports it). Over it, compress or drop the
weakest before appending. Never grow a rule in place ("extended on …") to dodge the
cap — rewrite the line.

Format: `- [<path-or-area>] <fact>, so <what to do differently> (YYYY-MM-DD)`

---

- [biome] `noExcessiveLinesPerFile`/Function are `info` not `error` and never read `.scss` — `wc -l` every touched file including stylesheets, and expect some already over cap on main (2026-07-28)
- [tooling] The harness's Bash shell can silently revert to a stale worktree cwd between calls — re-`cd` and verify `pwd`/branch in the SAME call as any cwd-sensitive git op (added 2026-07-22)
- [publish] The plan commit belongs on the story branch only — a copy on main makes `story.md` an add/add conflict on the story PR (resolve `--ours`, the branch has the ticked boxes) and makes `git pull --rebase` after the merge need `--skip` (2026-07-28)
- [worktree] Skip `ps-check.sh warm` — its `node_modules` symlink makes Turbopack refuse every build; run a real `npm install` then `npm run db:setup` in the worktree (`db:postinstall` is a named script, not npm's hook, so `@/generated/prisma` is missing otherwise) (2026-07-28)
- [tooling] `npm run lint:fix` and `npm install` both rewrite files outside a task's scope — `git status`/`git checkout --` the unrelated churn before committing (added 2026-07-25)
- [browser-preview] `preview_start {name}` launches from the main checkout, never a worktree's cwd — run the server manually there and `preview_start {url}`; the pane is shared across agents and a backgrounded tab reports `innerWidth: 0` (2026-07-29)
- [browser-preview] `resize_window`'s "desktop" preset restores the pane's native size, which can itself be 375px — pass explicit width/height whenever width is what is under test (2026-07-29)
- [browser-preview] `computer`'s `key` action doesn't reliably register on focused inputs (use `triple_click`+`type`), and reading state in the SAME `javascript_tool` call as the change returns the PRE-change value (2026-07-29)
- [architecture] `MonthPicker` self-seeds `onChange` on mount with a default value, indistinguishable from a real pick — consumers need a separate touched/loaded flag before treating it as save-worthy (added 2026-07-22)
- [architecture] `src/lib/api.ts`'s request helpers never reject, resolving `{error}` (or `{data: undefined}` on an empty 2xx) — guard `if (result.error || !result.data)`, never `?? null` alone (2026-07-29)
- [architecture] A new Prisma relation FK defaults to `ON DELETE RESTRICT`, so a sibling delete endpoint starts throwing an uncaught `P2003` — audit every delete handler on the referenced entity when adding a relation (2026-07-23)
- [architecture] Persisted state referencing another entity's id goes stale once that entity is deleted — reconcile via effect once the referenced list finishes loading (added 2026-07-23)
- [prisma/migrate] EVERY SQLite schema change here is a table rebuild (additive columns included) — `migrate dev --create-only`, read the SQL before applying: `PRAGMA foreign_keys=OFF` stops `DROP TABLE` cascading, and a column missing from `INSERT` is backfilled by the new DEFAULT. Hand-edit only to backfill; `prisma generate` after (2026-07-29)
- [design-system] The >=44px hit-target binds every new interactive element, not just ones reusing `IconButton` — hardcode it (`<summary>` wants `line-height`; `display:flex` drops its marker), or overlay an `::after` when padding would shift layout (2026-07-25)
- [design-system] Contrast is a property of the pair, not the token — measure the exact text/background pair before reusing a token, never infer it from the fill's hue (2026-07-25)
- [playwright] `getByText` drops an element when a child matches the same text, so wrapping a cell is safe for `{ exact: true }` but not for an anchored regex — `/^R\$/` matches the wrapper once its own text starts there, so scope it to the cell (2026-07-28)
- [gh/worktree] `gh pr merge --delete-branch` merges server-side then can still exit 1 locally if any worktree still holds the branch — check `gh pr view <n> --json state,mergedAt` before treating that as a failed merge (2026-07-28)
- [next/dev] Next 16 dev refuses a second dev server launched from the same directory even on a free port ("Another next dev server is already running") — kill a manual measurement server before `npm run test` boots its own on :3100 (2026-07-28)
- [next/dev] Turbopack never sees a Sass partial created while it is running — `@use "./x"` fails "Can't find stylesheet to import" though `npx sass` compiles the same file, and `rm -rf .next` plus a restart does not help; `touch` the file (2026-07-29)
- [playwright] `scrollIntoViewIfNeeded` scrolls the minimum, so a row can end up under whatever is fixed/sticky at that width and `elementFromPoint` reads that instead — `evaluate((el) => el.scrollIntoView({ block: "center" }))` before any hit-test (2026-07-29)
- [playwright] `fullyParallel` is unset, so workers scale with SPEC FILE count — adding one file loads every other spec harder and can redden a geometry assertion that never flaked; `settle` (e2e/settle.helper.ts) before measuring, never `retries` (2026-07-29)
- [playwright] A native `<dialog>` has an implicit ARIA role "dialog" — a second one anywhere (e.g. a nav drawer) breaks an existing `getByRole("dialog")` locator (strict-mode violation); override its role instead (2026-07-29)
