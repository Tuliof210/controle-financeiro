import { TabBar } from "@/components/TabBar";
import { GeneralTab } from "../GeneralTab";
import { GoalsTab } from "../GoalsTab";
import { ProjectionTab } from "../ProjectionTab";
import { type BoardProps, useBoard } from "./hook";
import styles from "./style.module.scss";

export function Board(props: BoardProps) {
  const { data, tab, tabs, onSelect } = useBoard(props);

  return (
    <div className={styles.board}>
      <TabBar tabs={tabs} onSelect={onSelect} label="Seções do painel" />
      {tab === "geral" ? <GeneralTab data={data} /> : null}
      {tab === "projecao" ? <ProjectionTab data={data} /> : null}
      {tab === "metas" ? <GoalsTab data={data} /> : null}
    </div>
  );
}
