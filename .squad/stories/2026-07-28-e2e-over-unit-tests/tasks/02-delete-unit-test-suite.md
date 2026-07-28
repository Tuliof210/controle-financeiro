# Delete the unit-test suite

## Outcome
- No `*.test.ts` / `*.test.tsx` anywhere, no Vitest in `package.json` or the
  lockfile, no `vitest.config.ts`, and `npm run test` is the e2e run from task 01.
- Nothing left in `src/` that only existed to serve a test, and nothing left in
  `src/` that only a deleted test still called.
- No doc, learning or debt entry still names a deleted file.

## Independently shippable
yes

## Scope
- In: every test file, `vitest.config.ts`, `package.json`, the test-only helpers
  under `src/`, `.squad/ARCHITECTURE.md` (Testing section), `CLAUDE.md`,
  `src/styles/README.md`, `src/styles/docs/Overview.mdx`, `.squad/learnings.md`,
  `.squad/debt.md`
- Out: `playwright.config.ts` and the e2e folder (task 01 owns them); any behaviour
  change beyond removing code the deletion strands
- Imitate: the headers of `.squad/learnings.md` and `.squad/debt.md` — both state
  what happens to an entry whose subject no longer exists. Follow them literally.
- Reuse: nothing

## When to run
- Depends on: 01
- Parallel-safe with: none

## Verify
- `find src -name "*.test.ts" -o -name "*.test.tsx"` and
  `grep -rn "vitest" src package.json` — both empty.
- `npx tsc --noEmit` — the only thing that catches an import left pointing at a
  deleted helper.
- `npm run lint` && `npm run build` && `npm run test`.
- Before finishing, grep the whole repo (docs and `.squad/` included) for the
  basename of every file you deleted. Several `*.helper.ts` under `src/` are imported
  only by tests, two style docs cite a test file by name, and both `.squad/debt.md`
  entries are about test files — establish the real set yourself with that grep;
  this list is a pointer, not an inventory.
- The Testing section of `.squad/ARCHITECTURE.md` must end up stating what is tested
  (user-visible behaviour, end to end) and what is not (files, helpers, hooks in
  isolation), and naming the command from task 01.

## Forbidden
- Leaving a test-only file alive because its name lacks `.test`
- Rewording a learning or debt entry whose subject was deleted, instead of removing it
- Keeping `vitest` as a devDependency, or `vitest.config.ts`, "in case"
- Deleting production code that still has a non-test caller — grep every caller
  before each removal, and delete only what the grep proves is stranded
- Adding a replacement unit test, snapshot or assertion anywhere
