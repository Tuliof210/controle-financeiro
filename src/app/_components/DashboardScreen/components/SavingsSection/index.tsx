import Link from "next/link";
import { Tooltip } from "@/components/Tooltip";
import { HINTS } from "../../hints";
import { GoalCard } from "../GoalCard";
import { type SavingsSectionProps, useSavingsSection } from "./hook";
import styles from "./style.module.scss";

export function SavingsSection(props: SavingsSectionProps) {
  const { goals, empty, capacity, caption, goalCount, total, horizon } =
    useSavingsSection(props);

  // A fragment, not a wrapper — Board owns the column. See its comment.
  return (
    <>
      <section className={styles.banner}>
        <div className={styles.stripes} aria-hidden />
        <div className={styles.capacity}>
          <div className={styles.eyebrowRow}>
            {/* The eyebrow already reads as this section's title, and it is
                the only one the banner has — so it IS the h2, matching the
                one SectionCard renders on every other card in the shell. */}
            <h2 className={styles.eyebrow}>CAPACIDADE DE POUPANÇA</h2>
            <Tooltip
              text={HINTS.goals}
              label="Como a capacidade de poupança é calculada"
            />
          </div>
          <p className={styles.value}>
            {capacity}
            <span className={styles.per}> /mês</span>
          </p>
          <p className={styles.caption}>{caption}</p>
        </div>

        {/* The wrappers carry no class: `.facts` is the flex row that does the
            spacing, and each <div> only keeps its dt/dd together. */}
        <dl className={styles.facts}>
          <div>
            <dt className={styles.factLabel}>OBJETIVOS</dt>
            <dd className={styles.factValue}>{goalCount}</dd>
          </div>
          <div>
            <dt className={styles.factLabel}>TOTAL EM METAS</dt>
            <dd className={styles.factValue}>{total}</dd>
          </div>
        </dl>
      </section>

      {empty ? (
        <p className={styles.empty}>
          Nenhum objetivo cadastrado ainda. Adicione um em{" "}
          <Link href="/configuracoes">Configurações</Link>.
        </p>
      ) : (
        <div className={styles.grid}>
          {goals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} horizon={horizon} />
          ))}
        </div>
      )}
    </>
  );
}
