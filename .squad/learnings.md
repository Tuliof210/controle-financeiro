# Learnings — Pocket Squad

One kind of entry lives here: a fact about **this** repo or **this** tool that nobody
can derive by reading the code and that no linter, type-checker or test would catch.
Process steps and "always remember to" have never changed anything — they never
enter; `/ps:publish` routes them elsewhere or drops them.

Every rule is trying to leave. One that became a shared function, a lint config or a
task gets deleted here in the same PR — that is the goal, not a loss. The git log of
this file is the archive.

Cap: 6 KB (nothing reports it — `ps-check.sh` has only `warm|publish|sweep`). Over it, compress or drop the
weakest before appending. Never grow a rule in place ("extended on …") to dodge the
cap — rewrite the line.

Format: `- [<path-or-area>] <fact>, so <what to do differently> (YYYY-MM-DD)`

---

- [worktree] `git worktree add` skips gitignored paths, so `ps-check.sh warm`'s symlinks need undoing first: real `npm install` (the symlink breaks Turbopack), `npx prisma generate` (else routes 500 on `@/generated/prisma/client`, cached — restart), and a throwaway DB rather than copying `dev.db`, which carries migrations the repo no longer has (2026-08-01)
- [browser-preview] Use the pane to LOOK, not to drive: `computer` takes screenshot-pixel coords, so a `getBoundingClientRect` value clicks the wrong place and dismisses modals — drive and measure with a throwaway Playwright script run from INSIDE the worktree (`@playwright/test` must resolve). Pane quirks: `preview_start {name}` launches from the main checkout, not a worktree (start the server, then `{url}`); `screenshot` returns the pre-scroll frame; reading state in the SAME `javascript_tool` call as the change returns the PRE-change value (2026-08-01)
- [architecture] `src/lib/api.ts`'s request helpers never reject, resolving `{error}` (or `{data: undefined}` on an empty 2xx) — guard `if (result.error || !result.data)`, never `?? null` alone (2026-07-29)
- [prisma/migrate] Read the generated SQL before applying — `migrate dev` reaches for a RedefineTables rebuild far wider than SQLite needs: a column drop (backfill between CREATE and rebuild), a multi-model rename (`DROP TABLE`+`CREATE` over `ALTER TABLE ... RENAME`), and even ADD COLUMN with a constant default, where one in-place `ALTER TABLE ADD COLUMN` avoids dropping a table an FK points at (2026-08-01)
- [design-system] The >=44px hit-target binds every new interactive element, not just ones reusing `IconButton` — hardcode it (`<summary>` wants `line-height`; `display:flex` drops its marker), or overlay an `::after` when padding would shift layout (2026-07-25)
- [design-system] Contrast is a property of the pair, not the token — measure the exact text/background pair, never infer it from the fill's hue. A token that FLIPS may admit no foreground: on `--color-brand`, `--ink-900` is 3.59:1 light and `--white` 3.72:1 dark, so a fill needs a non-flipping primitive (`--violet-600`, 7.44:1 on `--white`) — or stay outlined and inherit the text colour (2026-07-31)
- [design-system] `EntryRow`'s meta line splits a fixed width between owner and period, and at 375px the owner is ALREADY floored at 3ch — so a `flex: none` child added there takes its width wholly out of the ellipsising period (measured: 18.6px of a natural 88px, one letter). `flex-wrap` the cell; nothing else has slack (2026-08-01)
- [design-system] `HeroBand` is full-bleed: it cancels `<main>`'s padding with a negative margin on ALL FOUR sides, so it only works as the first element — anything placed above it on the dashboard is overlapped by 16px, 40px from `md` up. Put new dashboard-wide controls under it (2026-08-01)
- [playwright] Reading text off the DOM: `getByText` drops an element when a child matches the same text (safe for `{exact:true}`, not an anchored regex — scope to the cell), and `innerText` puts NO separator before an inline-block sibling (`R$ 800,002,7×`) — slice money on a cents-pair anchor (2026-07-30)
- [gh/worktree] `gh pr merge --delete-branch` can exit 1 locally after merging server-side, if a worktree still holds the branch — check `gh pr view <n> --json state,mergedAt` before calling it a failed merge (2026-07-28)
- [next/dev] Next 16 dev locks per DIRECTORY, not per port — a second server in the same checkout is refused even on a free port, so kill the one in the directory `npm run test` boots in; and Turbopack never sees a Sass partial created while running (`npx sass` compiles it, `rm -rf .next` doesn't help — `touch` it) (2026-07-29)
- [playwright] `scrollIntoViewIfNeeded` scrolls the minimum, so a row can end up under whatever is fixed/sticky at that width and `elementFromPoint` reads that instead — `evaluate((el) => el.scrollIntoView({ block: "center" }))` before any hit-test (2026-07-29)
- [playwright] `fullyParallel` is unset, so workers scale with SPEC FILE count — adding one file loads every other spec harder and can redden a geometry assertion that never flaked; `settle` (e2e/settle.helper.ts) before measuring, never `retries` (2026-07-29)
- [playwright] A native `<dialog>`: a second one anywhere (a nav drawer) makes `getByRole("dialog")` a strict-mode violation — scope by `page.locator("dialog[open]")`; and a modal is `position: fixed` in the top layer, adding NOTHING to `documentElement.scrollWidth` — measure its own `scrollWidth - clientWidth` (2026-07-29)
- [design-system] Lifting a rule into a `_*.scss` partial strips its nesting: out of `.table { th {…} }` it becomes a bare class (0,1,0) and silently loses to the `.table th` (0,1,1) it sat inside — re-nest it under the same ancestor, and prove it with `getComputedStyle` on the page (2026-07-30)
- [biome] a11y pincers a responsive table: `noRedundantRoles` rejects `role=` on native table tags, `useSemanticElements` rejects `<div role="table">` — a table reflowing via `display` cannot declare the roles that destroys, so carry the column in a per-cell `data-label` drawn by `::before` (2026-07-30)
