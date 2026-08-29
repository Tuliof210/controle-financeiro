import { Card } from "@/components/Card/index.tsx";
import { Delta } from "@/components/Delta/index.tsx";
import { MoneyDisplay } from "@/components/MoneyDisplay/index.tsx";
import { type ProjectedBalanceProps, useProjectedBalance } from "./hook.ts";
import styles from "./style.module.scss";

const COPY = {
  saldoProjetado: "Saldo projetado em",
  vsSaldoAtual: "vs. saldo atual de",
} as const;

// Editorial, not a metric tile: a claim, the projected balance as type, then
// the delta as a line of copy. PeriodFacts holds the supporting stats.
export function ProjectedBalance(props: ProjectedBalanceProps) {
  const { figures } = useProjectedBalance(props);

  if (figures === null) {
    return null;
  }

  return (
    <Card as="section" variant="elevated" padding="lg">
      <p className={styles.claim}>
        {`${COPY.saldoProjetado} ${figures.endLabel}.`}
      </p>
      <p className={styles.value}>
        <MoneyDisplay value={figures.value} variant="hero" />
      </p>
      <p className={styles.deltaLine}>
        <Delta value={figures.delta} money={true} />
        <span className={styles.vs}>
          {`${COPY.vsSaldoAtual} ${figures.now}.`}
        </span>
      </p>
    </Card>
  );
}
