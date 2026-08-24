import { CeilingCard } from "../CeilingCard/index.tsx";
import { Overview } from "../Overview/index.tsx";
import { SavingsSection } from "../SavingsSection/index.tsx";
import { type BoardProps, useBoard } from "./hook.ts";
import styles from "./style.module.scss";

// One scroll, no tabs. CeilingCard leads so the instrument sits before the
// charts. Overview renders a fragment rather than a wrapper of its own, so its
// cards are direct children of this column and the space between "Teto de
// Gastos" and the first overview card is the same --space-6 as between any
// other two. Three tab panels each carrying an identical flex column of their
// own were three ways to disagree about it. SavingsSection IS a single card —
// its own <section> — so that same --space-6 reaches it from this column's gap
// alone.
export function Board(props: BoardProps) {
  const { data, ceiling, meta, current, cap, onCapChange } = useBoard(props);

  return (
    <div className={styles.board}>
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
