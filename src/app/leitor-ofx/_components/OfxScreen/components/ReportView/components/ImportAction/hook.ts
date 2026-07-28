import { useEffect, useState } from "react";
import type { OfxReport } from "@/app/api/ofx/types";
import { useProfile } from "@/components/ProfileProvider/hook";
import { apiGet, apiPost } from "@/lib/api";
import { resolveOwnerId } from "@/lib/ownership";
import {
  buildImportRows,
  IDENTIFIER_MAX,
  importedHint,
  ownerOptions,
  prefillIdentifier,
  summaryOf,
} from "./import-rows.helper";

export type ImportActionProps = { report: OfxReport };

type ImportedState = { imported: boolean; importedAt: string | null };

const NOT_IMPORTED: ImportedState = { imported: false, importedAt: null };

export function useImportAction({ report }: ImportActionProps) {
  // people comes from the provider, which already fetched /api/people for the
  // header's profile switcher — no second request for the same list.
  const { profile, people } = useProfile();
  const [open, setOpen] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [ownerId, setOwnerId] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const [record, setRecord] = useState<ImportedState>(NOT_IMPORTED);

  // Keyed on the hash, so swapping the file re-asks rather than carrying the
  // previous file's verdict. `alive` because a fast "Trocar arquivo" can land
  // a stale answer after the new one.
  useEffect(() => {
    let alive = true;
    setRecord(NOT_IMPORTED);
    apiGet<ImportedState>(
      `/api/ofx-imports?hash=${encodeURIComponent(report.fileHash)}`,
    ).then((result) => {
      if (alive && result.data) setRecord(result.data);
    });
    return () => {
      alive = false;
    };
  }, [report.fileHash]);

  const rows = buildImportRows(report.months, identifier);
  const canSubmit = identifier.trim().length > 0 && ownerId !== "" && !busy;

  const openDialog = () => {
    setIdentifier(prefillIdentifier(report));
    setOwnerId(resolveOwnerId(profile, people));
    setError(undefined);
    setOpen(true);
  };

  const submit = async () => {
    if (!canSubmit) {
      return setError("Preencha o identificador e o responsável");
    }
    setBusy(true);
    setError(undefined);
    const result = await apiPost<{ imported: number }>("/api/ofx-imports", {
      fileHash: report.fileHash,
      fileName: report.fileName,
      ownerId,
      movements: rows,
    });
    setBusy(false);
    if (result.error || !result.data) {
      return setError(result.error ?? "Erro inesperado");
    }
    setOpen(false);
    // Local clock, and only for the tooltip's date — the row the server wrote
    // is the record, and a refetch to read its timestamp back would buy a
    // rendered date nobody compares against anything.
    setRecord({ imported: true, importedAt: new Date().toISOString() });
  };

  return {
    open,
    busy,
    error,
    identifier,
    setIdentifier,
    ownerId,
    setOwnerId,
    canSubmit,
    openDialog,
    close: () => setOpen(false),
    submit,
    maxLength: IDENTIFIER_MAX,
    imported: record.imported,
    tooltip: record.imported ? importedHint(record.importedAt) : null,
    summary: summaryOf(rows.length),
    options: ownerOptions(people),
  };
}
