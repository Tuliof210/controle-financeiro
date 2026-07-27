import type { OfxAccount } from "@/app/api/ofx/types";
import { formatMoney } from "@/lib/money";

// The two metadata values derived from the account list. Pulled out of hook.ts
// so their cases fit their own test file — hook.test.ts already sat at the
// 100-line cap.

// " +N" so a multi-account file does not read as a single-account one; the
// account lines under the metadata row still spell every one of them out.
export const accountLabel = (accounts: OfxAccount[]): string => {
  const first = accounts.at(0)?.accountId;
  const others = accounts.length - 1;
  return first ? `${first}${others > 0 ? ` +${others}` : ""}` : "—";
};

// Every OfxAccount field is nullable, so this walks to the LAST account that
// declared a balance rather than assuming the last account has one. `?? acc`
// rather than a truthiness test: a zero balance is a real, declared balance.
export const finalBalance = (accounts: OfxAccount[]): string => {
  const cents = accounts.reduce<number | null>(
    (last, account) => account.balanceCents ?? last,
    null,
  );
  return cents === null ? "—" : formatMoney(cents);
};
