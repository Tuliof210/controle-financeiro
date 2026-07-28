# End-to-end proof of the import and the re-import lock

## Outcome
- A spec drives `/leitor-ofx`: upload an OFX fixture, open the dialog, fill the
  identifier, import, and assert the named movements are on `/movimentacoes`.
- The same spec re-uploads the same file and asserts the Importar button is disabled.
- Both assertions are proven able to fail before the task is done.

## Context
- **Imitate** `e2e/row-overflow.spec.ts` for style. Role and text selectors only —
  `getByTestId` appears nowhere in this repo, and neither does `waitForTimeout`. The
  first navigation pays for Turbopack's cold compile, hence the generous timeout:
  ```ts
  await expect(page.getByText(LONG_NAME).first()).toBeVisible({ timeout: 15_000 });
  ```
- **Reuse** `e2e/seed.helper.ts` — `test.beforeAll(seed)` seeds people/recurrences/goals
  by `fetch`ing the app's own REST API at a hardcoded `http://localhost:3100`, not
  Prisma. Its cross-worker lock is `Person.name @unique`: "Whoever creates SHORT_PERSON
  writes the rows; everyone else waits for the short goal, which is written last."
  A spec that seeds outside `seed()` will race the other workers on the shared `e2e.db`.
- **Watch out for the shared database.** `playwright.config.ts` has no `projects`, no
  per-test isolation, and workers default to cores/2 against one `e2e.db`. The import is
  keyed on a file hash that is globally unique in that DB — so the fixture this spec
  imports must be used by no other spec, and the spec must tolerate having been the one
  that already imported it if it re-runs against a warm DB. `rm -f e2e.db` in
  `webServer.command` means a full `npm run test` always starts cold; a `--repeat-each`
  or a re-run against a hand-started server does not.
- **The fixture is a file you write**, not one that exists — put a small hand-authored
  `.ofx` under `e2e/` covering at least two months, one of them zero-filled. It must
  contain a checking-account statement (`<STMTRS>`): `readOfx` refuses `card_only`,
  `no_statement`, `not_ofx` and `empty` before a report exists, so a card-only or
  transaction-less fixture never reaches the screen at all.
- **Upload** goes through `FilePicker` → a real `<input type="file">`; Playwright's
  `setInputFiles` on that input is the only way in — there is no drag-drop test precedent
  in this repo to copy.
- **Watch out for the minus sign**: `formatMoney` emits U+2212 (`−`), not an ASCII
  hyphen, and the existing helper's `row.getByText(/^R\$/)` matches only the unsigned
  form. Match the movement by its generated **name** (`Entrada <id> <Mmm/AA>`), which is
  plain text, rather than by a formatted amount.
- **Watch out for the seed's months.** `seed.helper.ts` writes `202601`–`202603`, and the
  fixture's months widen the derived period further. Nothing in this spec should assert
  on the dashboard: `derivePeriod` + `currentYYYYMM()` can legitimately put the app in
  `out_of_range` on a fresh e2e DB, and that is not this story's business.
- **Verify with** `npm run test:e2e` (aliased `npm run test`) → `playwright test`. There
  is no `typecheck` script; `npm run build` is the only type gate, and `tsconfig.json`'s
  `**/*.ts` include covers `e2e/`, so a type error in the spec fails the build.
- **Watch out for** `reuseExistingServer: false` plus the recorded fact that Next 16
  refuses a second dev server launched from the same directory — kill any manual
  `npm run dev` before running the suite.

## Scope
- In: `e2e/` — one new spec file and one new `.ofx` fixture
- Out: every file under `src/`. If the spec cannot express something, that is a finding
  to report, not a licence to change the app to suit the test.

## Verify
- `npx playwright install chromium` once, then `npm run test` — the whole suite, not just
  the new file, and green.
- Prove each new assertion can fail: revert the disabled state on the Importar button and
  watch the re-import assertion go red; change the name template and watch the
  movement-name assertion go red. Restore both before committing.
- `npm run lint` && `npm run build`.
- `wc -l` every file you created.

## Forbidden
- Do not use `getByTestId`, `waitForTimeout`, or a CSS-class selector.
- Do not add `data-testid` attributes to application code to make the spec easier.
- Do not seed by writing to SQLite directly; go through the HTTP API like `seed.helper.ts`.
- Do not assert on anything under `/` (the dashboard) — see the `out_of_range` note.
- Do not add `--pass-with-no-tests` to any script; it is configured nowhere despite what
  `CLAUDE.md` and `.squad/ARCHITECTURE.md` still claim.
