# Update (PUT) endpoints for people and goals

## Description
Editing existing people and goals (tasks 05/06) needs an update path that
doesn't exist today. Current CRUD coverage: **people** and **goals** each have
`GET`/`POST`/`DELETE` only (no update); **settings** already has `PUT`. Add a
`PUT`-by-id update to people and goals — route + service + a repository `update`
method + Prisma impl + service tests. **No schema change** — `Person`
(name+color) and `Goal` (name+targetCents) already have every column an edit
writes; update just writes existing columns.

## When to run
- Depends on: 01 (needs a migrated DB to smoke-test the endpoints)
- Parallel-safe with: 02, 03

## How-to
Mirror the existing create/delete slices exactly — same file layout, same
envelope, same Zod-at-the-boundary, same error mapping. Read all of
`src/app/api/people/{route.ts,service.ts,service.test.ts}` and the
`goals` equivalents first, then add the update path alongside.

**People** (`src/app/api/people/`):
- `route.ts` — add a `PUT` handler. Parse the body through a Zod schema
  `{ id: string; name: string; color: <PALETTE enum> }` (full replace — the edit
  modal always submits both fields; reuse the same `PALETTE`/color enum the
  `POST` schema uses). Call `updatePerson`. Map errors like the existing
  handlers: `P2002` (duplicate unique name) → 409, `P2025` (id not found) → 404,
  everything else → 500, all via the shared `{ error: { message, code } }`
  envelope helper already in the file. Keep under 100 lines (extract if needed).
- `service.ts` — add `updatePerson(input)` calling `personRepository.update(id,
  { name, color })`. Framework-agnostic (no `NextRequest`/`NextResponse`).
- `service.test.ts` — add a case asserting `updatePerson` delegates to
  `personRepository.update` with the right args, following the existing mocked-
  repo pattern (`vi.mock` the repo, assert `toHaveBeenCalledWith`).

**Goals** (`src/app/api/goals/`): same, with body
`{ id: string; name: string; targetCents: number }` (reuse the `POST` schema's
`targetCents` validation — positive int). No unique constraint on goal name, so
map only `P2025` → 404 (+ 500 fallback). Add the `updateGoal` service + test.

**Repositories** (both entities):
- `src/core/repositories/person.repository.ts` — add
  `update(id: string, patch: { name: string; color: string }): Promise<Person>`.
- `src/infra/repositories/person.prisma.repository.ts` — implement via
  `prisma.person.update({ where: { id }, data: patch })`.
- Same for `goal.repository.ts` / `goal.prisma.repository.ts` with
  `{ name: string; targetCents: number }`.

**Client:** nothing new — `apiPut` already exists in `src/lib/api.ts` (currently
only settings uses it). Tasks 05/06 will call it.

**Do NOT:** add PATCH/partial-merge semantics (the modal submits the full
object — full replace is simpler and enough); change the schema/migration; add
an `update` to settings (it already upserts).

**Verification:**
- `npm run lint`, `npm run test` (new service tests included), `npm run build`
  all green.
- Manual smoke (needs task 01 merged so the DB is migrated — run `npm run
  db:setup` in the worktree first): with the dev server up, create a person/goal,
  then `curl -X PUT` the endpoint with `{ id, name, color/targetCents }` and
  confirm the row changes; `curl` a non-existent id → 404 envelope; for people,
  PUT a name that collides with another person → 409 envelope.
