import Link from "next/link";
import { Tooltip } from "@/components/Tooltip/index.tsx";
import { HINTS } from "../../hints.ts";
import { GoalRow } from "../GoalRow/index.tsx";
import { type SavingsSectionProps, useSavingsSection } from "./hook.ts";
import styles from "./style.module.scss";

export function SavingsSection(props: SavingsSectionProps) {
  const { goals, empty, capacity, caption, goalCount, total, horizon } =
    useSavingsSection(props);

  // One <section>, and exactly one: the band is a <div> inside it now. A second
  // nested <section> here would be a Playwright strict-mode violation — the
  // goals suite reaches this block as THE section carrying the heading below.
  return (
    <section className={styles.card}>
      <div className={styles.banner}>
        <div className={styles.stripes} aria-hidden />
        <div className={styles.capacity}>
          <div className={styles.eyebrowRow}>
            {/* The eyebrow already reads as this card's title, and it is the
                only one the card has — so it IS the h2, matching the one
                SectionCard renders on every other card in the shell. */}
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
      </div>

      {empty ? (
        <p className={styles.empty}>
          Nenhum objetivo cadastrado ainda. Adicione um em{" "}
          <Link href="/configuracoes">Configurações</Link>.
        </p>
      ) : (
        <>
          {/* Drawn once for the whole table, and only from `lg` — below it
              every row states its own labels. No table ARIA role on any of
              this: Biome's noRedundantRoles/useSemanticElements pincer means a
              grid that reflows cannot declare the roles the reflow destroys. */}
          <div className={styles.columns}>
            <span>META</span>
            <span>DEDICADO</span>
            <span>EM PARALELO</span>
            <span>UM DE CADA VEZ</span>
          </div>
          <ul className={styles.list}>
            {goals.map((goal) => (
              <GoalRow key={goal.id} goal={goal} horizon={horizon} />
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
