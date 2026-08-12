import type { OfxAccount } from "@/app/api/ofx/types.ts";
import { formatMoney } from "@/lib/money.ts";
import { formatYyyymm } from "@/lib/months.ts";

// "saldo X em Mês/AA", with the month dropped when the file did not date it,
// and the whole segment dropped when there is no balance at all.
const balanceText = (
  cents: number | null,
  month: number | null,
): string | null => {
  if (cents === null) {
    return null;
  }
  if (month === null) {
    return `saldo ${formatMoney(cents)}`;
  }
  return `saldo ${formatMoney(cents)} em ${formatYyyymm(month)}`;
};

export interface AccountLineProps {
  account: OfxAccount;
}

// Every OfxAccount field is nullable, because exports in the wild omit tags the
// spec marks required. A missing segment is dropped rather than rendered as a
// placeholder, so the line reads as a sentence whatever the bank sent.
export function useAccountLine({ account }: AccountLineProps) {
  const balance = balanceText(account.balanceCents, account.balanceMonth);

  const text = [
    account.bankId && `banco ${account.bankId}`,
    account.accountId && `conta ${account.accountId}`,
    account.accountType,
    balance,
  ]
    .filter(Boolean)
    .join(" · ");

  return { text: text || "Conta sem identificação" };
}
