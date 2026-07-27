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
- [publish] `gh pr merge --delete-branch` fails to delete a branch still checked out in a worktree — confirm the merge separately, remove the worktree/branch by hand, verify with `git ls-remote` (added 2026-07-21, extended 2026-07-27)
- [publish] Parallel `/ps:run` worktrees collide on `story.md` — commit it to main before spawning them; if PRs still conflict, merge one at a time, keeping all already-checked boxes (added 2026-07-23)
- [worktree] `node_modules` isn't shared across worktrees — a dependency installed in one task's worktree is silently absent in the next one's, though lint/test may still pass via the main checkout — `npm install` at the start of any task with a new dependency (added 2026-07-22)
- [tooling] `npm run test` from the main checkout globs nested worktree checkouts too, inflating counts — measure from inside the worktree or with an explicit path filter (added 2026-07-25)
- [tooling] `npm run lint:fix` and `npm install` both rewrite files outside a task's scope — `git status`/`git checkout --` the unrelated churn before committing (added 2026-07-25)
- [browser-preview] `preview_start {name}` always launches from the main checkout, never a worktree's cwd — run the dev server manually in the worktree and `preview_start {url}` instead; the pane is also shared across parallel agents, and a backgrounded tab reports `innerWidth: 0` (added 2026-07-21, extended 2026-07-27)
- [browser-preview] `computer`'s `key` action doesn't reliably register on focused inputs (use `triple_click`+`type` instead), and reading state in the SAME `javascript_tool` call as the change that produced it returns the PRE-change value — re-read in a separate call (added 2026-07-22, extended 2026-07-27)
- [architecture] `route.ts`-only logic has zero automated coverage by convention (tests colocate only with `service.ts`) — require manual-smoke-test cases for it in review (added 2026-07-22)
- [architecture] `MonthPicker` self-seeds `onChange` on mount with a default value, indistinguishable from a real pick — consumers need a separate touched/loaded flag before treating it as save-worthy (added 2026-07-22)
- [architecture] `src/lib/api.ts`'s request helpers never reject, resolving `{error}` (or `{data: undefined}` on an empty 2xx) instead — guard `if (result.error || !result.data)`, never `?? null` alone (added 2026-07-22, extended 2026-07-25)
- [architecture] A new Prisma relation FK defaults to `ON DELETE RESTRICT` and can break an existing sibling delete endpoint's uncaught `P2003` — audit every delete handler on the referenced entity when adding one (added 2026-07-23, extended 2026-07-24)
- [architecture] A literal-union domain field has no Prisma enum behind it (convention: `String` + `z.enum` at the boundary) — a repository method returning the raw row needs an explicit cast (added 2026-07-23)
- [architecture] Persisted client state referencing another mutable entity's id goes stale once that entity is deleted — reconcile with an effect once the referenced list has actually finished loading (added 2026-07-23)
- [prisma/migrate] A data-preserving SQLite schema change needs `migrate dev --create-only` plus hand-edited SQL — a column drop is a table rebuild, so backfill between the new table's CREATE and the rebuild; run `prisma generate` after (added 2026-07-24)
- [biome/react] `noArrayIndexKey` fails a `.map`'s `key={index}` — give rows without natural ids a stable key from a monotonic `useRef` counter, never the index (added 2026-07-24)
- [typescript/react] `Partial<P>` is opaque while `P` is an unresolved type param — a single divergent rendering seam should be a `ReactNode` prop, not a generic; wider divergence means sharing only the concrete half (added 2026-07-24)
- [design-system] `tokens.test.ts` is a hardcoded allow-list — a new token needs adding to it explicitly; elevation isn't covered at all (gated instead by `_theme.scss`'s `@mixin elevation`) (added 2026-07-27)
- [design-system] The hit-target rule (>=44px) binds every new interactive element, not just ones reusing `IconButton` — hardcode 44px, or an overlaid `::after` when padding would shift layout (added 2026-07-25)
- [design-system] Contrast is a property of the pair, not the token — a token passing on one background/fill can fail on another; measure the exact pair before reuse, don't assume from the fill's hue (added 2026-07-25, extended 2026-07-27)
- [testing] Test the hook that assembles a feature, not just the pure helper it calls — deleting a component can silently delete its guards' tests too (added 2026-07-25, extended 2026-07-27)
- [review] A claim in a PR body is unverified until tested against the diff — delete a claimed type constraint and run `tsc`, write the "untestable" case before waiving it, mutate a fix's own test to prove it can fail (added 2026-07-22, extended 2026-07-25)
