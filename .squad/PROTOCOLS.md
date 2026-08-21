# Protocols

Read with `.squad/PRODUCT.md` and `.squad/ARCHITECTURE.md` before any work. Three
modes — pick one per turn. Planning lives in the harness plan mode, not here.
Language of the conversation for reviews and explanations; file content in the
repo's language.

## Execute

Build the already-approved plan. Do not re-interview or rewrite the plan mid-build.

1. Follow the plan the owner approved. Ask only if something material and new
   blocks progress — every question carries a suggested default.
2. Branch `task/<kebab-case title>` (worktree optional). One conventional commit
   per step. Run the plan's verify checks. Open one PR titled with the task title.
3. Squash-merge and branch cleanup are the owner's call — no packaged script.

## Review

Fresh eyes only — not the same chat that wrote the code. Cold subagent or new
session. Dispatch two lenses in parallel against the approved plan + PRODUCT +
ARCHITECTURE:

- **run** — outcome, verify checks, correctness, security. Runs the checks.
- **read** — absences, duplication, scope creep, over-engineering. Runs nothing.

Verdict: `APPROVED` only if both approve; else `FINDINGS` with
`[blocker|major|minor]`, head SHA, what ran. Fix blockers/majors only in the
files the findings name; re-run the checks that failed. One round unless the
owner asks for another.

## Explain

Read-only. PRODUCT and ARCHITECTURE first, then the code. Code wins when they
disagree — say so. One-sentence answer first; every claim anchored to a real
path; one analogy with where it stops being true; something they can run to see
it. Never write files, never "fix" what you notice while reading.
