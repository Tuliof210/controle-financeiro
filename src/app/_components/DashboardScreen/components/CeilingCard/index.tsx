import { Wallet } from "lucide-react";
import { SectionCard } from "@/components/SectionCard/index.tsx";
import { cx } from "@/lib/cx.ts";
import { HINTS } from "../../hints.ts";
import { Headline } from "../Headline/index.tsx";
import { MoneyFigure } from "../MoneyFigure/index.tsx";
import { ShowAllToggle } from "../ShowAllToggle/index.tsx";
import { CapSelector } from "./components/CapSelector/index.tsx";
import { MonthTable } from "./components/MonthTable/index.tsx";
import { RateList } from "./components/RateList/index.tsx";
import { type CeilingCardProps, useCeilingCard } from "./hook.ts";
import styles from "./style.module.scss";

export function CeilingCard(props: CeilingCardProps) {
  const {
    empty,
    note,
    definition,
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
        <CapSelector
          value={cap}
          hasMeta={hasMeta}
          hint={HINTS.ceilingCap}
          onChange={onCapChange}
        />
      }
    >
      <div className={cx(styles.split, empty && styles.alone)}>
        <div className={styles.summary}>
          {/* Prose, not a hint: this is what the whole screen turns on, and it
              used to open a 687-character bubble no touch reader reaches. */}
          <p className={styles.definition}>{definition}</p>

          {/* The badges head the summary pane rather than the title row: that
              slot holds the one control, and four elements wrap at 375px. */}
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
                  month's figure. The rates below add <dd>s AFTER it. */}
              <Headline caption="Gasto extra este mês">
                <MoneyFigure cents={monthly} />
                <span className={styles.chip}>{monthsLeft}</span>
              </Headline>

              <RateList rates={rates} />
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
