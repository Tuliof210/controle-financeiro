import { CeilingCard } from "../CeilingCard/index.tsx";
import { Overview } from "../Overview/index.tsx";
import { SavingsSection } from "../SavingsSection/index.tsx";
import { type BoardProps, useBoard } from "./hook.ts";
import styles from "./style.module.scss";

// One scroll, no tabs. Overview renders a fragment rather than a wrapper of its
// own, so its cards are direct children of this column and the space between
// "Saldo acumulado" and "Teto de Gastos" is the same --space-6 as between any
// other two cards. Three tab panels each carrying an identical flex column of
// their own were three ways to disagree about it. SavingsSection IS a single
// card — its own <section> — so that same --space-6 reaches it from this
// column's gap alone.
export function Board(props: BoardProps) {
  const { data, ceiling, meta, current, cap, onCapChange } = useBoard(props);

  return (
    <div className={styles.board}>
      {/* FIRST, not third. This is the card the product exists to produce: its
          figure ("Gasto extra este mês") used to sit 2.39 viewports below the
          fold at 1280x720, behind three KPI tiles and two 264px charts, while
          the loudest thing on the page was a projection 29 months out. The owner
          opens this to decide whether they can spend today. */}
      <CeilingCard
        ceiling={ceiling}
        meta={meta}
        current={current}
        cap={cap}
        onCapChange={onCapChange}
      />
      <Overview data={data} />
      <SavingsSection data={data} />
    </div>
  );
}
