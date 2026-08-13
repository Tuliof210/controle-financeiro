import Link from "next/link";
import { Tooltip } from "@/components/Tooltip/index.tsx";
import { HINTS } from "../../hints.ts";
import { GoalRow } from "../GoalRow/index.tsx";
import { MoneyFigure } from "../MoneyFigure/index.tsx";
import { type SavingsSectionProps, useSavingsSection } from "./hook.ts";
import styles from "./style.module.scss";

const COPY = {
  capacidadeDePoupanca: "CAPACIDADE DE POUPANÇA",
  mes: "/mês",
  objetivos: "OBJETIVOS",
  totalEmMetas: "TOTAL EM METAS",
  configuracoes: "Configurações",
  fullStop: ".",
  meta: "META",
  dedicado: "DEDICADO",
  emParalelo: "EM PARALELO",
  umDeCadaVez: "UM DE CADA VEZ",
  nenhumObjetivoCadastrado: "Nenhum objetivo cadastrado ainda. Adicione um em",
} as const;

export function SavingsSection(props: SavingsSectionProps) {
  const { goals, empty, capacity, caption, goalCount, total, horizon } =
    useSavingsSection(props);

  // One <section>, and exactly one: the band is a <div> inside it now. A second
  // nested <section> here would be a Playwright strict-mode violation — the
  // goals suite reaches this block as THE section carrying the heading below.
  return (
    <section className={styles.card}>
      <div className={styles.banner}>
        <div className={styles.capacity}>
          <div className={styles.eyebrowRow}>
            {/* The eyebrow already reads as this card's title, and it is the
                only one the card has — so it IS the h2, matching the one
                SectionCard renders on every other card in the shell. */}
            <h2 className={styles.eyebrow}>{COPY.capacidadeDePoupanca}</h2>
            <Tooltip
              text={HINTS.goals}
              label="Como a capacidade de poupança é calculada"
            />
          </div>
          <p className={styles.value}>
            <MoneyFigure cents={capacity} />
            <span className={styles.per}> {COPY.mes}</span>
          </p>
          <p className={styles.caption}>{caption}</p>
        </div>

        {/* The wrappers carry no class: `.facts` is the flex row that does the
            spacing, and each <div> only keeps its dt/dd together. */}
        <dl className={styles.facts}>
          <div>
            <dt className={styles.factLabel}>{COPY.objetivos}</dt>
            <dd className={styles.factValue}>{goalCount}</dd>
          </div>
          <div>
            <dt className={styles.factLabel}>{COPY.totalEmMetas}</dt>
            <dd className={styles.factValue}>{total}</dd>
          </div>
        </dl>
      </div>

      {Boolean(empty) && (
        <p className={styles.empty}>
          {COPY.nenhumObjetivoCadastrado}{" "}
          <Link href="/configuracoes">{COPY.configuracoes}</Link>
          {COPY.fullStop}
        </p>
      )}
      {!empty && (
        <>
          {/* Drawn once for the whole table, and only from `lg` — below it
              every row states its own labels. No table ARIA role on any of
              this: Biome's noRedundantRoles/useSemanticElements pincer means a
              grid that reflows cannot declare the roles the reflow destroys. */}
          <div className={styles.columns}>
            <span>{COPY.meta}</span>
            <span>{COPY.dedicado}</span>
            <span>{COPY.emParalelo}</span>
            <span>{COPY.umDeCadaVez}</span>
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
