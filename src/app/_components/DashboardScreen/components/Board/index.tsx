import { CeilingCard } from "../CeilingCard/index.tsx";
import { Overview } from "../Overview/index.tsx";
import { SavingsSection } from "../SavingsSection/index.tsx";
import { ProjectedBalance } from "./components/ProjectedBalance/index.tsx";
import { type BoardProps, useBoard } from "./hook.ts";
import styles from "./style.module.scss";

// One scroll, no tabs. Overview renders a fragment rather than a wrapper of
// its own, so its cards are direct children of this column. ProjectedBalance
// is the first card — the page title lives in HeroBand, above the board.
export function Board(props: BoardProps) {
  const { data, ceiling, current } = useBoard(props);

  return (
    <div className={styles.board}>
      <ProjectedBalance data={data} />
      <Overview data={data} />
      <CeilingCard ceiling={ceiling} current={current} />
      <SavingsSection data={data} />
    </div>
  );
}
