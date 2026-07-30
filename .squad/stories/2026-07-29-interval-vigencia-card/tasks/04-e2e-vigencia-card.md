# E2E coverage for the Vigência card

## Outcome
- A spec asserts the card's two new user-visible read-outs: the month range text
  and the duration badge, both for a locked row (`1 MÊS`) and for a range
  spanning several months.
- A spec asserts the forecast modal has no horizontal overflow at 375px with two
  interval cards open, and that the `Mês único` toggle and the remove button each
  answer a 44px tap.
- `npm run test` is green end to end.

## Context

**Extend `e2e/interval-lock.spec.ts` (60 lines). Do not add a spec file.**
`fullyParallel` is unset in `playwright.config.ts`, so worker count scales with
spec *file* count — an eighth file loads every existing spec harder and can
redden a geometry assertion that never flaked before. This spec already opens the
forecast form and already owns the lock behaviour, so the new assertions belong
in it.

**Imitate its existing setup**, verbatim from the file — it seeds its own person
rather than reusing `seed.helper.ts`, because those rows are shared with the
`row-*` specs:
```ts
  await page.goto("/previsoes");
  await page
    .locator("section")
    .filter({ hasText: "Saídas" })
    .getByRole("button", { name: "Nova previsão" })
    .click();
```
and its locators, which are the contract task 02 must not break:
```ts
  await expect(page.getByLabel("Mês - mês")).toBeVisible();
  await expect(page.getByLabel("Fim - mês")).toHaveCount(0);

  const lock = page.getByRole("checkbox", { name: "Mês único" });
  await lock.uncheck();
  await expect(page.getByLabel("Início - mês")).toBeVisible();
  await expect(page.getByLabel("Fim - mês")).toBeVisible();
```

**Reuse** `e2e/settle.helper.ts` before any measurement, and `e2e/row.helper.ts`
which already exports `GUTTER`, `LISTS`, `openRow`, `overlaps`, `PAIR_GAP` —
take the layout constants from there instead of re-deriving them. Read
`e2e/row-overflow.spec.ts` and `e2e/row-hit-target.spec.ts` for the established
shape of an overflow check and a 44px hit-test; imitate them rather than
inventing a new measurement style.

**Locators the card exposes.** The repo has zero `data-testid` and locates by
role and accessible name — keep it that way. Available names after task 02:
role `checkbox` name `Mês único`; role `button` name `Remover intervalo 1` /
`Remover intervalo 2` (rendered only when more than one interval exists); role
`button` text `Adicionar intervalo`; the four `MonthPicker` `aria-label`s
(`Mês - mês`, `Mês - ano`, `Início - mês`, `Início - ano`, `Fim - mês`,
`Fim - ano`). The range text and the duration badge are plain text nodes — locate
them by text scoped to the card, not globally.

**Watch out for:**
- `getByRole("dialog")` alone is a strict-mode violation: the nav drawer is also
  a native `<dialog>` and carries the implicit role. Scope differently.
- `getByText` drops an element when a child matches the same text, and an
  anchored regex like `/^Jan\/26/` matches a wrapper whose own text starts there
   — scope the assertion to the smallest element that owns the string.
- The adjacency merge in `intervals.helper.ts` collapses contiguous months on
  round-trip: two locked rows on Jan and Feb reopen as one unlocked Jan..Feb row.
  Use non-adjacent months (`202601` / `202603`) whenever a test saves and reopens.
- Before any hit-test, `evaluate((el) => el.scrollIntoView({ block: "center" }))`
   — `scrollIntoViewIfNeeded` scrolls the minimum and the element can land under
  something sticky, so `elementFromPoint` reads the wrong node.
- `MonthPicker` self-seeds `onChange` on mount when its value is `null`; the
  interval rows always start non-null, so a freshly opened form already shows the
  current month. Assert against that, not against an empty state.
- Next 16 dev refuses a second dev server from the same directory even on a free
  port — kill any manual `npm run dev` before `npm run test` boots its own on
  :3100.

## Scope
- In: `e2e/interval-lock.spec.ts`.
- Out: every other file in `e2e/`, all of `src/`, `playwright.config.ts`. If an
  assertion fails because of a real defect from tasks 01–03, fix the source in a
  follow-up — do not weaken the assertion to make it pass.

## Verify
```bash
npm run test
npx playwright test e2e/interval-lock.spec.ts
npm run lint
```
Run the full suite, not just this file: the new assertions change worker load for
every other spec. Report the exact pass/fail tail.

## Forbidden
- No new spec file in `e2e/`.
- No `data-testid`, in `e2e/` or in `src/`.
- No `retries` in `playwright.config.ts` — `settle` before measuring instead.
- No `page.waitForTimeout` as a synchronisation primitive.
- No change to `src/` from this task.
