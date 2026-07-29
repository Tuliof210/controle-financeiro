import { type ShowAllToggleProps, useShowAllToggle } from "./hook";
import styles from "./style.module.scss";

// The `Ver todos (N)` / `Mostrar menos` chip CeilingCard and LimitCard share.
// Extracted for the reason MeterRow and MeterList were: it is byte-identical in
// both, and the 44px hit target and focus ring should not be able to drift
// apart between two call sites.
//
// aria-expanded, like every other disclosure button in this app (Aside's rail
// collapse, Header's sidebar): the chip shows and hides the rows below it, and
// the label alone does not tell assistive tech which state it is in.
export function ShowAllToggle(props: ShowAllToggleProps) {
  const { label, expanded, onClick } = useShowAllToggle(props);

  return (
    <button
      type="button"
      className={styles.toggle}
      aria-expanded={expanded}
      onClick={onClick}
    >
      {label}
    </button>
  );
}
