import { Check, FileText } from "lucide-react";
import { Button } from "@/components/Button";
import { SectionCard } from "@/components/SectionCard";
import { FilePicker } from "../FilePicker";
import { AccountLine } from "./components/AccountLine";
import { MonthRow } from "./components/MonthRow";
import { TotalsRow } from "./components/TotalsRow";
import { type ReportViewProps, useReportView } from "./hook";
import styles from "./style.module.scss";

export function ReportView(props: ReportViewProps) {
  const view = useReportView(props);

  return (
    <SectionCard title="Relatório OFX" icon={FileText}>
      <div className={styles.head}>
        <p className={styles.file}>{view.fileName}</p>
        <p className={styles.badge}>
          <Check size={12} aria-hidden /> {view.count} lançamentos lidos
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

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <caption className={styles.caption}>
            Entradas e saídas por mês
          </caption>
          <thead>
            <tr>
              <th scope="col">Mês</th>
              <th scope="col">Entradas</th>
              <th scope="col">Saídas</th>
              <th scope="col">Saldo</th>
              <th scope="col">Lanç.</th>
            </tr>
          </thead>
          <tbody>
            {view.rows.map((row) => (
              <MonthRow key={row.month} month={row} />
            ))}
          </tbody>
          <tfoot>
            <TotalsRow {...view.totals} />
          </tfoot>
        </table>
      </div>

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
      </div>
    </SectionCard>
  );
}
