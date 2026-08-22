import type { OfxReport } from "@/app/api/ofx/types.ts";
import type { Person } from "@/core/entities/person.entity.ts";
import { accountLabel } from "../../account.helper.ts";
import { IDENTIFIER_MAX } from "./import-rows.helper.ts";

// The dialog's own copy. Pure, and kept beside the rows it describes so
// hook.ts holds state and requests and nothing else.

export const summaryOf = (count: number): string => {
  if (count === 1) {
    return "1 movimentação será criada.";
  }
  return `${count} movimentações serão criadas.`;
};

export const importedHint = (at: string | null): string => {
  if (at === null) {
    return "Este extrato já foi importado.";
  }
  const on = new Date(at).toLocaleDateString("pt-BR");
  return `Este extrato já foi importado em ${on}.`;
};

// What the identifier field opens with. accountLabel answers "—" when no
// statement declared an <ACCTID>; that is a placeholder for a reader, not
// something to pre-fill a field with, so the institution takes over.
export const prefillIdentifier = (report: OfxReport): string => {
  const account = accountLabel(report.accounts);
  if (account === "—") {
    return (report.org ?? "").slice(0, IDENTIFIER_MAX);
  }
  return account.slice(0, IDENTIFIER_MAX);
};

// Select has no empty state of its own, so an account with nobody
// registered would otherwise render a select with no options at all.
export const ownerOptions = (people: Person[]) => {
  if (people.length === 0) {
    return [{ value: "", label: "Nenhuma pessoa cadastrada" }];
  }
  return people.map((person) => ({ value: person.id, label: person.name }));
};

// The hint only exists once the file is known to be a repeat.
export const tooltipFor = (record: {
  imported: boolean;
  importedAt: string | null;
}): string | null => {
  if (!record.imported) {
    return null;
  }
  return importedHint(record.importedAt);
};

// The button reports the request in flight rather than inviting a second one.
export const submitLabelFor = (busy: boolean): string => {
  if (busy) {
    return "Importando…";
  }
  return "Importar";
};
