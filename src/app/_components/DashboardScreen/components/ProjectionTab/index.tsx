import { CeilingCard } from "../CeilingCard";
import { type ProjectionTabProps, useProjectionTab } from "./hook";
import styles from "./style.module.scss";

export function ProjectionTab(props: ProjectionTabProps) {
  const { ceiling, current } = useProjectionTab(props);

  return (
    <div className={styles.tab}>
      <CeilingCard ceiling={ceiling} current={current} />
    </div>
  );
}
