# Swap the unit-test suite for an e2e harness

## Why
68 colocated `*.test.ts` files pin implementation detail, not behaviour: moving a
helper or renaming a hook breaks green tests that never guarded anything a user can
see. The owner pays that tax on every story, alone, and gets no confidence back.

## Acceptance Criteria
- [x] Playwright boots the real app against a throwaway SQLite file, with zero specs
      written — behaviour coverage is a later story
- [x] No `*.test.ts` / `*.test.tsx`, no Vitest, and no file left in `src/` that only
      existed to serve a test
- [x] `.squad/ARCHITECTURE.md`'s Testing section describes e2e-by-behaviour, and no
      doc, learning or debt entry still names a deleted test file

## Definition of Done
- [x] `npm run test` exits 0 and is the Playwright run
      (owner accepted a zero-spec harness: this proves the runner is wired, not that
      the app boots — the first spec is what proves that)
- [x] `npm run lint` and `npm run build` green
- [x] A repo-wide grep for `vitest` and for both test globs comes back empty

## Tasks
- [x] tasks/01-playwright-e2e-harness.md — wire Playwright against a throwaway DB
- [x] tasks/02-delete-unit-test-suite.md — delete every test, Vitest, and every
      reference left dangling
