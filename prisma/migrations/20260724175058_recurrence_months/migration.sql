/*
  Warnings:

  - You are about to drop the column `rangeEnd` on the `Recurrence` table. All the data in the column will be lost.
  - You are about to drop the column `rangeStart` on the `Recurrence` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "RecurrenceMonth" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "recurrenceId" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    CONSTRAINT "RecurrenceMonth_recurrenceId_fkey" FOREIGN KEY ("recurrenceId") REFERENCES "Recurrence" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Backfill: expand each existing recurrence's [rangeStart, rangeEnd] contiguous
-- range into one RecurrenceMonth row per month. MUST run before the rebuild
-- below drops rangeStart/rangeEnd. YYYYMM is monotonic as an integer, so the
-- recursive CTE steps month-by-month, rolling the year over at month 12.
INSERT INTO "RecurrenceMonth" ("id", "recurrenceId", "month")
WITH RECURSIVE expand(recId, m, endM) AS (
    SELECT "id", "rangeStart", "rangeEnd" FROM "Recurrence"
    UNION ALL
    SELECT recId,
           CASE WHEN m % 100 = 12 THEN (m / 100 + 1) * 100 + 1 ELSE m + 1 END,
           endM
    FROM expand WHERE m < endM
)
SELECT lower(hex(randomblob(16))), recId, m FROM expand;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Recurrence" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "valueCents" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Recurrence_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Person" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Recurrence" ("createdAt", "id", "name", "ownerId", "type", "valueCents") SELECT "createdAt", "id", "name", "ownerId", "type", "valueCents" FROM "Recurrence";
DROP TABLE "Recurrence";
ALTER TABLE "new_Recurrence" RENAME TO "Recurrence";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "RecurrenceMonth_month_idx" ON "RecurrenceMonth"("month");

-- CreateIndex
CREATE UNIQUE INDEX "RecurrenceMonth_recurrenceId_month_key" ON "RecurrenceMonth"("recurrenceId", "month");
