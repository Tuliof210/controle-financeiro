# Rename the Recurrence tables to Forecast, losing no rows

## Outcome
- `schema.prisma` declares `Forecast` / `ForecastMonth`, and `Person` exposes
  `forecasts`.
- The rows already in the local `dev.db` — 5 forecasts, 76 month rows — are in
  the renamed tables, unchanged.
- The same migration applies cleanly to an empty database, so a fresh checkout
  and every e2e run still work.

## Context
Current models (`prisma/schema.prisma:31-50`), verbatim:

```prisma
model Recurrence {
  id         String            @id @default(cuid())
  name       String
  valueCents Int
  type       String
  owner      Person            @relation(fields: [ownerId], references: [id])
  ownerId    String
  months     RecurrenceMonth[]
  createdAt  DateTime          @default(now())
}

model RecurrenceMonth {
  id           String     @id @default(cuid())
  recurrence   Recurrence @relation(fields: [recurrenceId], references: [id], onDelete: Cascade)
  recurrenceId String
  month        Int // YYYYMM
  @@unique([recurrenceId, month])
  @@index([month])
}
```
Plus the back-relation `recurrences Recurrence[]` on `model Person`
(`prisma/schema.prisma:20`). There is no `@@map`/`@map` anywhere in the schema,
so the SQL table names literally are `Recurrence` and `RecurrenceMonth`;
renaming the model renames the table.

- **Watch out for Prisma's rename detection — this is where the data dies.**
  `prisma migrate dev` only emits a rename if its heuristic pairs the models and
  the interactive prompt is answered; two simultaneous model renames plus a
  renamed FK column (`recurrenceId` → `forecastId`) is exactly the case it
  misses, and it then emits `DROP TABLE "Recurrence"` — which cascades onto
  `RecurrenceMonth` through `onDelete: Cascade`. Generate with
  `npx prisma migrate dev --create-only` and **hand-write** the SQL as plain
  native renames before applying anything:
  `ALTER TABLE "Recurrence" RENAME TO "Forecast";`,
  `ALTER TABLE "RecurrenceMonth" RENAME TO "ForecastMonth";`,
  `ALTER TABLE "ForecastMonth" RENAME COLUMN "recurrenceId" TO "forecastId";`
  No script wraps `--create-only`; run it directly (`package.json:9-10` only has
  `db:postinstall` → `prisma generate` and `db:setup` → `... && prisma migrate
  deploy`).
- **Watch out for the index names.** `@@unique`/`@@index` produced
  `RecurrenceMonth_recurrenceId_month_key` and `RecurrenceMonth_month_idx`; a
  table rename keeps those old names attached, which the next `migrate dev`
  reports as drift. Drop and recreate them as
  `ForecastMonth_forecastId_month_key` / `ForecastMonth_month_idx` in this same
  migration — indexes hold no rows, so that part is data-safe. Finish with
  `npx prisma migrate status` showing no drift.
- **Imitate** the house style when a rebuild really is needed — see
  `prisma/migrations/20260728041618_drop_settings_range/migration.sql`, which
  wraps the swap in `PRAGMA defer_foreign_keys=ON; PRAGMA foreign_keys=OFF;` …
  `PRAGMA foreign_keys=ON; PRAGMA defer_foreign_keys=OFF;`. Prefer plain renames
  over a rebuild here; only reach for that pattern if a rename cannot express it.
- **Watch out for `package.json:11`** — `db:clean` is raw SQL naming
  `RecurrenceMonth` and `Recurrence`. It is not compiler-checked. `sqlite3`
  aborts the whole batch on the first bad statement, so a missed rename here
  silently stops cleaning every table listed after it. Update it in this task.
- **Watch out for the DB path**: the live file is `dev.db` at the repo root, not
  `prisma/dev.db` (`prisma.config.ts:10` defaults `DATABASE_URL` to
  `file:./dev.db`). It is gitignored. Copy it before running anything.
- The generated client lands in `src/generated/prisma` (gitignored) — run
  `npx prisma generate` after editing the schema.

## Scope
- In: `prisma/schema.prisma`, one new folder under `prisma/migrations/`,
  the `db:clean` script in `package.json`.
- Out: every `.ts`/`.tsx` file — TypeScript will not compile after this task
  (`prisma.recurrence` no longer exists) and that is expected; task 03 fixes it.
  Do not touch it here.

## Verify
```bash
cp dev.db /tmp/dev.db.bak
npx prisma migrate deploy
npx prisma generate
npx prisma migrate status
sqlite3 dev.db "SELECT count(*) FROM Forecast; SELECT count(*) FROM ForecastMonth;"
sqlite3 dev.db "SELECT name FROM sqlite_master WHERE type='index' AND tbl_name='ForecastMonth';"
```
Expect `5` then `76`, index names carrying `ForecastMonth`, and `migrate status`
reporting the schema in sync. Then prove a fresh database:
```bash
DATABASE_URL="file:./e2e.db" sh -c 'rm -f e2e.db && npm run db:setup'
```
must succeed with no error.

## Forbidden
- Editing or renaming any existing migration folder — `20260723031911_add_recurrences`
  and `20260724175058_recurrence_months` keep their names; history is immutable.
- `prisma db push`, `migrate reset`, or any command that drops the dev database.
- Accepting Prisma's auto-generated SQL without reading it; a `DROP TABLE` on
  `Recurrence` in the new migration is a failed task, not a detail.
- Changing any column type, default, constraint or relation beyond the names.
