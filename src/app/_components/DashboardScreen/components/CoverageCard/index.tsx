import { ClipboardCheck } from "lucide-react";
import { SectionCard } from "@/components/SectionCard";
import { HINTS } from "../../hints";
import { MeterRow } from "../MeterRow";
import { type CoverageCardProps, useCoverageCard } from "./hook";
import styles from "./style.module.scss";

export function CoverageCard(props: CoverageCardProps) {
  const { empty, headline, summary, rows } = useCoverageCard(props);

  return (
    <SectionCard
      title="Cobertura do previsto"
      icon={ClipboardCheck}
      hint={HINTS.coverage}
    >
      {empty ? (
        <p className={styles.empty}>
          Nenhum compromisso previsto nos meses já decorridos.
        </p>
      ) : (
        <>
          <p className={styles.headline}>{headline}</p>
          <p className={styles.empty}>{summary}</p>
          {rows.length === 0 ? (
            <p className={styles.empty}>
              Todos os meses decorridos estão lançados.
            </p>
          ) : (
            <ul className={styles.list}>
              {rows.map((row) => (
                <MeterRow
                  key={row.key}
                  label={row.label}
                  percent={row.percent}
                  tone="negative"
                  srLabel={row.srLabel}
                >
                  <span>faltam {row.gap}</span>
                </MeterRow>
              ))}
            </ul>
          )}
        </>
      )}
    </SectionCard>
  );
}
