import { CeilingCard } from "../CeilingCard/index.tsx";
import { Overview } from "../Overview/index.tsx";
import { SavingsSection } from "../SavingsSection/index.tsx";
import { ProjectedBalance } from "./components/ProjectedBalance/index.tsx";
import { type BoardProps, useBoard } from "./hook.ts";
import styles from "./style.module.scss";

// Six direct children so the xl grid areas land on the cards, not on a
// fragment wrapper. Overview still owns facts + both charts; Board only
// names the cells.
export function Board(props: BoardProps) {
  const { data, ceiling, current, areas } = useBoard(props);

  return (
    <div className={styles.board}>
      <div className={styles.hero}>
        <ProjectedBalance data={data} />
      </div>
      <Overview data={data} areas={areas} />
      <div className={styles.teto}>
        <CeilingCard ceiling={ceiling} current={current} />
      </div>
      <div className={styles.goals}>
        <SavingsSection data={data} />
      </div>
    </div>
  );
}
