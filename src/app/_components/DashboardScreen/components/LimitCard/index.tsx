import { PiggyBank } from "lucide-react";
import { SectionCard } from "@/components/SectionCard";
import { HINTS } from "../../hints";
import { MeterRow } from "../MeterRow";
import { type LimitCardProps, useLimitCard } from "./hook";
import styles from "./style.module.scss";

export function LimitCard(props: LimitCardProps) {
  const { empty, ceiling, rows } = useLimitCard(props);

  return (
    <SectionCard title="Uso da meta mensal" icon={PiggyBank} hint={HINTS.limit}>
      {empty ? (
        <p className={styles.empty}>
          Defina a meta mensal em Configurações para acompanhar quanto de cada
          mês ela cobre.
        </p>
      ) : (
        <>
          <p className={styles.empty}>Meta mensal de {ceiling}.</p>
          <ul className={styles.list}>
            {rows.map((row) => (
              <MeterRow
                key={row.key}
                label={row.label}
                percent={row.percent}
                tone={row.tone}
                srLabel={row.srLabel}
              >
                <span>{row.spent}</span>
                <span className={styles.split}>
                  <span aria-hidden>{row.tone === "negative" ? "▲" : "▼"}</span>{" "}
                  {row.percentText}
                </span>
              </MeterRow>
            ))}
          </ul>
        </>
      )}
    </SectionCard>
  );
}
