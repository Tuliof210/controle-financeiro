import { Wallet } from "lucide-react";
import { SectionCard } from "@/components/SectionCard";
import { HINTS } from "../../hints";
import { ShowAllToggle } from "../ShowAllToggle";
import { Hero } from "./components/Hero";
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
    hero,
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
          {/* Hero stays the card's first child: the ceiling spec reads the two
              headlines as the card's first and second <dd>. */}
          <Hero {...hero} />
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
