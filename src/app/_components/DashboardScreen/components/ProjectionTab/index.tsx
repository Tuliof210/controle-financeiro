import { LimitCard } from "../LimitCard";
import { SlackCard } from "../SlackCard";
import { type ProjectionTabProps, useProjectionTab } from "./hook";
import styles from "./style.module.scss";

export function ProjectionTab(props: ProjectionTabProps) {
  const { slack, limit, current } = useProjectionTab(props);

  return (
    <div className={styles.tab}>
      <SlackCard slack={slack} current={current} />
      <LimitCard limit={limit} current={current} />
    </div>
  );
}
