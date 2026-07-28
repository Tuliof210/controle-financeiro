/*
  Warnings:

  - You are about to drop the column `rangeEnd` on the `Settings` table. All the data in the column will be lost.
  - You are about to drop the column `rangeStart` on the `Settings` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Settings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "monthlyGoalCents" INTEGER
);
INSERT INTO "new_Settings" ("id", "monthlyGoalCents") SELECT "id", "monthlyGoalCents" FROM "Settings";
DROP TABLE "Settings";
ALTER TABLE "new_Settings" RENAME TO "Settings";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
