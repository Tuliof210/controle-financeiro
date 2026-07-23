-- CreateTable
CREATE TABLE "Recurrence" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "valueCents" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "rangeStart" INTEGER NOT NULL,
    "rangeEnd" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Recurrence_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Person" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
