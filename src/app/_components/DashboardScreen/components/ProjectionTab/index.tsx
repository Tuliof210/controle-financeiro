import { CeilingCard } from "../CeilingCard";
import { LimitCard } from "../LimitCard";
import { type ProjectionTabProps, useProjectionTab } from "./hook";
import styles from "./style.module.scss";

export function ProjectionTab(props: ProjectionTabProps) {
  const { ceiling, limit, current } = useProjectionTab(props);

  return (
    <div className={styles.tab}>
      <CeilingCard ceiling={ceiling} current={current} />
      <LimitCard limit={limit} current={current} />
    </div>
  );
}
