import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";

export type ImportedState = { imported: boolean; importedAt: string | null };

const NOT_IMPORTED: ImportedState = { imported: false, importedAt: null };

// Does the server already have this file on record? Its own hook because it is
// the one piece of ImportAction's state that nothing on the screen sets — it
// answers from the database, which is why the disabled button survives a
// reload with an empty sessionStorage.
export function useImportedRecord(fileHash: string) {
  const [record, setRecord] = useState<ImportedState>(NOT_IMPORTED);

  // Keyed on the hash, so swapping the file re-asks rather than carrying the
  // previous file's verdict. `alive` because a fast "Trocar arquivo" can land
  // a stale answer after the new one.
  useEffect(() => {
    let alive = true;
    setRecord(NOT_IMPORTED);
    apiGet<ImportedState>(
      `/api/ofx-imports?hash=${encodeURIComponent(fileHash)}`,
    ).then((result) => {
      if (alive && result.data) setRecord(result.data);
    });
    return () => {
      alive = false;
    };
  }, [fileHash]);

  return [record, setRecord] as const;
}
