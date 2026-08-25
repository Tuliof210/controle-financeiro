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
  const { data, ceiling, current } = useBoard(props);

  return (
    <div className={styles.board}>
      <Overview data={data} />
      <CeilingCard ceiling={ceiling} current={current} />
      <SavingsSection data={data} />
    </div>
  );
}
