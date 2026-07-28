export type OfxImport = {
  id: string;
  fileHash: string; // hex SHA-256 of the uploaded file's bytes
  fileName: string;
  importedAt: Date;
};
