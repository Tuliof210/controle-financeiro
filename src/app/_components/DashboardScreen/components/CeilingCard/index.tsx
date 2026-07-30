import { Wallet } from "lucide-react";
import { SectionCard } from "@/components/SectionCard";
import { HINTS } from "../../hints";
import { Headline } from "../Headline";
import { ShowAllToggle } from "../ShowAllToggle";
import { MonthTable } from "./components/MonthTable";
import { type CeilingCardProps, useCeilingCard } from "./hook";
import styles from "./style.module.scss";

export function CeilingCard(props: CeilingCardProps) {
  const {
    empty,
    note,
    limitedBy,
    currentLabel,
    count,
    rows,
    label,
    hidden,
    all,
    toggle,
    monthly,
    splits,
    monthsLeft,
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
          {/* The headline stays the card's first child: the ceiling spec reads
              it as the card's first <dd>. */}
          <Headline caption="Gasto extra este mês">
            {monthly}
            <span className={styles.chip}>{monthsLeft}</span>
            <span className={styles.splits}>{splits}</span>
          </Headline>
          <MonthTable rows={rows} />
          <div className={styles.footer}>
            <span>{count}</span>
            {hidden ? (
              <ShowAllToggle label={label} expanded={all} onClick={toggle} />
            ) : null}
          </div>
        </>
      )}
    </SectionCard>
  );
}
