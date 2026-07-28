-- CreateTable
CREATE TABLE "OfxImport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fileHash" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "importedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "OfxImport_fileHash_key" ON "OfxImport"("fileHash");
