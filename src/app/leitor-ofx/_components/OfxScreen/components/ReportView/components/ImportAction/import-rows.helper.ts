import type { OfxMonth } from "@/app/api/ofx/types.ts";
import { type EntryType, TYPE_LABELS } from "@/lib/entry-types.ts";
import { formatYyyymm } from "@/lib/months.ts";
import type { MovementRow } from "@/lib/movement-schema.ts";

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

    const rows: MovementRow[] = [];
    if (incomeCents > 0) {
      rows.push(row("income", incomeCents));
    }
    if (expenseCents > 0) {
      rows.push(row("expense", expenseCents));
    }
    return rows;
  });
}
