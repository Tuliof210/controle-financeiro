import { Wallet } from "lucide-react";
import { SectionCard } from "@/components/SectionCard/index.tsx";
import { cx } from "@/lib/cx.ts";
import { HINTS } from "../../hints.ts";
import { CEILING_MONTHS_ID } from "../../ids.ts";
import { Headline } from "../Headline/index.tsx";
import { MoneyFigure } from "../MoneyFigure/index.tsx";
import { ShowAllToggle } from "../ShowAllToggle/index.tsx";
import { Badges } from "./components/Badges/index.tsx";
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
    currentPrefix,
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
          {/* Prose, not a hint: the concept the screen turns on. */}
          <p className={styles.definition}>{definition}</p>

          {/* Badges head the summary pane: the title row holds the one control. */}
          <Badges
            limitedBy={limitedBy}
            currentLabel={currentLabel}
            currentPrefix={currentPrefix}
          />

          {Boolean(empty) && <p className={styles.note}>{note}</p>}
          {!empty && (
            <>
              {/* Stays the card's first <dd>: the spec anchors on it. */}
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
            <MonthTable rows={rows} id={CEILING_MONTHS_ID} />
            <div className={styles.footer}>
              <span>{count}</span>
              {Boolean(hidden) && (
                <ShowAllToggle
                  label={label}
                  expanded={all}
                  controls={CEILING_MONTHS_ID}
                  onClick={toggle}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </SectionCard>
  );
}
