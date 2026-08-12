import { Check, FileText } from "lucide-react";
import { Button } from "@/components/Button/index.tsx";
import { FilePicker } from "@/components/FilePicker/index.tsx";
import { SectionCard } from "@/components/SectionCard/index.tsx";
import { AccountLine } from "./components/AccountLine/index.tsx";
import { ImportAction } from "./components/ImportAction/index.tsx";
import { MonthTable } from "./components/MonthTable/index.tsx";
import { type ReportViewProps, useReportView } from "./hook.ts";
import styles from "./style.module.scss";

export function ReportView(props: ReportViewProps) {
  const view = useReportView(props);

  return (
    <SectionCard title="Relatório OFX" icon={FileText}>
      <div className={styles.head}>
        <p className={styles.file}>{view.fileName}</p>
        <p className={styles.badge}>
          <Check size={12} aria-hidden /> {view.count}
        </p>
      </div>
      {/* No "Lançamentos" key here any more — the badge above carries it. */}
      <dl className={styles.facts}>
        <div>
          <dt>Instituição</dt>
          <dd>{view.org}</dd>
        </div>
        <div>
          <dt>Conta</dt>
          <dd>{view.account}</dd>
        </div>
        <div>
          <dt>Período</dt>
          <dd>{view.period}</dd>
        </div>
        <div>
          <dt>Moeda</dt>
          <dd>{view.currency}</dd>
        </div>
        <div>
          <dt>Saldo final</dt>
          <dd>{view.finalBalance}</dd>
        </div>
      </dl>
      <ul className={styles.accounts}>
        {view.accounts.map((item) => (
          <AccountLine key={item.key} account={item.account} />
        ))}
      </ul>

      <MonthTable rows={view.rows} totals={view.totals} />

      {view.error ? (
        <p className={styles.error}>
          <span aria-hidden>▲</span> {view.error}
        </p>
      ) : null}

      <div className={styles.actions}>
        {/* Disabled while a parse is in flight, like the picker beside it:
            close() cannot cancel the pending upload, whose success branch would
            otherwise setReport + write storage after the report was dropped —
            resurrecting a closed report and re-persisting its session key. */}
        <Button variant="ghost" onClick={view.onClose} disabled={view.loading}>
          Fechar
        </Button>
        <FilePicker
          label="Trocar arquivo"
          disabled={view.loading}
          onFile={view.onFile}
        />
        <ImportAction report={view.report} />
      </div>
    </SectionCard>
  );
}
