import { Badge } from "@/components/Badge/index.tsx";
import { ProjectionBadge } from "@/components/ProjectionBadge/index.tsx";
import { type ForecastBadgesProps, useForecastBadges } from "./hook.ts";
import styles from "./style.module.scss";

export function ForecastBadges(props: ForecastBadgesProps) {
  const { kindLabel, simulated } = useForecastBadges(props);

  return (
    <span className={styles.badges}>
      <Badge tone="neutral">{kindLabel}</Badge>
      {Boolean(simulated) && <ProjectionBadge kind="simulado" />}
    </span>
  );
}
