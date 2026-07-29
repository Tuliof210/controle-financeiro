# One home for the e2e fetch plumbing

## Outcome
- `BASE_URL`, `post`, `list` and `waitFor` exist once in `e2e/`.
- `seed.helper.ts` and `ceiling.helper.ts` keep their own fixture data untouched —
  no spec's seeded rows change.
- Closes `.squad/debt.md:35`.

## Context

**The duplication is exact.** Diffing the `type Named` → `throw new Error(...)`
span of both files returns an identical block — same `post`, same `list`, same
`waitFor` (100 attempts × 100 ms), same `?? []`:
```ts
type Named = { id: string; name: string };
async function post(path: string, body: unknown) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  return (await res.json()).data;
}

async function list(path: string): Promise<Named[]> {
  return (await fetch(`${BASE_URL}${path}`).then((r) => r.json())).data ?? [];
}

async function waitFor(path: string, name: string) {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    if ((await list(path)).some((row) => row.name === name)) return;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(`${path} never got a row named ${name}`);
}
```
`e2e/ceiling.helper.ts:28-49` and `e2e/seed.helper.ts:26-47`. The `BASE_URL`
declaration and its two comment lines are byte-identical too
(`ceiling.helper.ts:5-7`, `seed.helper.ts:3-5`).

**Nothing imports them.** All four symbols plus `type Named` are module-private in
both files — no `export`. The full import graph out of the two helpers:

| importer | from `seed.helper` | from `ceiling.helper` |
|---|---|---|
| `e2e/ceiling.spec.ts` | `{ seed }` | `{ CEILING_PERSON, DEEPEST_RED_HOLE, FIRST_RED_HOLE, RED_PERSON, seedCeiling }` |
| `e2e/row-overflow.spec.ts` | `{ LONG_NAME, LONG_PERSON_NAME, seed }` | — |
| `e2e/row-hit-target.spec.ts` | `{ seed }` | — |
| `e2e/row-columns.spec.ts` | `{ seed }` | — |
| `e2e/ofx-import.spec.ts` | `{ seed }` | — |
| `e2e/row.helper.ts` | `{ LONG_NAME, LONG_PERSON_NAME, SHORT_GOAL, SHORT_MOVEMENT, SHORT_PERSON, SHORT_RECURRENCE }` | — |

So moving the private four changes **zero import lines** in any spec.

**Imitate** the naming and the header comment every non-spec file in `e2e/`
carries — Playwright only collects `*.spec.ts`, and each helper says so, e.g.
`e2e/settle.helper.ts:1-2`:
```ts
// Not a spec — playwright only collects `*.spec.ts`. One wait, shared by every
// spec that asserts on a coordinate.
```

**Reuse** `BASE_URL = "http://localhost:3100"` with its existing justification —
`localhost`, not `127.0.0.1`, matching `playwright.config.ts`'s `baseURL` because
Next 16 dev blocks cross-origin dev resources outside `allowedDevOrigins`.

- **Watch out for** the stated reason the two seed files are separate, which this
  task must not undo — `ceiling.helper.ts:1-3`:
  > Fixture for the dashboard ceiling card, kept out of seed.helper.ts so the four
  > row specs keep the exact data they were written against.

  Folding the *transport* honours that; folding the *seed data* violates it.
- **Watch out for** the ordering contract in `e2e/ceiling.spec.ts:26-29` — its
  `beforeAll` calls `await seed()` before `seedCeiling()` because the range is
  derived from every entry in the database. A refactor must not change when either
  runs.
- **Watch out for** the cross-worker lock both files rely on: `Person.name` is the
  only `@unique` column, so whoever creates the shared person writes the rows and
  every other worker polls `waitFor`. `waitFor`'s 100×100ms budget is that lock's
  timeout — do not shorten it.
- **Verify with** `npm run lint`, `npx tsc --noEmit`, `npm run test:e2e`.

## Scope
- In: a new `e2e/*.helper.ts` for the transport, plus the import lines at the top
  of `e2e/seed.helper.ts` and `e2e/ceiling.helper.ts`.
- Out: every exported constant in both files (`LONG_NAME`, `CEILING_PERSON`, …),
  the `seed`/`seedCeiling` bodies, `e2e/row.helper.ts`,
  `e2e/ceiling-page.helper.ts`, `e2e/settle.helper.ts`, and all five spec files.

## Verify
```
npm run lint
npx tsc --noEmit
npm run test:e2e
```
`npx playwright test --list` must still report `Total: 53 tests in 5 files` — the
count is the proof that no file became a spec or stopped being one. Run the suite
twice: this touches cross-worker seeding, and a race here fails intermittently,
not deterministically.

## Forbidden
- Do not merge the two seed functions or move fixture data between them.
- Do not export the transport helpers from `seed.helper.ts` — that would make one
  fixture file depend on the other, which is the coupling the split avoided.
- Do not name the new file `*.spec.ts`.
- Do not change `waitFor`'s attempt count or interval.
- Do not switch `BASE_URL` to `127.0.0.1` or read it from `playwright.config.ts`.
