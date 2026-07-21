# Health-check API endpoint

## Description
Add a minimal `GET /api/health` endpoint proving the API side of the app
boots, following .squad/ARCHITECTURE.md's thin-route/logic-in-service split
and the project's consistent `{ data }` / `{ error }` API envelope. No
database check yet — task 03 configures Prisma in this same story, but with
zero models there's nothing meaningful to query yet, so this stays a static
ping. Revisit adding a DB-connectivity check once a first model exists.

## When to run
- Depends on: 01 (needs the scaffolded Next.js app, the `@/` alias, and
  Vitest wired up)
- Parallel-safe with: 03 (touches different files; no overlap)

## How-to

1. Create `src/app/api/health/route.ts`:
   ```ts
   import { NextResponse } from 'next/server'
   import { getHealth } from './service'

   export function GET() {
     return NextResponse.json({ data: getHealth() })
   }
   ```
2. Create `src/app/api/health/service.ts`:
   ```ts
   export function getHealth() {
     return { status: 'ok' as const }
   }
   ```
   Framework-agnostic on purpose — no `next/server` import here, per
   .squad/ARCHITECTURE.md's route/service split.
3. Create `src/app/api/health/service.test.ts`:
   ```ts
   import { describe, expect, it } from 'vitest'
   import { getHealth } from './service'

   describe('getHealth', () => {
     it('reports ok', () => {
       expect(getHealth()).toEqual({ status: 'ok' })
     })
   })
   ```

## Verification
- `npm run test` — the new test passes.
- `npm run lint` — all-green.
- `npm run dev`, then `curl http://localhost:3000/api/health` →
  `{"data":{"status":"ok"}}`.
