import { CeilingCard } from "../CeilingCard";
import { Overview } from "../Overview";
import { SavingsSection } from "../SavingsSection";
import { type BoardProps, useBoard } from "./hook";
import styles from "./style.module.scss";

// One scroll, no tabs. Overview and SavingsSection render fragments rather than
// wrappers of their own, so every card below is a direct child of this column
// and the space between "Saldo acumulado" and "Teto de Gastos" is the same
// --space-6 as between any other two cards. Three tab panels each carrying an
// identical flex column of their own were three ways to disagree about it.
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
