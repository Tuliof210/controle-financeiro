import type { OfxMonth, OfxReport } from "@/app/api/ofx/types";
import type { Person } from "@/core/entities/person.entity";
import { type EntryType, TYPE_LABELS } from "@/lib/entry-types";
import { formatYyyymm } from "@/lib/months";
import type { MovementRow } from "@/lib/movement-schema";
import { accountLabel } from "../../account.helper";

// The identifier field's cap, and the reason nothing here truncates a NAME:
// the longest one this can build is "Entrada " + 40 + " " + "Ago/26" = 55
// chars, comfortably under the 80 the movements schema accepts. Enforced in
// two places, because the field's `maxLength` only caps what is typed —
// prefillIdentifier below sets a value programmatically, out of a file whose
// <ACCTID> and <ORG> have no length limit of their own.
export const IDENTIFIER_MAX = 40;

// One row per non-zero monthly total, named "Entrada 12345-6 Ago/26". A month
// the statement covers but never posted to contributes nothing: the report is
// zero-filled by design and the endpoint's valueCents minimum is 1, so a zero
// row would refuse the whole batch rather than be skipped.
export function buildImportRows(
  months: OfxMonth[],
  identifier: string,
): MovementRow[] {
  const label = identifier.trim();

  return months.flatMap(({ month, incomeCents, expenseCents }) => {
    const period = formatYyyymm(month);
    const row = (type: EntryType, valueCents: number): MovementRow => ({
      name: `${TYPE_LABELS[type]} ${label} ${period}`,
      valueCents,
      type,
      month,
    });

    return [
      ...(incomeCents > 0 ? [row("income", incomeCents)] : []),
      ...(expenseCents > 0 ? [row("expense", expenseCents)] : []),
    ];
  });
}

// The dialog's own copy. Pure, and kept beside the rows it describes so
// hook.ts holds state and requests and nothing else.

export const summaryOf = (count: number): string =>
  count === 1
    ? "1 movimentação será criada."
    : `${count} movimentações serão criadas.`;

export const importedHint = (at: string | null): string =>
  at
    ? `Este extrato já foi importado em ${new Date(at).toLocaleDateString("pt-BR")}.`
    : "Este extrato já foi importado.";

// What the identifier field opens with. accountLabel answers "—" when no
// statement declared an <ACCTID>; that is a placeholder for a reader, not
// something to pre-fill a field with, so the institution takes over.
export const prefillIdentifier = (report: OfxReport): string => {
  const account = accountLabel(report.accounts);
  const seed = account === "—" ? (report.org ?? "") : account;
  return seed.slice(0, IDENTIFIER_MAX);
};

// SelectField has no empty state of its own, so an account with nobody
// registered would otherwise render a select with no options at all.
export const ownerOptions = (people: Person[]) =>
  people.length
    ? people.map((person) => ({ value: person.id, label: person.name }))
    : [{ value: "", label: "Nenhuma pessoa cadastrada" }];
