import { Wallet } from "lucide-react";
import { SectionCard } from "@/components/SectionCard";
import { HINTS } from "../../hints";
import { MeterList } from "../MeterList";
import { MeterRow } from "../MeterRow";
import { ShowAllToggle } from "../ShowAllToggle";
import { Hero } from "./components/Hero";
import { type CeilingCardProps, useCeilingCard } from "./hook";
import styles from "./style.module.scss";

export function CeilingCard(props: CeilingCardProps) {
  const {
    empty,
    note,
    limitedBy,
    currentLabel,
    markLabel,
    count,
    scaleNote,
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
          <Hero {...hero} />
          <div className={styles.legend}>
            <span className={styles.legendTitle}>Próximos meses</span>
            <span className={styles.key}>
              <span className={styles.solid} aria-hidden />
              Mês atual
            </span>
            <span className={styles.key}>
              <span className={styles.hatched} aria-hidden />
              Projeção
            </span>
            <span className={styles.key}>
              <span className={styles.dashed} aria-hidden />
              Média
            </span>
          </div>
          <MeterList>
            {rows.map((row) => (
              <MeterRow
                key={row.key}
                label={row.label}
                percent={row.percent}
                tone="positive"
                projected={row.projected}
                current={row.isCurrent}
                mark={row.mark}
                markLabel={markLabel}
                srLabel={row.srLabel}
              >
                <span className={styles.budget}>{row.budget}</span>
                <span className={styles.of}>restam {row.remaining}</span>
                <span className={styles.of}>teto {row.of}</span>
              </MeterRow>
            ))}
          </MeterList>
          <div className={styles.footer}>
            <span>{count}</span>
            <span className={styles.sep} aria-hidden />
            <span>{scaleNote}</span>
            {hidden ? (
              <ShowAllToggle label={label} expanded={all} onClick={toggle} />
            ) : null}
          </div>
        </>
      )}
    </SectionCard>
  );
}
