import { PiggyBank } from "lucide-react";
import { SectionCard } from "@/components/SectionCard";
import { HINTS } from "../../hints";
import { MeterList } from "../MeterList";
import { MeterRow } from "../MeterRow";
import { ShowAllToggle } from "../ShowAllToggle";
import { type LimitCardProps, useLimitCard } from "./hook";
import styles from "./style.module.scss";

export function LimitCard(props: LimitCardProps) {
  const { empty, ceiling, rows, label, hidden, all, toggle } =
    useLimitCard(props);

  return (
    <SectionCard title="Uso da meta mensal" icon={PiggyBank} hint={HINTS.limit}>
      {empty ? (
        <p className={styles.note}>
          Defina a meta mensal em Configurações para acompanhar quanto de cada
          mês ela cobre.
        </p>
      ) : (
        <>
          <div className={styles.cardHead}>
            <p className={styles.note}>Meta mensal de {ceiling}.</p>
            {hidden ? (
              <ShowAllToggle label={label} expanded={all} onClick={toggle} />
            ) : null}
          </div>
          <MeterList>
            {rows.map((row) => (
              <MeterRow
                key={row.key}
                label={row.label}
                percent={row.percent}
                tone={row.tone}
                projected={row.projected}
                srLabel={row.srLabel}
              >
                <span>{row.spent}</span>
                <span className={styles.split}>
                  {/* ▲ means "over the ceiling" here — the inverse of
                      StatCard's directional ▲. Deliberate: a budget going up
                      is bad news. */}
                  <span aria-hidden>{row.tone === "negative" ? "▲" : "▼"}</span>{" "}
                  {row.percentText}
                </span>
              </MeterRow>
            ))}
          </MeterList>
        </>
      )}
    </SectionCard>
  );
}
