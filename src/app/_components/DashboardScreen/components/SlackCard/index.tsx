import { Wallet } from "lucide-react";
import { SectionCard } from "@/components/SectionCard";
import { HINTS } from "../../hints";
import { MeterList } from "../MeterList";
import { MeterRow } from "../MeterRow";
import { ShowAllToggle } from "../ShowAllToggle";
import { type SlackCardProps, useSlackCard } from "./hook";
import styles from "./style.module.scss";

export function SlackCard(props: SlackCardProps) {
  const { empty, rows, label, hidden, toggle } = useSlackCard(props);

  return (
    <SectionCard title="Folga de gastos" icon={Wallet} hint={HINTS.slack}>
      {empty ? (
        <p className={styles.note}>
          Sem folga no período: o saldo acumulado projetado não cobre gastos
          adicionais.
        </p>
      ) : (
        <>
          {/* SectionCard takes no header action; the chip right-aligns itself
              inside the card body instead of widening it for two call sites. */}
          {hidden ? <ShowAllToggle label={label} onClick={toggle} /> : null}
          <MeterList>
            {rows.map((row) => (
              <MeterRow
                key={row.key}
                label={row.label}
                percent={row.percent}
                tone="positive"
                projected={row.projected}
                srLabel={row.srLabel}
              >
                <span>{row.total}</span>
                <span className={styles.split}>{row.weekly}/sem</span>
                <span className={styles.split}>{row.daily}/dia</span>
              </MeterRow>
            ))}
          </MeterList>
        </>
      )}
    </SectionCard>
  );
}
