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

- [worktree] `git worktree add` skips gitignored paths, so `ps-check.sh warm`'s symlinks need undoing before a worktree runs: real `npm install` (the symlink breaks Turbopack), `npx prisma generate` (else routes 500 on `@/generated/prisma/client`, cached — restart), and copy `dev.db` (a `0` row count means a missing copy, not lost data) (2026-07-29)
- [browser-preview] `preview_start {name}` launches from the main checkout, never a worktree (run the server there, then `preview_start {url}`); the pane is shared, a backgrounded tab reports `innerWidth: 0`, `computer`'s `key` misses focused inputs (`triple_click`+`type`), `screenshot` returns the pre-scroll frame (measure via `javascript_tool` instead), and reading state in the SAME `javascript_tool` call as the change returns the PRE-change value (2026-07-29)
- [architecture] `MonthPicker` self-seeds `onChange` on mount with a default value, indistinguishable from a real pick — consumers need a separate touched/loaded flag before treating it as save-worthy (added 2026-07-22)
- [architecture] `src/lib/api.ts`'s request helpers never reject, resolving `{error}` (or `{data: undefined}` on an empty 2xx) — guard `if (result.error || !result.data)`, never `?? null` alone (2026-07-29)
- [architecture] Persisted state referencing another entity's id goes stale once that entity is deleted — reconcile via effect once the referenced list finishes loading (added 2026-07-23)
- [prisma/migrate] `migrate dev --create-only` needs hand-edited SQL for any data-preserving change: a column drop is a table rebuild (backfill between CREATE and rebuild), and a multi-model rename with a renamed FK column defaults to `DROP TABLE`+`CREATE` over `ALTER TABLE ... RENAME` — read the generated SQL before applying (2026-07-29)
- [design-system] The >=44px hit-target binds every new interactive element, not just ones reusing `IconButton` — hardcode it (`<summary>` wants `line-height`; `display:flex` drops its marker), or overlay an `::after` when padding would shift layout (2026-07-25)
- [design-system] Contrast is a property of the pair, not the token — measure the exact text/background pair before reusing a token, never infer it from the fill's hue (2026-07-25)
- [design-system] A token that FLIPS between themes may admit no single foreground: filled with `--color-brand`, `--ink-900` measures 3.59:1 (light) and `--white` 3.72:1 (dark), both under the floor — a filled surface then needs a non-flipping primitive, e.g. `--violet-600` at 7.44:1 on `--white` in either theme (2026-07-31)
- [playwright] Reading text off the DOM: `getByText` drops an element when a child matches the same text (safe for `{exact:true}`, not an anchored regex — scope to the cell), and `innerText` puts NO separator before an inline-block sibling (`R$ 800,002,7×`) — slice money on a cents-pair anchor (2026-07-30)
- [gh/worktree] `gh pr merge --delete-branch` can exit 1 locally after merging server-side, if a worktree still holds the branch — check `gh pr view <n> --json state,mergedAt` before calling it a failed merge (2026-07-28)
- [next/dev] Next 16 dev locks per DIRECTORY, not per port: a second server in the same checkout is refused even on a free port, but a worktree is a different directory and runs alongside the main checkout's — kill only the server in the directory `npm run test` boots in (2026-07-28)
- [next/dev] Turbopack never sees a Sass partial created while running — `@use "./x"` fails to resolve even though `npx sass` compiles fine and `rm -rf .next` doesn't help; `touch` the file (2026-07-29)
- [playwright] `scrollIntoViewIfNeeded` scrolls the minimum, so a row can end up under whatever is fixed/sticky at that width and `elementFromPoint` reads that instead — `evaluate((el) => el.scrollIntoView({ block: "center" }))` before any hit-test (2026-07-29)
- [playwright] `fullyParallel` is unset, so workers scale with SPEC FILE count — adding one file loads every other spec harder and can redden a geometry assertion that never flaked; `settle` (e2e/settle.helper.ts) before measuring, never `retries` (2026-07-29)
- [playwright] A native `<dialog>`: a second one anywhere (a nav drawer) makes `getByRole("dialog")` a strict-mode violation — scope by `page.locator("dialog[open]")`; and a modal is `position: fixed` in the top layer, adding NOTHING to `documentElement.scrollWidth` — measure its own `scrollWidth - clientWidth` (2026-07-29)
- [design-system] Lifting a rule into a `_*.scss` partial strips its nesting: out of `.table { th {…} }` it becomes a bare class (0,1,0) and silently loses to the `.table th` (0,1,1) it sat inside — re-nest it under the same ancestor, and prove it with `getComputedStyle` on the page (2026-07-30)
- [biome] a11y pincers a responsive table: `noRedundantRoles` rejects `role=` on native table tags, `useSemanticElements` rejects `<div role="table">` — a table reflowing via `display` cannot declare the roles that destroys, so carry the column in a per-cell `data-label` drawn by `::before` (2026-07-30)
