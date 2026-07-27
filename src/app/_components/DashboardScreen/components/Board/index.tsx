import { GeneralTab } from "../GeneralTab";
import { TabBar } from "../TabBar";
import { type BoardProps, useBoard } from "./hook";
import styles from "./style.module.scss";

export function Board(props: BoardProps) {
  const { data, tab, tabs, onSelect } = useBoard(props);

  return (
    <div className={styles.board}>
      <TabBar tabs={tabs} onSelect={onSelect} />
      {tab === "geral" ? <GeneralTab data={data} /> : null}
      {/* task 05 adds ProjectionTab and GoalsTab here */}
    </div>
  );
}
