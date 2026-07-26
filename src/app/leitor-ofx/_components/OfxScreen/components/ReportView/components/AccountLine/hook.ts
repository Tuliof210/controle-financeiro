import type { OfxAccount } from "@/app/api/ofx/types";
import { formatMoney } from "@/lib/money";
import { formatYyyymm } from "@/lib/months";

export type AccountLineProps = { account: OfxAccount };

// Every OfxAccount field is nullable, because exports in the wild omit tags the
// spec marks required. A missing segment is dropped rather than rendered as a
// placeholder, so the line reads as a sentence whatever the bank sent.
export function useAccountLine({ account }: AccountLineProps) {
  const balance =
    account.balanceCents === null
      ? null
      : `saldo ${formatMoney(account.balanceCents)}${
          account.balanceMonth === null
            ? ""
            : ` em ${formatYyyymm(account.balanceMonth)}`
        }`;

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
