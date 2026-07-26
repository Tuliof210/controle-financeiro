import { FileText } from "lucide-react";
import { Button } from "@/components/Button";
import { SectionCard } from "@/components/SectionCard";
import { FilePicker } from "../FilePicker";
import { AccountLine } from "./components/AccountLine";
import { MonthRow } from "./components/MonthRow";
import { type ReportViewProps, useReportView } from "./hook";
import styles from "./style.module.scss";

export function ReportView(props: ReportViewProps) {
  const view = useReportView(props);

  return (
    <SectionCard title="Relatório OFX" icon={FileText}>
      <p className={styles.file}>{view.fileName}</p>
      <dl className={styles.facts}>
        <div>
          <dt>Instituição</dt>
          <dd>{view.org}</dd>
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
          <dt>Lançamentos</dt>
          <dd>{view.count}</dd>
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
            <tr>
              <th scope="row">Total</th>
              <td>{view.totals.income}</td>
              <td>{view.totals.expense}</td>
              <td
                className={view.totals.negative ? styles.negative : undefined}
              >
                {view.totals.balance}
              </td>
              <td>{view.totals.count}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {view.error ? (
        <p className={styles.error}>
          <span aria-hidden>▲</span> {view.error}
        </p>
      ) : null}

      <div className={styles.actions}>
        <Button variant="ghost" onClick={view.onClose}>
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
