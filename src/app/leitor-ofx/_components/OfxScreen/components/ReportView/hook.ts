import type { OfxReport } from "@/app/api/ofx/types.ts";
import { formatMoney } from "@/lib/money.ts";
import { formatYyyymm } from "@/lib/months.ts";
import { accountLabel, finalBalance } from "./account.helper.ts";

export interface ReportViewProps {
  report: OfxReport;
  error: string | null;
  loading: boolean;
  onClose: () => void;
  onFile: (file: File) => void;
}

// Pure: FilePicker owns the only ref on this screen, so nothing here calls a
// React hook and the whole view model is directly testable.
export function useReportView({
  report,
  error,
  loading,
  onClose,
  onFile,
}: ReportViewProps) {
  const first = report.months.at(0);
  const last = report.months.at(-1);
  const count = report.totals.count;

  return {
    error,
    loading,
    onClose,
    onFile,
    // Passed through whole: ImportAction needs the hash, the file name and
    // every month, and threading three props would say less than one.
    report,
    fileName: report.fileName,
    // <FID> is a suffix on the institution's name, never a value on its own —
    // a bare "001" under the label "Instituição" names nothing a reader can
    // use, so a file with an id but no <ORG> falls back like any other.
    org: report.org
      ? [report.org, report.fid].filter(Boolean).join(" · ")
      : "—",
    currency: report.currency ?? "—",
    // The whole badge phrase, not just the number: a one-transaction file is a
    // legitimate report and "1 lançamentos lidos" is wrong. index.tsx stays
    // logic-free, so the agreement has to be decided here.
    count: `${count} ${count === 1 ? "lançamento lido" : "lançamentos lidos"}`,
    account: accountLabel(report.accounts),
    finalBalance: finalBalance(report.accounts),
    period:
      first && last
        ? `${formatYyyymm(first.month)} – ${formatYyyymm(last.month)}`
        : "—",
    accounts: report.accounts.map((account, index) => ({
      // No field is guaranteed unique or even present, so the index is part of
      // the key — a file may legitimately hold the same account twice.
      key: `${account.bankId}-${account.accountId}-${index}`,
      account,
    })),
    rows: report.months,
    totals: {
      income: formatMoney(report.totals.incomeCents),
      expense: formatMoney(report.totals.expenseCents),
      balance: formatMoney(report.totals.balanceCents),
      count,
      negative: report.totals.balanceCents < 0,
    },
  };
}
