import { Target } from "lucide-react";
import Link from "next/link";
import { SectionCard } from "@/components/SectionCard";
import { HINTS } from "../../hints";
import { MeterList } from "../MeterList";
import { MeterRow } from "../MeterRow";
import { type GoalsCardProps, useGoalsCard } from "./hook";
import styles from "./style.module.scss";

export function GoalsCard(props: GoalsCardProps) {
  const { empty, headline, rows } = useGoalsCard(props);

  return (
    <SectionCard title="Objetivos" icon={Target} hint={HINTS.goals}>
      {/* Above the empty state too: the pace is worth reading even with
          nothing to spend it on yet. Wrapped so the note sits against its
          headline — SectionCard's body puts --space-4 between its children. */}
      <div className={styles.pace}>
        <p className={styles.headline}>{headline}</p>
        <p className={styles.note}>
          por mês, guardando 25% da menor folga do período
        </p>
      </div>

      {empty ? (
        <p className={styles.empty}>
          Nenhum objetivo cadastrado ainda. Adicione um em{" "}
          <Link href="/configuracoes">Configurações</Link>.
        </p>
      ) : (
        <MeterList>
          {rows.map((row) => (
            <MeterRow
              key={row.key}
              label={row.name}
              percent={row.percent}
              tone={row.tone}
              srLabel={row.srLabel}
              footer={
                <>
                  <span className={row.unreachable ? styles.unreachable : ""}>
                    {row.wait}
                  </span>
                  {row.done ? <span>{row.done}</span> : null}
                  {row.needed ? <span>{row.needed}</span> : null}
                </>
              }
            >
              <span>{row.funded}</span>
            </MeterRow>
          ))}
        </MeterList>
      )}
    </SectionCard>
  );
}
