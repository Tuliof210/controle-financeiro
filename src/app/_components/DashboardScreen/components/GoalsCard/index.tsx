import { Target } from "lucide-react";
import Link from "next/link";
import { SectionCard } from "@/components/SectionCard";
import { HINTS } from "../../hints";
import { type GoalsCardProps, useGoalsCard } from "./hook";
import styles from "./style.module.scss";

export function GoalsCard(props: GoalsCardProps) {
  const { empty, rows } = useGoalsCard(props);

  return (
    <SectionCard title="Objetivos" icon={Target} hint={HINTS.goals}>
      {empty ? (
        <p className={styles.empty}>
          Nenhum objetivo cadastrado ainda. Adicione um em{" "}
          <Link href="/configuracoes">Configurações</Link>.
        </p>
      ) : (
        <ul className={styles.list}>
          {rows.map((row) => (
            <li className={styles.row} key={row.key}>
              <span className={styles.name}>{row.name}</span>
              <span className={styles.target}>{row.target}</span>
              <span
                className={row.unreachable ? styles.unreachable : styles.wait}
              >
                {row.wait}
              </span>
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  );
}
