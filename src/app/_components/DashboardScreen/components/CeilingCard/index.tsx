import { Wallet } from "lucide-react";
import { SectionCard } from "@/components/SectionCard/index.tsx";
import { cx } from "@/lib/cx.ts";
import { HINTS } from "../../hints.ts";
import { Headline } from "../Headline/index.tsx";
import { MoneyFigure } from "../MoneyFigure/index.tsx";
import { ShowAllToggle } from "../ShowAllToggle/index.tsx";
import { CapSelector } from "./components/CapSelector/index.tsx";
import { MonthTable } from "./components/MonthTable/index.tsx";
import { type CeilingCardProps, useCeilingCard } from "./hook.ts";
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
    hasMeta,
    onCapChange,
  } = useCeilingCard(props);

  return (
    <SectionCard
      title="Teto de Gastos"
      icon={Wallet}
      hint={HINTS.ceiling}
      band="ink"
      headerEnd={
        <CapSelector value={cap} hasMeta={hasMeta} onChange={onCapChange} />
      }
    >
      <div className={cx(styles.split, empty && styles.alone)}>
        <div className={styles.summary}>
          {/* The badges read as a caption on the card, so they head the summary
              pane rather than the title row — that slot holds the one control,
              and four elements on it wrap into an unreadable stack at 375px.
              Above the empty-state branch, because the month in view is worth
              saying even when there is no ceiling to show. */}
          <div className={styles.badges}>
            {Boolean(limitedBy) && (
              <span className={styles.limit} title={`${limitedBy}.`}>
                {limitedBy}
              </span>
            )}
            <span className={styles.now} title="Mês em curso">
              {currentLabel}
            </span>
          </div>

          {Boolean(empty) && <p className={styles.note}>{note}</p>}
          {!empty && (
            <>
              {/* Stays the card's first <dd>: the ceiling spec reads it as this
                  month's figure, anchored at the start of the string. The rates
                  below add <dd>s AFTER it, never before. */}
              <Headline caption="Gasto extra este mês">
                <MoneyFigure cents={monthly} />
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

        {!empty && (
          <div className={styles.pane}>
            <MonthTable rows={rows} />
            <div className={styles.footer}>
              <span>{count}</span>
              {Boolean(hidden) && (
                <ShowAllToggle label={label} expanded={all} onClick={toggle} />
              )}
            </div>
          </div>
        )}
      </div>
    </SectionCard>
  );
}
