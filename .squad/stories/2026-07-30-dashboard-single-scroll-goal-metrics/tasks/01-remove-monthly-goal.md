# Remove "Meta mensal" completely

## Outcome
- /configuracoes shows two sections, Pessoas and Objetivos. No "Meta mensal".
- The dashboard no longer renders "Uso da meta mensal" anywhere.
- `GET /api/settings` 404s (the route is gone) and the `Settings` table no
  longer exists in a freshly migrated database.

## Context
The owner's decision: delete the concept end to end, including the table. The
whole `Settings` model is one nullable column plus its id, so nothing survives
it — drop the table, not the column.

- **Delete these whole folders/files** (each verified to have exactly one
  importer, named): `src/app/_components/DashboardScreen/components/LimitCard/`
  (imported only by `ProjectionTab/index.tsx:2,12`),
  `src/app/api/dashboard/limit.helper.ts` (only by `payload.helper.ts:6`),
  `src/app/api/settings/` (`route.ts` + `service.ts`, whose only client is
  `MonthlyGoalSection/hook.ts:16,30`), `src/core/entities/settings.entity.ts`,
  `src/core/repositories/settings.repository.ts`,
  `src/infra/repositories/settings.prisma.repository.ts`, and
  `src/app/configuracoes/_components/SettingsScreen/components/MonthlyGoalSection/`.
- **Also remove**: `LimitMonth` and the `limit:` field from
  `src/app/api/dashboard/types.ts`; `goalCents` from `PayloadInput` and the
  `buildLimit` call in `payload.helper.ts`; `settingsRepository` from the
  `Promise.all` and `goalCents: settings.monthlyGoalCents` in
  `src/app/api/dashboard/service.ts`; `HINTS.limit` in
  `src/app/_components/DashboardScreen/hints.ts`; and `limitTone` in
  `src/app/_components/DashboardScreen/list-cards.helper.ts` — its only caller
  is `LimitCard/hook.ts:27`. **Keep `sharePercent` in that same file**:
  CeilingCard still calls it.
- **Watch out for** `package.json`'s `db:clean`, which is one `sqlite3`
  invocation ending in `DELETE FROM Settings;` — leave it and the whole script
  fails with `no such table`.
- **Watch out for** `SettingsScreen/hook.ts`, whose subtitle is
  `"Pessoas, meta e objetivos da família."` — the "meta" is this section.
- **Watch out for** `SettingsScreen/style.module.scss`'s `.grid`: the
  `align-items: start` comment justifies itself with *"a short card (Meta
  mensal) grows a block of dead space"*. Keep the rule (Pessoas and Objetivos
  still differ in height), rewrite the comment.
- **Migration** — hand-written, house style confirmed in
  `prisma/migrations/20260729184556_rename_recurrence_to_forecast/migration.sql`:
  a leading `/* ... */` block saying why, then Prisma's own `-- Marker`
  vocabulary. No foreign key points at `Settings`, so no table rebuild is
  needed — a `DROP TABLE "Settings";` under `-- DropTable` is the whole file.
  `npm run db:setup` runs `prisma generate && prisma migrate deploy`; `deploy`
  never authors a migration, so the folder must be created by hand and
  committed (`prisma migrate dev --create-only` may author it, but read and
  rewrite the SQL before applying).
- **Regenerate the client before building**: the stale `src/generated/prisma`
  still exports `prisma.settings` and would hide every type error.

## Scope
- In: the paths named above, `prisma/schema.prisma`, a new folder under
  `prisma/migrations/`, `package.json`'s `db:clean`.
- Out: `ProjectionTab` itself (task 02 deletes it — here, only stop it
  rendering LimitCard), `GoalsTab`, `CeilingCard`, `sustainable.helper.ts`,
  and anything about the saving pace.

## Verify
```
npx prisma generate
npm run lint
npm run build
rm -f /tmp/ps-drop.db && DATABASE_URL="file:/tmp/ps-drop.db" npx prisma migrate deploy \
  && sqlite3 /tmp/ps-drop.db ".tables"   # Settings must NOT appear
npm run db:clean                          # must exit 0
```
`npm run build` is the load-bearing check: no e2e spec touches settings
(`grep -rn "settings\|Settings" e2e/*.ts` returns nothing), so TypeScript is
the only automated proof that no dangling reference survives.

## Forbidden
- Do not delete `list-cards.helper.ts`, `show-all.hook.ts`, `MeterList`,
  `MeterRow` or `ShowAllToggle` — CeilingCard still uses every one of them.
- Do not leave `Settings` as an empty model or an unused `/api/settings` route
  "in case". The owner asked for the concept to be gone.
- Do not touch `dev.db` — migrate a throwaway file, as the command above does.
