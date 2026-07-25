import { Wallet } from "lucide-react";
import { SectionCard } from "@/components/SectionCard";
import { HINTS } from "../../hints";
import { MeterRow } from "../MeterRow";
import { type SlackCardProps, useSlackCard } from "./hook";
import styles from "./style.module.scss";

export function SlackCard(props: SlackCardProps) {
  const { empty, rows } = useSlackCard(props);

  return (
    <SectionCard title="Folga de gastos" icon={Wallet} hint={HINTS.slack}>
      {empty ? (
        <p className={styles.empty}>
          Sem folga no período: o saldo acumulado projetado não cobre gastos
          adicionais.
        </p>
      ) : (
        <ul className={styles.list}>
          {rows.map((row) => (
            <MeterRow
              key={row.key}
              label={row.label}
              percent={row.percent}
              tone="positive"
              srLabel={row.srLabel}
            >
              <span>{row.total}</span>
              <span className={styles.split}>{row.weekly}/sem</span>
              <span className={styles.split}>{row.daily}/dia</span>
            </MeterRow>
          ))}
        </ul>
      )}
    </SectionCard>
  );
}
