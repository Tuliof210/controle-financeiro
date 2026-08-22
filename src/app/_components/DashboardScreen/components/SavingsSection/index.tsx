import Link from "next/link";
import { Card } from "@/components/Card/index.tsx";
import { MoneyDisplay } from "@/components/MoneyDisplay/index.tsx";
import { Tooltip } from "@/components/Tooltip/index.tsx";
import { HINTS } from "../../hints.ts";
import { GoalRow } from "../GoalRow/index.tsx";
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

  return (
    <Card as="section" variant="elevated" className={styles.card}>
      <div className={styles.banner}>
        <div className={styles.capacity}>
          <div className={styles.eyebrowRow}>
            <h2 className={styles.eyebrow}>{COPY.capacidadeDePoupanca}</h2>
            <Tooltip
              text={HINTS.goals}
              label="Como a capacidade de poupança é calculada"
            />
          </div>
          <p className={styles.value}>
            <MoneyDisplay value={capacity} variant="large" />
            <span className={styles.per}> {COPY.mes}</span>
          </p>
          <p className={styles.caption}>{caption}</p>
        </div>

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
    </Card>
  );
}
