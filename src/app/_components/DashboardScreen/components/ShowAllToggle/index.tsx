import { type ShowAllToggleProps, useShowAllToggle } from "./hook";
import styles from "./style.module.scss";

// The `Ver todos (N)` / `Mostrar menos` chip above CeilingCard's month list.
// Extracted for the reason MeterRow and MeterList were: it was byte-identical
// in the two cards that had one, and the 44px hit target and focus ring should
// not be able to drift apart between call sites. Only this caller is left.
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
