/*
  Adds Forecast.kind — fixed vs a future commitment. Classification for the
  reader; it does not change the projection. Existing rows backfill as fixed.

  ADD COLUMN with a constant default, same as 20260801025700: SQLite does it
  in place. RedefineTables would drop and recreate Forecast while
  ForecastMonth.forecastId still points at it.
*/
-- AlterTable
ALTER TABLE "Forecast" ADD COLUMN "kind" TEXT NOT NULL DEFAULT 'fixed';
