/*
  Settings comes back, narrower than it left. 20260730120000_drop_settings took
  the whole table because its last field — monthlyGoalCents — had no reader; the
  Teto de Gastos now has a "Meta" target that reads it, so the field returns and
  the table with it.

  Not rangeStart/rangeEnd: the projection period is derived from the forecasts
  and movements, and 20260728041618_drop_settings_range already settled that.

  One row, id 1, written by upsert. NOT NULL with no default is deliberate — an
  absent goal is an absent ROW, not a null column, so "is the Meta target
  available?" is one findUnique and never a null check on a present row.
*/
-- CreateTable
CREATE TABLE "Settings" (
    "id" INTEGER NOT NULL PRIMARY KEY DEFAULT 1,
    "monthlyGoalCents" INTEGER NOT NULL
);
