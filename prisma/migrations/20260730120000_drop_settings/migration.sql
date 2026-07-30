/*
  The Settings model held exactly one field beyond its id — monthlyGoalCents,
  the "Meta mensal" the owner never maintained — and that concept is gone from
  the UI, the API and the dashboard payload. With nothing left to keep, the
  table goes rather than the column: a column drop on SQLite is a table rebuild,
  and rebuilding a table down to its primary key is a longer way of writing DROP.

  No foreign key references Settings (it declares no relation and none of the
  other models point at it), so this needs no PRAGMA dance.
*/
-- DropTable
DROP TABLE "Settings";
