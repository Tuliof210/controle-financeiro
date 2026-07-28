# Playwright e2e harness

## Outcome
- An e2e command exits 0 from a clean checkout with zero spec files present.
- The run boots the app itself and points Prisma at a throwaway SQLite file that it
  migrates and can delete — never `dev.db`.
- `.squad/ARCHITECTURE.md` and `CLAUDE.md` name the command and where specs will live.

## Independently shippable
yes

## Scope
- In: `playwright.config.ts`, `package.json` (one devDependency + a `test:e2e`
  script), `.gitignore`, the e2e folder, `.squad/ARCHITECTURE.md`, `CLAUDE.md`
- Out: writing any spec, fixture or page object; anything under `src/`; `vitest.config.ts`
  and the existing `test` script — task 02 owns both
- Imitate: `.gitignore`'s `# prisma (local sqlite db files)` block — the throwaway DB
  gets its ignore entries the same way
- Reuse: `prisma.config.ts` already resolves `DATABASE_URL` with a fallback, and the
  `db:setup` script already applies migrations to whatever it points at — the config
  supplies the env var, it does not reimplement either

## When to run
- Depends on: none
- Parallel-safe with: none — task 02 edits the same `package.json`, `ARCHITECTURE.md`
  and `CLAUDE.md`

## Verify
- Run the new e2e command: it must exit 0. Playwright fails a zero-spec run by
  default — find the flag for that in `npx playwright test --help`, do not add a
  placeholder spec to dodge it.
- Note `dev.db`'s mtime before and after the run and confirm it is unchanged, and
  that the file the run actually created is the throwaway one.
- `npm run lint` && `npm run build` && `npm run test` (Vitest still exists here).

## Forbidden
- A spec, fixture, page object, helper or `test-utils` file "for later" — the folder
  ships empty
- A `webServer` that reuses an already-running `next dev`, or one that inherits the
  ambient `DATABASE_URL`
- Touching `vitest.config.ts`, the `test` script, or any `*.test.ts`
- Adding a second devDependency (a reporter, a matcher library, `dotenv-cli`) —
  Playwright's config file can set env vars on its own
