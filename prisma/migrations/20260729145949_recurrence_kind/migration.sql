-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Recurrence" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "valueCents" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "kind" TEXT NOT NULL DEFAULT 'fixed',
    "totalCents" INTEGER,
    "ownerId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Recurrence_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Person" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Recurrence" ("createdAt", "id", "name", "ownerId", "type", "valueCents") SELECT "createdAt", "id", "name", "ownerId", "type", "valueCents" FROM "Recurrence";
DROP TABLE "Recurrence";
ALTER TABLE "new_Recurrence" RENAME TO "Recurrence";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
