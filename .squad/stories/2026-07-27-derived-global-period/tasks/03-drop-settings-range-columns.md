# Drop the unread Settings range columns

## Outcome
- `Settings` no longer has `rangeStart`/`rangeEnd`, in the schema or in the
  database file.
- Every value already saved in `monthlyGoalCents` survives the migration and
  still reads back through `GET /api/settings`.
- `npm run db:setup` on a fresh checkout produces that same schema.

## Independently shippable
yes

## Scope
- In: `prisma/schema.prisma` and one new folder under `prisma/migrations/`.
- Out: everything else. 01 already removed the last reader and the last writer
  of both columns, so no TypeScript should need to change here — if some does,
  01 is incomplete and it gets fixed there, not patched around here.
- Imitate: the existing folders in `prisma/migrations/` for the naming and the
  file layout.
- Reuse: nothing.

## When to run
- Depends on: 01
- Parallel-safe with: 02

## Verify
- `npx prisma migrate dev --create-only --name drop_settings_range`, then hand
  write the SQL: SQLite drops a column by rebuilding the table, so carry `id`
  and `monthlyGoalCents` across before the swap. Then `npx prisma migrate
  deploy` and `npx prisma generate`.
- Copy the SQLite file aside before applying. After applying, read the saved
  `monthlyGoalCents` back through the running app, not only through the DB.
- `npm run lint`, `npm run test`, `npm run build`

## Forbidden
- No data loss. `prisma migrate reset` is not the solution to this.
- Do not reintroduce a period field, column or setting anywhere.
