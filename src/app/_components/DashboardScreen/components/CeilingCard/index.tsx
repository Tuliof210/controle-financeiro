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
    rates,
    monthsLeft,
    cap,
    onCapChange,
  } = useCeilingCard(props);

  return (
    <SectionCard
      title="Teto de Gastos"
      icon={Wallet}
      hint={HINTS.ceiling}
      band="ink"
      headerEnd={<CapSelector value={cap} onChange={onCapChange} />}
    >
      <div className={`${styles.split} ${empty ? styles.alone : ""}`}>
        <div className={styles.summary}>
          {/* The badges read as a caption on the card, so they head the summary
              pane rather than the title row — that slot holds the one control,
              and four elements on it wrap into an unreadable stack at 375px.
              Above the empty-state branch, because the month in view is worth
              saying even when there is no ceiling to show. */}
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
              {/* Stays the card's first <dd>: the ceiling spec reads it as this
                  month's figure, anchored at the start of the string. The rates
                  below add <dd>s AFTER it, never before. */}
              <Headline caption="Gasto extra este mês">
                {monthly}
                <span className={styles.chip}>{monthsLeft}</span>
              </Headline>

              <dl className={styles.rates}>
                {rates.map((rate) => (
                  <div className={styles.rate} key={rate.key}>
                    <dt className={styles.rateLabel}>{rate.label}</dt>
                    <dd className={styles.rateValue}>{rate.value}</dd>
                  </div>
                ))}
              </dl>
            </>
          )}
        </div>

        {empty ? null : (
          <div className={styles.pane}>
            <MonthTable rows={rows} />
            <div className={styles.footer}>
              <span>{count}</span>
              {hidden ? (
                <ShowAllToggle label={label} expanded={all} onClick={toggle} />
              ) : null}
            </div>
          </div>
        )}
      </div>
    </SectionCard>
  );
}
