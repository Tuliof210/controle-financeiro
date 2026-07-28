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

- [biome] `noExcessiveLinesPerFile`/Function are `info` not `error` at `level: "on"` — the 100-line cap does not fail `npm run lint`, so treat it as review-only and measure the real count, never estimate (added 2026-07-21, extended 2026-07-25)
- [tooling] The harness's Bash shell can silently revert to a stale worktree cwd between calls — re-`cd` and verify `pwd`/branch in the SAME call as any cwd-sensitive git op (added 2026-07-22)
- [publish] Parallel `/ps:run` worktrees collide on `story.md` — commit it to main before spawning them; if PRs still conflict, merge one at a time, keeping all already-checked boxes (added 2026-07-23)
- [worktree] `node_modules` is per-checkout — a dependency added in a task's worktree is missing from the next worktree AND from main after the merge, so a twice-verified PR fails `npm run build` with a "Cannot find module" pointing at a source line; `npm install` when a task adds a dep and again after publishing it (2026-07-28)
- [tooling] `npm run lint:fix` and `npm install` both rewrite files outside a task's scope — `git status`/`git checkout --` the unrelated churn before committing (added 2026-07-25)
- [browser-preview] `preview_start {name}` always launches from the main checkout, never a worktree's cwd — run the dev server manually in the worktree and `preview_start {url}` instead; the pane is also shared across parallel agents, and a backgrounded tab reports `innerWidth: 0` (added 2026-07-21, extended 2026-07-27)
- [browser-preview] `computer`'s `key` action doesn't reliably register on focused inputs (use `triple_click`+`type` instead), and reading state in the SAME `javascript_tool` call as the change that produced it returns the PRE-change value — re-read in a separate call (added 2026-07-22, extended 2026-07-27)
- [architecture] `MonthPicker` self-seeds `onChange` on mount with a default value, indistinguishable from a real pick — consumers need a separate touched/loaded flag before treating it as save-worthy (added 2026-07-22)
- [architecture] `src/lib/api.ts`'s request helpers never reject, resolving `{error}` (or `{data: undefined}` on an empty 2xx) instead — guard `if (result.error || !result.data)`, never `?? null` alone (added 2026-07-22, extended 2026-07-25)
- [architecture] A new Prisma relation FK defaults to `ON DELETE RESTRICT` and can break an existing sibling delete endpoint's uncaught `P2003` — audit every delete handler on the referenced entity when adding one (added 2026-07-23, extended 2026-07-24)
- [architecture] A literal-union domain field has no Prisma enum behind it (convention: `String` + `z.enum` at the boundary) — a repository method returning the raw row needs an explicit cast (added 2026-07-23)
- [architecture] Persisted state referencing another entity's id goes stale once that entity is deleted — reconcile via effect once the referenced list finishes loading (added 2026-07-23)
- [prisma/migrate] A data-preserving SQLite schema change needs `migrate dev --create-only` plus hand-edited SQL — a column drop is a table rebuild, so backfill between the new table's CREATE and the rebuild; run `prisma generate` after (added 2026-07-24)
- [typescript/react] `Partial<P>` is opaque while `P` is unresolved — one divergent rendering seam should be a `ReactNode` prop, not a generic; wider divergence shares only the concrete half (added 2026-07-24)
- [design-system] The >=44px hit-target binds every new interactive element, not just ones reusing `IconButton` — hardcode it (`<summary>` wants `line-height`; `display:flex` drops its marker), or overlay an `::after` when padding would shift layout (2026-07-25)
- [design-system] Contrast is a property of the pair, not the token — a token passing on one background/fill can fail on another; measure the exact pair before reuse, don't assume from the fill's hue (added 2026-07-25, extended 2026-07-27)
- [review] A claim in a PR body is unverified until tested against the diff — delete a claimed type constraint and run `tsc`, mutate a fix's own test to prove it can fail (added 2026-07-22, extended 2026-07-25)
- [playwright] Next 16 dev mode's default `allowedDevOrigins` allowlist covers `localhost`, not `127.0.0.1` — `baseURL`/`webServer` on the wrong one silently blocks every client-side fetch, so seeded rows never render and the gap stays invisible until a spec actually asserts on fetched data (2026-07-28)
- [playwright] A stretched grid/flex cell makes `boundingBox()` blind to alignment: the box ends at the track's edge whether or not the text inside is flushed there, so the assertion stays green with the screen visibly wrong — measure a `Range` over the node's contents (2026-07-28)
- [next/dev] Next 16 dev refuses a second dev server launched from the same directory even on a free port ("Another next dev server is already running") — kill a manual measurement server before `npm run test` boots its own on :3100 (2026-07-28)
