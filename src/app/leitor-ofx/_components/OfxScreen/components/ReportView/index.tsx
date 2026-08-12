import { Check, FileText } from "lucide-react";
import { Button } from "@/components/Button/index.tsx";
import { FilePicker } from "@/components/FilePicker/index.tsx";
import { SectionCard } from "@/components/SectionCard/index.tsx";
import { ERROR_GLYPH } from "@/lib/glyphs.ts";
import { AccountLine } from "./components/AccountLine/index.tsx";
import { ImportAction } from "./components/ImportAction/index.tsx";
import { MonthTable } from "./components/MonthTable/index.tsx";
import { type ReportViewProps, useReportView } from "./hook.ts";
import styles from "./style.module.scss";

const COPY = {
  instituicao: "Instituição",
  conta: "Conta",
  periodo: "Período",
  moeda: "Moeda",
  saldoFinal: "Saldo final",
  fechar: "Fechar",
} as const;

export function ReportView(props: ReportViewProps) {
  const view = useReportView(props);

  return (
    <SectionCard title="Relatório OFX" icon={FileText}>
      <div className={styles.head}>
        <p className={styles.file}>{view.fileName}</p>
        <p className={styles.badge}>
          <Check size={12} aria-hidden={true} /> {view.count}
        </p>
      </div>
      {/* No "Lançamentos" key here any more — the badge above carries it. */}
      <dl className={styles.facts}>
        <div>
          <dt>{COPY.instituicao}</dt>
          <dd>{view.org}</dd>
        </div>
        <div>
          <dt>{COPY.conta}</dt>
          <dd>{view.account}</dd>
        </div>
        <div>
          <dt>{COPY.periodo}</dt>
          <dd>{view.period}</dd>
        </div>
        <div>
          <dt>{COPY.moeda}</dt>
          <dd>{view.currency}</dd>
        </div>
        <div>
          <dt>{COPY.saldoFinal}</dt>
          <dd>{view.finalBalance}</dd>
        </div>
      </dl>
      <ul className={styles.accounts}>
        {view.accounts.map((item) => (
          <AccountLine key={item.key} account={item.account} />
        ))}
      </ul>

      <MonthTable rows={view.rows} totals={view.totals} />

      {Boolean(view.error) && (
        <p className={styles.error}>
          <span aria-hidden={true}>{ERROR_GLYPH}</span> {view.error}
        </p>
      )}

      <div className={styles.actions}>
        {/* Disabled while a parse is in flight, like the picker beside it:
            close() cannot cancel the pending upload, whose success branch would
            otherwise setReport + write storage after the report was dropped —
            resurrecting a closed report and re-persisting its session key. */}
        <Button variant="ghost" onClick={view.onClose} disabled={view.loading}>
          {COPY.fechar}
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
