# Learnings — Pocket Squad

Durable, one-line rules. Appended by /ps:publish after each merge; read by
/ps:story during refinement. A rule must change future behavior — otherwise
delete it. Cap: 30 rules; when adding past the cap, delete the weakest one.

Format: `- [scope] imperative rule (added YYYY-MM-DD)`

---

- [worktree] After EnterWorktree, immediately rename the branch to ps/<story-slug>/<task-slug> — it auto-generates worktree-ps+<slug>+<task> (/ → +), breaking the ps/<slug>/* convention /ps:load's PR cross-check relies on (added 2026-07-21)
- [worktree] A tool that derives a name from cwd (create-next-app ., npm init, etc.) can fail inside an EnterWorktree directory since its +-joined basename isn't a valid npm package name — scaffold into a throwaway subdir first, then move the generated files up (added 2026-07-21)
- [biome] Run `npx biome explain <rule>` before trusting any rule snippet — create-next-app's pinned Biome version can predate a rule entirely (noExcessiveLinesPerFile needs >=2.3.12), and a rule's group (style/complexity/nursery) shifts across releases (added 2026-07-21)
- [publish] Exit the task worktree back to the main checkout before `gh pr merge --delete-branch`, not after — its local cleanup checks out the base branch, which fails if that branch is already checked out in the main worktree (added 2026-07-21)
- [publish] After ExitWorktree removes a worktree whose branch was renamed post-creation, check `git branch --list "ps/*"` for a survivor — it only deletes the name it originally auto-generated, leaving a rename behind for a manual `git branch -D` (added 2026-07-21)
