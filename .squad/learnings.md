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
- [worktree] `git worktree add` skips gitignored paths, so a fresh one needs three manual steps: drop `ps-check.sh warm`'s `node_modules` symlink for a real `npm install` (the symlink breaks Turbopack), `npx prisma generate` (else every route 500s on `@/generated/prisma/client` and Turbopack caches that — restart it), and copy `dev.db` before migrating (a `0` row count means a missing copy, not lost data) (2026-07-29)
- [tooling] `npm run lint:fix` and `npm install` both rewrite files outside a task's scope — `git status`/`git checkout --` the unrelated churn before committing (added 2026-07-25)
- [browser-preview] `preview_start {name}` launches from the main checkout, never a worktree's cwd — run the server manually there and `preview_start {url}`; the pane is shared across agents and a backgrounded tab reports `innerWidth: 0` (2026-07-29)
- [browser-preview] `computer`'s `key` action doesn't reliably register on focused inputs (use `triple_click`+`type`), and reading state in the SAME `javascript_tool` call as the change returns the PRE-change value (2026-07-29)
- [architecture] `MonthPicker` self-seeds `onChange` on mount with a default value, indistinguishable from a real pick — consumers need a separate touched/loaded flag before treating it as save-worthy (added 2026-07-22)
- [architecture] `src/lib/api.ts`'s request helpers never reject, resolving `{error}` (or `{data: undefined}` on an empty 2xx) — guard `if (result.error || !result.data)`, never `?? null` alone (2026-07-29)
- [architecture] A literal-union domain field has no Prisma enum behind it (convention: `String` + `z.enum` at the boundary) — a repository method returning the raw row needs an explicit cast (added 2026-07-23)
- [architecture] Persisted state referencing another entity's id goes stale once that entity is deleted — reconcile via effect once the referenced list finishes loading (added 2026-07-23)
- [prisma/migrate] `migrate dev --create-only` needs hand-edited SQL for any data-preserving change: a column drop is a table rebuild (backfill between CREATE and rebuild), and a multi-model rename with a renamed FK column defaults to `DROP TABLE`+`CREATE` over `ALTER TABLE ... RENAME` — read the generated SQL before applying (2026-07-29)
- [design-system] The >=44px hit-target binds every new interactive element, not just ones reusing `IconButton` — hardcode it (`<summary>` wants `line-height`; `display:flex` drops its marker), or overlay an `::after` when padding would shift layout (2026-07-25)
- [design-system] Contrast is a property of the pair, not the token — measure the exact text/background pair before reusing a token, never infer it from the fill's hue (2026-07-25)
- [playwright] `getByText` drops an element when a child matches the same text, so wrapping a cell is safe for `{ exact: true }` but not for an anchored regex — `/^R\$/` matches the wrapper once its own text starts there, so scope it to the cell (2026-07-28)
- [gh/worktree] `gh pr merge --delete-branch` can exit 1 locally after merging server-side, if a worktree still holds the branch — check `gh pr view <n> --json state,mergedAt` before calling it a failed merge (2026-07-28)
- [next/dev] Next 16 dev refuses a second dev server launched from the same directory even on a free port ("Another next dev server is already running") — kill a manual measurement server before `npm run test` boots its own on :3100 (2026-07-28)
- [next/dev] Turbopack never sees a Sass partial created while running — `@use "./x"` fails to resolve even though `npx sass` compiles fine and `rm -rf .next` doesn't help; `touch` the file (2026-07-29)
- [playwright] `scrollIntoViewIfNeeded` scrolls the minimum, so a row can end up under whatever is fixed/sticky at that width and `elementFromPoint` reads that instead — `evaluate((el) => el.scrollIntoView({ block: "center" }))` before any hit-test (2026-07-29)
- [playwright] `fullyParallel` is unset, so workers scale with SPEC FILE count — adding one file loads every other spec harder and can redden a geometry assertion that never flaked; `settle` (e2e/settle.helper.ts) before measuring, never `retries` (2026-07-29)
- [playwright] A native `<dialog>`: a second one anywhere (a nav drawer) makes `getByRole("dialog")` a strict-mode violation, so scope by `page.locator("dialog[open]")`; and a modal is `position: fixed` in the top layer, adding NOTHING to `documentElement.scrollWidth` — measure its own `scrollWidth - clientWidth` and prove it reddens with an injected `min-width` (2026-07-29)
- [design-system] A node kept in the DOM only so `aria-describedby` resolves and hidden with `visibility` (Tooltip's bubble) is still LAID OUT, so it counts toward `documentElement.scrollWidth` — one whose trigger sits near a container's right edge scrolls the whole PAGE sideways, invisibly. Measure the route's overflow after putting a Tooltip beside a long heading (2026-07-30)
- [playwright] A scripted `.focus()` call can leave `:focus-visible` unmatched even when the rule is correct — verify a focus ring with a real keyboard `Tab` press instead (2026-07-29)
