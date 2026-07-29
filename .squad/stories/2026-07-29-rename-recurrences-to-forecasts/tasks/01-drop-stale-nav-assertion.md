# Drop the stale "Parcelamentos" nav assertion

## Outcome
- `npm run test` is green on the story branch before any rename lands, so every
  later task has a trustworthy baseline.
- The mobile-drawer spec asserts exactly the six destinations the nav actually
  has.

## Context
The installment-purchases feature was reverted (commits `15ed39f`, `a11edeb`),
but the revert missed one assertion. `e2e/nav-drawer.spec.ts:18-28` loops over
seven expected link labels:

```ts
    for (const label of [
      "Dashboard",
      "Movimentações",
      "Recorrências",
      "Parcelamentos",
      "Leitor OFX",
      "OFX Decoder",
      "Configurações",
    ]) {
      await expect(nav.getByRole("link", { name: label })).toBeVisible();
    }
```

`src/components/AppShell/nav.ts:17-24` declares six `NAV` entries and none of
them is "Parcelamentos" — the test cannot pass. This is pre-existing red on
`main`, unrelated to the rename; it is fixed here only so the rest of the story
can use `npm run test` as proof.

- **Watch out for** the sibling label `"Recorrências"` on line 21 — it is
  correct today and is task 05's problem, not this one. Leave it.
- **Verify with** `npm run test` — confirmed at `package.json:15` (`npm run
  test:e2e` → `playwright test`, `package.json:16`). It boots its own dev server
  on :3100 against a throwaway `e2e.db` (`playwright.config.ts:21`), so `dev.db`
  is untouched.
- **Watch out for** Next 16 refusing a second dev server started from the same
  directory — kill any manually started dev server before running the suite.

## Scope
- In: `e2e/nav-drawer.spec.ts`
- Out: `src/components/AppShell/nav.ts` — the nav is correct; do not add a
  "Parcelamentos" destination to make the test pass. Any other spec.

## Verify
```bash
npm run test
```
Whole suite green. If anything other than `nav-drawer.spec.ts` was already
failing on `main`, report it rather than fixing it here — it is a separate
story.

## Forbidden
- Re-introducing any part of the reverted installments feature.
- Weakening the assertion (e.g. dropping the loop, or asserting a count instead
  of the labels) — remove the one dead entry, nothing else.
- `test.skip`, `test.fixme`, or adding `retries` to make it pass.
