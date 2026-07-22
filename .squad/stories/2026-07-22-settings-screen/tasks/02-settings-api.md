# Settings API — people, goals, settings Route Handlers

## Description
Expose the persistence spine (task 01) over HTTP via Next Route Handlers,
following `.squad/ARCHITECTURE.md`'s thin-`route.ts` + `service.ts` split,
Zod-validated at the boundary, all returning the shared success/error
envelope. Three resources:

- **`/api/people`** — `GET` (list), `POST` (create `{ name, color }`),
  `DELETE` (by `id`).
- **`/api/goals`** — `GET` (list), `POST` (create `{ name, targetCents }`),
  `DELETE` (by `id`).
- **`/api/settings`** — `GET` (the singleton), `PUT` (partial upsert of
  `{ rangeStart?, rangeEnd?, monthlyGoalCents? }`).

## When to run
- Depends on: 01-persistence-spine
- Parallel-safe with: 03-money-input, 04-form-primitives

## How-to
Mirror the existing `src/app/api/health/{route.ts,service.ts}` structure and
its `NextResponse.json({ data })` shape. `route.ts` is the only file allowed
to import `next/server`; `service.ts` stays framework-agnostic and wires the
concrete repository from task 01 by plain import (e.g.
`import { personRepository } from "@/infra/repositories/person.prisma.repository"`).

> **Worktree note (for /ps:run):** task 01 runs `npm install zod` and adds a
> `postinstall`. A fresh worktree branches from updated `package.json` but an
> empty `node_modules` for the new dep — run `npm install` at the start of
> this task so `zod` and the generated Prisma client are present before
> `next build`.

1. **Shared envelope helper** `src/lib/http.ts` (promoted immediately — every
   route consumes it):
   ```ts
   import { NextResponse } from "next/server";

   export const ok = <T>(data: T, status = 200) =>
     NextResponse.json({ data }, { status });

   export const fail = (message: string, code: string, status = 400) =>
     NextResponse.json({ error: { message, code } }, { status });
   ```
   (`ok`/`fail` keep every route on the same `{ data }` / `{ error: { message, code } }`
   contract the frontend relies on.)

2. **`/api/people`** — `src/app/api/people/{route.ts,service.ts,service.test.ts}`:
   - Zod schema in `route.ts`:
     `z.object({ name: z.string().trim().min(1).max(60), color: z.enum(PALETTE) })`
     where `PALETTE = ["violet","lime","magenta","green","red","amber","cyan"] as const`.
     Export `PALETTE` from a small shared module `src/lib/palette.ts` so task
     04's `ColorPicker` and the schema share one source of truth.
   - `route.ts`: `GET` → `ok(await listPeople())`; `POST` → parse body with
     `safeParse`, on failure `fail("Dados inválidos","validation",422)`, else
     `ok(await createPerson(parsed.data), 201)`, catching a duplicate-name
     Prisma error (`P2002`) → `fail("Já existe uma pessoa com esse nome","duplicate",409)`;
     `DELETE` → read `id` from `?id=` query, `fail(...,"validation",422)` if
     missing, else `deletePerson(id)` → `ok({ id })`.
   - `service.ts`: `listPeople`/`createPerson`/`deletePerson` delegating to
     `personRepository`. Keep it thin.
   - `service.test.ts` (Vitest): mock the repository module
     (`vi.mock("@/infra/repositories/person.prisma.repository", ...)`) and
     assert each service function calls the repo correctly and returns its
     result. (Services are thin, but this locks the wiring per
     `.squad/ARCHITECTURE.md`'s "every non-trivial service gets a test".)

3. **`/api/goals`** — same three files, same pattern. Schema:
   `z.object({ name: z.string().trim().min(1).max(80), targetCents: z.number().int().min(1) })`.
   No duplicate constraint. `service.test.ts` mirrors people's.

4. **`/api/settings`** — `src/app/api/settings/{route.ts,service.ts,service.test.ts}`:
   - `GET` → `ok(await getSettings())`.
   - `PUT` schema (all optional, partial upsert):
     ```ts
     const YYYYMM = z.number().int().min(190001).max(999912);
     z.object({
       rangeStart: YYYYMM.nullable().optional(),
       rangeEnd: YYYYMM.nullable().optional(),
       monthlyGoalCents: z.number().int().min(0).nullable().optional(),
     }).refine(s => s.rangeStart == null || s.rangeEnd == null || s.rangeEnd >= s.rangeStart,
       { message: "Fim não pode ser antes do Início", path: ["rangeEnd"] })
     ```
     On failure `fail(issue.message ?? "Dados inválidos","validation",422)`
     (surface the refine message so the UI can show "Fim antes do Início").
     On success `ok(await saveSettings(parsed.data))`.
   - `service.ts`: `getSettings`/`saveSettings(patch)` delegating to
     `settingsRepository`. Note the refine only guards when **both** bounds
     are present in the same request; a partial PUT (only `monthlyGoalCents`)
     passes. Cross-field validation against the already-stored bound is out of
     scope — the frontend (task 05) always sends both range bounds together.
   - `service.test.ts`: mock the settings repo, assert `getSettings` and
     `saveSettings` delegate and return.

Keep each file under 100 lines (Biome cap). Do not let `service.ts` import
`next/server`. Reuse `ok`/`fail` everywhere — no ad-hoc response shapes.

## Verification
- `npm run test` — new `service.test.ts` files pass (plus existing health test).
- `npm run lint` — Biome all-green.
- `npm run build` — routes compile.
- Manual smoke (dev server): `curl -X POST localhost:3000/api/people -H 'content-type: application/json' -d '{"name":"Tulio","color":"violet"}'` returns `{"data":{...}}`; a second identical POST returns `409 duplicate`; `curl -X PUT localhost:3000/api/settings -d '{"rangeStart":202508,"rangeEnd":202501}'` returns `422` with the "Fim não pode ser antes do Início" message.
