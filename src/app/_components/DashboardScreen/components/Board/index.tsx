import { CeilingCard } from "../CeilingCard";
import { GoalsSection } from "../GoalsSection";
import { Overview } from "../Overview";
import { type BoardProps, useBoard } from "./hook";
import styles from "./style.module.scss";

// One scroll, no tabs. Overview and GoalsSection render fragments rather than
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
      <GoalsSection data={data} />
    </div>
  );
}
