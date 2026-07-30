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
    ratio,
    average,
    averageSplits,
    monthsLeft,
    limitedBy,
    currentLabel,
    rows,
    label,
    hidden,
    all,
    toggle,
  } = useCeilingCard(props);

  return (
    <SectionCard
      title="Teto de Gastos"
      icon={Wallet}
      hint={HINTS.ceiling}
      headerEnd={
        <>
          {limitedBy ? (
            <span className={styles.limit} title={`${limitedBy}.`}>
              {limitedBy}
            </span>
          ) : null}
          <span className={styles.now} title="Mês em curso">
            {currentLabel}
          </span>
        </>
      }
    >
      {empty ? (
        <p className={styles.note}>{note}</p>
      ) : (
        <>
          {/* Two readings of the same quantity, side by side, so this month can
              be judged against the period instead of on its own. */}
          <div className={styles.hero}>
            <Headline caption="Gasto extra este mês">
              {monthly}
              <span className={styles.chip}>{ratio}</span>
              <span className={styles.splits}>{splits}</span>
            </Headline>
            <Headline caption="Média dos tetos">
              {average}
              <span className={styles.chip}>{monthsLeft}</span>
              <span className={styles.splits}>{averageSplits}</span>
            </Headline>
          </div>
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
