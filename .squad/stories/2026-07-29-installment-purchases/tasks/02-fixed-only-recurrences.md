# /recorrencias goes back to being only the stable stuff

## Outcome
- `/recorrencias` lists only `kind: "fixed"` rows. An installment created
  through the API is invisible there, including in the "Saídas" header total.
- The dashboard, the ceiling and the derived period still count that
  installment — no figure on `/` changes.
- A person whose only remaining rows are installments still gets the 409 on
  delete, but the message now says where to find them.

## Context

- **The filter seam is the whole risk.** `listRecurrences()` in
  `src/app/api/recurrences/service.ts` is a one-line passthrough to the SAME
  `recurrenceRepository.list()` that `/api/dashboard` and `/api/period` call.
  Filtering at or below it silently drops installments from
  `series.helper.ts`'s estimated-expense sum and from `derivePeriod`'s
  `Math.min`/`Math.max`. Nothing type-checks that away and no test covers it.
  **Filter client-side.**

- **Where it goes.** `src/components/EntryScreen/hook.ts:44` is the one place
  items are narrowed today:

  ```ts
  const { income, expense } = splitByType(visibleFor(items, profile));
  ```

  Add an optional predicate to `EntryScreenConfig` in
  `src/components/EntryScreen/types.ts` (61 lines) and apply it in that same
  expression. `MovementsScreen` omits it and is unaffected;
  `RecurrencesScreen` passes the `kind === "fixed"` test. `T extends Entry` and
  `Entry` has no `kind`, so the predicate is typed `(item: T) => boolean` and
  the concrete `Recurrence` supplies the field at the call site.

- **Do NOT filter via `resource`.** `EntryScreen/hook.ts:23,70` builds
  `const path = "/api/" + resource` and then `apiDelete(`${path}?id=${...}`)`.
  A `resource="recurrences?kind=fixed"` would leave GET and PUT working while
  DELETE becomes `?kind=fixed?id=…` → `searchParams.get("id")` is `null` → 422
  "Parâmetro id é obrigatório". Silent, delete-only.

- **The section total moves, correctly.** `EntrySection/hook.ts:49-51`:

  ```ts
  // `items` arrives already filtered by the person <select> (visibleFor), so the
  // header total always agrees with the rows rendered under it.
  const totalCents = items.reduce((sum, item) => sum + item.valueCents, 0);
  ```

  It sums whatever it is handed, so the "Saídas" header drops by the
  installments' monthly sum. That is the intended reading — the comment above
  it stays true and needs no edit.

- **The 409 dead end this creates.** `src/app/api/people/route.ts:78-85` maps
  `P2003` to `fail("Pessoa possui registros vinculados", "conflict", 409)`, and
  `configuracoes/.../PeopleSection/hook.ts` surfaces the string verbatim. Until
  now the owner could clear the blockers from `/recorrencias` and
  `/movimentacoes`; after this filter, a person blocked only by installments
  sees a screen showing nothing. Name the three screens in that message.
  `Recurrence.ownerId` is `ON DELETE RESTRICT` — nothing structural changes,
  only the copy.

- **Watch out for** the coverage band: `/api/period` derives its range from
  every recurrence including the now-hidden ones, and
  `RecurrencesScreen`'s `CoverageBar` draws against that axis. A long
  installment legitimately shrinks the bands of the visible fixed rows. That is
  correct — the axis is the projection's, not the list's — and must not be
  "fixed" by narrowing `derivePeriod`.

## Scope
- In: `src/components/EntryScreen/{types.ts,hook.ts}`,
  `src/app/recorrencias/_components/RecurrencesScreen/index.tsx`,
  the 409 message in `src/app/api/people/route.ts`.
- Out: `src/app/api/recurrences/**`, `src/infra/**`, `src/core/**`,
  `src/app/api/dashboard/**`, `MovementsScreen`. `EntryScreen/index.tsx` is
  already 116 lines — do not add to it; the predicate belongs in the hook.

## Verify
- `npm run lint`, `npx tsc --noEmit`.
- `npm run dev`. POST an installment (`kind: "installment"`, an owner from
  `/api/people`, months inside the existing range) and confirm on
  `/recorrencias` that it is absent and the "Saídas" total excludes it.
- Same before/after `diff` on
  `curl -s 'http://localhost:3000/api/dashboard?owner=familia' | jq -S '.data'`
  taken around this task's commit — the installment must still be summed.
- `curl -s -X DELETE 'http://localhost:3000/api/people?id=<owner-with-only-installments>'`
  and read the message back.
- `wc -l` every touched file.

## Forbidden
- Any `where`/`kind` argument on `recurrenceRepository.list()`,
  `listRecurrences()`, or `GET /api/recurrences`.
- Encoding the filter into `resource`.
- A second fetch, or a new endpoint, to get the fixed rows.
- Changing `derivePeriod`, `series.helper.ts`, or `EntrySection`'s total.
