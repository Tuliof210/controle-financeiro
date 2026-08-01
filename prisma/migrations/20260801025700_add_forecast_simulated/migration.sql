/*
  Adds Forecast.simulated — the flag that tells a what-if apart from a real
  forecast. Nothing else about the row changes.

  Hand-edited down from what `migrate dev` generated. The generator reached for
  its RedefineTables dance (CREATE new_Forecast / INSERT SELECT / DROP / RENAME,
  wrapped in the PRAGMA defer_foreign_keys pair) — which is what SQLite genuinely
  needs to DROP or retype a column, and why the two migrations here that use it,
  20260724175058 and 20260728041618, both drop one. Adding a column with a
  constant default needs none of that: SQLite does it in place, and ADD COLUMN
  backfills every existing row with the default in the same statement.

  This is more than tidiness. ForecastMonth.forecastId carries a foreign key onto
  Forecast.id, so the generated version drops and recreates the very table that
  key points at, with foreign_keys=OFF across the gap. ADD COLUMN never disturbs
  it, and every forecast that already existed reads back as real.
*/
-- AlterTable
ALTER TABLE "Forecast" ADD COLUMN "simulated" BOOLEAN NOT NULL DEFAULT false;
