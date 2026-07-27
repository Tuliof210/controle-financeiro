import { type ShowAllToggleProps, useShowAllToggle } from "./hook";
import styles from "./style.module.scss";

// The `Ver todos (N)` / `Mostrar menos` chip SlackCard and LimitCard share.
// Extracted for the reason MeterRow and MeterList were: it is byte-identical in
// both, and the 44px hit target and focus ring should not be able to drift
// apart between two call sites.
export function ShowAllToggle(props: ShowAllToggleProps) {
  const { label, onClick } = useShowAllToggle(props);

  return (
    <button type="button" className={styles.toggle} onClick={onClick}>
      {label}
    </button>
  );
}
