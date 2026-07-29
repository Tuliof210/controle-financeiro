import { useState } from "react";
import type { OfxReport } from "@/app/api/ofx/types";
import { useProfile } from "@/components/ProfileProvider/hook";
import { apiPost } from "@/lib/api";
import { resolveOwnerId } from "@/lib/ownership";
import {
  buildImportRows,
  IDENTIFIER_MAX,
  importedHint,
  ownerOptions,
  prefillIdentifier,
  summaryOf,
} from "./import-rows.helper";
import { useImportedRecord } from "./imported.hook";

export type ImportActionProps = { report: OfxReport };

export function useImportAction({ report }: ImportActionProps) {
  // people comes from the provider, which already fetched /api/people for the
  // header's profile switcher — no second request for the same list.
  const { profile, people } = useProfile();
  const [open, setOpen] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [ownerId, setOwnerId] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const [record, setRecord] = useImportedRecord(report.fileHash);

  const rows = buildImportRows(report.months, identifier);
  // rows.length too: readOfx calls a file empty on a zero TRANSACTION count,
  // and a 0.00 transaction is counted while adding nothing to either total —
  // so a real report can yield no rows, and confirming would post an empty
  // array the endpoint's .min(1) refuses.
  const canSubmit =
    rows.length > 0 && identifier.trim().length > 0 && ownerId !== "" && !busy;

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
      // Same code the server's own already-imported lookup and its P2002 race
      // both emit — either way the file IS imported now (by this submit or by
      // whoever won the race), so this reaches the same end state as success:
      // dialog closed, outer button disabled, tooltip explaining why. No date
      // to show for the dateless branch, so the tooltip falls back to its
      // generic wording.
      if (result.code === "already_imported") {
        setOpen(false);
        setRecord({ imported: true, importedAt: null });
        return;
      }
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
