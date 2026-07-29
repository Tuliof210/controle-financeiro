# Point the e2e suite at the forecast names

## Outcome
- `npm run test` is green again, driving `/previsoes` and `/api/forecasts`.
- No spec, helper or fixture name in `e2e/` still says recurrence.
- The whole story's Definition of Done passes from this commit.

## Context
Everything that breaks, with what it is today:

- `e2e/seed.helper.ts` — three `post("/api/recurrences", {...})` calls at
  `:40`, `:47`, `:68`, plus the exported fixture consts
  `SHORT_RECURRENCE = "Luz"` (`:14`) and `SPLIT_RECURRENCE = "Rateio"` (`:19`).
  Rename the consts to `SHORT_FORECAST` / `SPLIT_FORECAST`; the string values
  are display names and stay as they are.
- `e2e/row.helper.ts:8,19` — imports `SHORT_RECURRENCE` and puts it in `LISTS`:
  `{ path: "/recorrencias", long: LONG_NAME, short: SHORT_RECURRENCE }`. This
  one file feeds `row-columns.spec.ts` and `row-hit-target.spec.ts` as well as
  `row-overflow.spec.ts`, so the single `path` edit fixes three specs.
- `e2e/nav-drawer.spec.ts` — the label `"Recorrências"` in the expected-labels
  array (`:21`), `page.getByRole("link", { name: "Recorrências" })` (`:61`), and
  `await expect(page).toHaveURL("/recorrencias")` (`:63`). All three become
  `"Previsões"` / `/previsoes`, matching what task 04 put in
  `src/components/AppShell/nav.ts`.
- `e2e/row-overflow.spec.ts:8` —
  `const ROUTES = ["/recorrencias", "/movimentacoes", "/configuracoes"]`.
- `e2e/ceiling.spec.ts` — comments only (`:28`, `:90`), including the one
  explaining that the range end comes from `SPLIT_RECURRENCE`'s months. Update
  the prose with the const.
- `.squad/debt.md:29` — an entry that cites a measurement taken "on
  /recorrencias". Update the path so the debt stays findable; change nothing
  else about the entry.

- **Watch out for a green-but-wrong run.** `e2e/api.helper.ts:11-18`'s `post`
  does `return (await res.json()).data` with no status check, and `list` does
  `... .data ?? []`. A stale route yields `undefined`/`[]` rather than a thrown
  error, so a missed rename can degrade a spec into asserting on an empty
  dataset instead of failing. `waitFor` (`:28-34`) is the only thing that
  throws. After the edits, confirm the specs are passing *with* seeded rows —
  a suspiciously fast `ceiling.spec.ts` is the tell.
- **Watch out for** `fullyParallel` being unset: workers scale with spec-file
  count, so geometry assertions can redden under load. Use `settle`
  (`e2e/settle.helper.ts`) before measuring — never add `retries`.
- **Watch out for** Next 16 refusing a second `next dev` from the same
  directory: kill any manual dev server before `npm run test` boots its own
  on :3100.

## Scope
- In: `e2e/seed.helper.ts`, `e2e/row.helper.ts`, `e2e/nav-drawer.spec.ts`,
  `e2e/row-overflow.spec.ts`, `e2e/ceiling.spec.ts`, `.squad/debt.md`.
- Out: everything under `src/` and `prisma/`. If a spec fails because the app
  is wrong, that is a task 03/04 defect — report it, do not patch the spec to
  match a bug.

## Verify
```bash
npm run test
npm run lint
npx tsc --noEmit
npm run build
sqlite3 dev.db "SELECT count(*) FROM Forecast; SELECT count(*) FROM ForecastMonth;"
grep -rniE "recurren|recorrenc" --include="*.ts" --include="*.tsx" --include="*.scss" --include="*.prisma" --include="*.json" src/ e2e/ prisma/schema.prisma package.json
```
Suite green, first four clean, the counts print `5` then `76`, and the grep
returns nothing. (`prisma/migrations/` is deliberately excluded — the old
migration folders keep their names.)

## Forbidden
- `test.skip`, `test.fixme`, `retries`, or a loosened locator to get green.
- Adding `data-testid` attributes — this suite locates by role and text, and
  nothing in the repo uses test ids.
- Renaming the fixture display names `"Luz"` and `"Rateio"`, or changing any
  seeded value/month — the ceiling assertions are computed from them.
