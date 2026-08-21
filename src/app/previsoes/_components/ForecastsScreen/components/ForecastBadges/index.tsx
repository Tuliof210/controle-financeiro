import { type ForecastBadgesProps, useForecastBadges } from "./hook.ts";
import styles from "./style.module.scss";

export function ForecastBadges(props: ForecastBadgesProps) {
  const { items } = useForecastBadges(props);

  return (
    <span className={styles.badges}>
      {items.map(({ key, label, className }) => (
        <span key={key} className={className}>
          {label}
        </span>
      ))}
    </span>
  );
}
