import type { OfxReport } from "@/app/api/ofx/types";
import { formatMoney } from "@/lib/money";
import { formatYyyymm } from "@/lib/months";

export type ReportViewProps = {
  report: OfxReport;
  error: string | null;
  loading: boolean;
  onClose: () => void;
  onFile: (file: File) => void;
};

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

  return {
    error,
    loading,
    onClose,
    onFile,
    fileName: report.fileName,
    org: [report.org, report.fid].filter(Boolean).join(" · ") || "—",
    currency: report.currency ?? "—",
    count: String(report.totals.count),
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
      count: report.totals.count,
      negative: report.totals.balanceCents < 0,
    },
  };
}
