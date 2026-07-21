# Learnings — Pocket Squad

Durable, one-line rules. Appended by /ps:publish after each merge; read by
/ps:story during refinement. A rule must change future behavior — otherwise
delete it. Cap: 30 rules; when adding past the cap, delete the weakest one.

Format: `- [scope] imperative rule (added YYYY-MM-DD)`

---

- [worktree] After EnterWorktree, immediately rename the branch to ps/<story-slug>/<task-slug> — it auto-generates worktree-ps+<slug>+<task> (/ → +), breaking the ps/<slug>/* convention /ps:load's PR cross-check relies on (added 2026-07-21)
- [worktree] A tool that derives a name from cwd (create-next-app ., npm init, etc.) can fail inside an EnterWorktree directory since its +-joined basename isn't a valid npm package name — scaffold into a throwaway subdir first, then move the generated files up (added 2026-07-21)
- [biome] Run `npx biome explain <rule>` before trusting any rule snippet — create-next-app's pinned Biome version can predate a rule entirely (noExcessiveLinesPerFile needs >=2.3.12), and a rule's group (style/complexity/nursery) shifts across releases (added 2026-07-21)
- [publish] `gh pr merge --delete-branch` routinely fails to delete the branch (local and/or remote) whenever it's checked out in any worktree — expected here, since this workflow leaves each task's worktree in place until an explicit cleanup step. Treat the failure as normal: confirm the merge itself succeeded via `gh pr view --json state,mergedAt`, then `git worktree remove` the task's worktree, `git branch -D` the local branch, and `git push origin --delete` the remote one — verify the remote is actually gone with `git ls-remote --heads`, since a failed local deletion seems to abort before remote deletion runs (added 2026-07-21)
- [publish] After ExitWorktree removes a worktree whose branch was renamed post-creation, check `git branch --list "ps/*"` for a survivor — it only deletes the name it originally auto-generated, leaving a rename behind for a manual `git branch -D` (added 2026-07-21)
