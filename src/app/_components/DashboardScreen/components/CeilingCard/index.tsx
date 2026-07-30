import { Wallet } from "lucide-react";
import { SectionCard } from "@/components/SectionCard";
import { HINTS } from "../../hints";
import { Headline } from "../Headline";
import { ShowAllToggle } from "../ShowAllToggle";
import { CapSelector } from "./components/CapSelector";
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
    cap,
    onCapChange,
  } = useCeilingCard(props);

  return (
    <SectionCard
      title="Teto de Gastos"
      icon={Wallet}
      hint={HINTS.ceiling}
      headerEnd={<CapSelector value={cap} onChange={onCapChange} />}
    >
      {/* The badges read as a caption on the card, so they sit under the title
          rather than in `headerEnd` — that slot now holds the one control, and
          four elements on the title row wrap into an unreadable stack at 375px.
          Above the empty-state branch, because the month in view is worth saying
          even when there is no ceiling to show. */}
      <div className={styles.badges}>
        {limitedBy ? (
          <span className={styles.limit} title={`${limitedBy}.`}>
            {limitedBy}
          </span>
        ) : null}
        <span className={styles.now} title="Mês em curso">
          {currentLabel}
        </span>
      </div>

      {empty ? (
        <p className={styles.note}>{note}</p>
      ) : (
        <>
          {/* The headline stays the card's first <dd>: the ceiling spec reads it
              as this month's figure. */}
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
