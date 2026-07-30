import { Wallet } from "lucide-react";
import { SectionCard } from "@/components/SectionCard";
import { HINTS } from "../../hints";
import { Headline } from "../Headline";
import { MeterList } from "../MeterList";
import { MeterRow } from "../MeterRow";
import { ShowAllToggle } from "../ShowAllToggle";
import { type CeilingCardProps, useCeilingCard } from "./hook";
import styles from "./style.module.scss";

export function CeilingCard(props: CeilingCardProps) {
  const {
    empty,
    note,
    monthly,
    splits,
    horizon,
    rows,
    label,
    hidden,
    all,
    toggle,
  } = useCeilingCard(props);

  return (
    <SectionCard title="Teto de Gastos" icon={Wallet} hint={HINTS.ceiling}>
      {empty ? (
        <p className={styles.note}>{note}</p>
      ) : (
        <>
          <Headline caption="Gasto extra este mês">
            {monthly}
            <span className={styles.splits}>{splits}</span>
          </Headline>
          {horizon ? <p className={styles.note}>{horizon}</p> : null}
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
                <span className={styles.budget}>{row.budget}</span>
                <span className={styles.of}>restam {row.remaining}</span>
                <span className={styles.of}>de {row.of}</span>
              </MeterRow>
            ))}
          </MeterList>
          {hidden ? (
            <ShowAllToggle label={label} expanded={all} onClick={toggle} />
          ) : null}
        </>
      )}
    </SectionCard>
  );
}
