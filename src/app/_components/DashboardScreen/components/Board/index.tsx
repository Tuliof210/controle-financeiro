import { CeilingCard } from "../CeilingCard";
import { Overview } from "../Overview";
import { SavingsSection } from "../SavingsSection";
import { type BoardProps, useBoard } from "./hook";
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
      <Overview data={data} />
      <CeilingCard
        ceiling={ceiling}
        meta={meta}
        current={current}
        cap={cap}
        onCapChange={onCapChange}
      />
      <SavingsSection data={data} />
    </div>
  );
}
