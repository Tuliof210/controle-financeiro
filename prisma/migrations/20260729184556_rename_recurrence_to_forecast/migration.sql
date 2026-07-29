/*
  Data-preserving rename: Recurrence -> Forecast, RecurrenceMonth -> ForecastMonth.
  Plain ALTER TABLE renames instead of Prisma's default drop+create, so existing
  rows survive. SQLite carries the FK on ForecastMonth to the renamed table
  automatically; only the old index names need to be recreated to match the new
  table/column names.
*/
-- RenameTable
ALTER TABLE "Recurrence" RENAME TO "Forecast";
ALTER TABLE "RecurrenceMonth" RENAME TO "ForecastMonth";

-- RenameColumn
ALTER TABLE "ForecastMonth" RENAME COLUMN "recurrenceId" TO "forecastId";

-- RenameForeignKey
DROP INDEX "RecurrenceMonth_recurrenceId_month_key";
DROP INDEX "RecurrenceMonth_month_idx";

-- CreateIndex
CREATE UNIQUE INDEX "ForecastMonth_forecastId_month_key" ON "ForecastMonth"("forecastId", "month");
CREATE INDEX "ForecastMonth_month_idx" ON "ForecastMonth"("month");
