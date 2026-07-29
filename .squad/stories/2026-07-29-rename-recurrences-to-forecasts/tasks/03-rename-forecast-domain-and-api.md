# Rename the domain layer and move the endpoint to /api/forecasts

## Outcome
- The entity, the repository interface, its Prisma implementation and every
  backend consumer speak `Forecast`; nothing in `src/core`, `src/infra` or
  `src/app/api` still says recurrence.
- CRUD answers at `/api/forecasts`; `/api/recurrences` is gone.
- The app compiles and runs end to end again: the screen still lists the same
  rows, the dashboard still computes the same ceiling and period.

## Context
Files to rename (path and symbols both):

- `src/core/entities/recurrence.entity.ts` → `forecast.entity.ts`; type
  `Recurrence` → `Forecast` (fields unchanged: `id, name, valueCents, type,
  ownerId, months: number[], createdAt`).
- `src/core/repositories/recurrence.repository.ts` → `forecast.repository.ts`.
  Verbatim today:
  ```ts
  export type RecurrenceInput = {
    name: string; valueCents: number; type: EntryType; ownerId: string;
    months: number[]; // active YYYYMM months
  };
  export type RecurrenceRepository = {
    list(): Promise<Recurrence[]>;
    create(input: RecurrenceInput): Promise<Recurrence>;
    update(id: string, patch: RecurrenceInput): Promise<Recurrence>;
    delete(id: string): Promise<void>;
  };
  ```
- `src/infra/repositories/recurrence.prisma.repository.ts` →
  `forecast.prisma.repository.ts`: type `RecurrenceRow`, `toEntity`,
  `monthRows`, exported const `recurrenceRepository` → `forecastRepository`,
  and every `prisma.recurrence.*` call → `prisma.forecast.*`. The `months`
  relation accessor keeps its name. Keep the `// ponytail:` comment on line 18.
- `src/app/api/recurrences/` → `src/app/api/forecasts/` (folder move).
  `service.ts` exports `listRecurrences`, `createRecurrence`,
  `updateRecurrence(input: RecurrenceInput & { id: string })`,
  `deleteRecurrence(id: string)`. `route.ts` has `recurrenceShape`,
  `createSchema`, `updateSchema` and these Portuguese strings — rewrite the
  three that name the entity:
  - `:34` `"Erro ao carregar recorrências"`
  - `:68` and `:92` `"Recorrência não encontrada"`
  - `:74` `"Erro ao atualizar recorrência"`
  (`"Dados inválidos"`, `"Pessoa não encontrada"`, `"Parâmetro id é
  obrigatório"` are entity-neutral — leave them.)
- Consumers, variables/params/imports only: `src/app/api/dashboard/service.ts`
  (`const [settings, movements, recurrences, goals]`, `recurrenceRepository.list()`),
  `payload.helper.ts:18` (`recurrences: Recurrence[]` on `PayloadInput`),
  `series.helper.ts` (`accumulate`, `buildSeries(months, movements, recurrences)`,
  the loop var), `src/app/api/period/service.ts`,
  `src/core/use-cases/period.service.ts`
  (`derivePeriod(movements: Movement[], recurrences: Recurrence[])`).
- **Also update the explanatory comments**, not just the identifiers —
  `series.helper.ts` reasons in prose about "Recurrence vs Movement" and
  `dashboard/types.ts:6` says "estimated (Recurrence)". A half-renamed comment
  is worse than none here; this codebase leans on them.

Two frontend lines belong to this task so the app still compiles at the end of
it — everything else about the screen is task 04:
- `src/app/recorrencias/_components/RecurrencesScreen/index.tsx:4` imports
  `Recurrence` from the entity.
- the same file, `:13`, passes `resource="recurrences"`. `EntryScreen` builds the
  URL from it — `src/components/EntryScreen/hook.ts:23`:
  `const path = \`/api/${resource}\`;` — so this literal **is** the endpoint.
  It must become `"forecasts"` in the same commit as the folder move.

- **Watch out for** `src/lib/api.ts`'s helpers never rejecting — unchanged here,
  but it means a wrong `resource` string surfaces as an empty screen, not an
  error. Confirm the list actually renders rows.
- **Watch out for** `src/app/api/recurrences/route.ts` sitting at 96 lines
  against the 100-line cap. `Forecast` is shorter than `Recurrence`, so it
  should shrink — but Biome's counter does not track `wc -l`, so trust
  `npm run lint`, not a line count.
- `npm run test` will be **red** at the end of this task: `e2e/seed.helper.ts`
  still posts to `/api/recurrences`. Task 05 fixes it. Do not chase it here.

## Scope
- In: `src/core/entities/`, `src/core/repositories/`, `src/core/use-cases/`,
  `src/infra/repositories/`, `src/app/api/` (all of it), and exactly the two
  lines named above in `RecurrencesScreen/index.tsx`.
- Out: the rest of `src/app/recorrencias/`, `src/components/`, `e2e/`,
  `prisma/`, `package.json`.

## Verify
```bash
npx tsc --noEmit
npm run lint
npm run build
```
All three clean. Then, with `npm run dev` running, confirm the endpoint serves
the migrated rows:
```bash
curl -s http://localhost:3000/api/forecasts | head -c 300
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/api/recurrences
```
First prints the 5 forecasts under `{"data":[...]}`; second prints `404`.
Kill that dev server before running anything else — Next 16 refuses a second
`next dev` launched from the same directory.

## Forbidden
- Changing the request/response shape: field names (`name`, `valueCents`,
  `type`, `ownerId`, `months`), the `{ data }` / `{ error }` envelope, the Zod
  rules, or which Prisma error code maps to which status.
- Importing `infra/` from `core/`, or `NextRequest`/`NextResponse` into a
  `service.ts`.
- Leaving a re-export shim or an alias at the old entity/repository path.
