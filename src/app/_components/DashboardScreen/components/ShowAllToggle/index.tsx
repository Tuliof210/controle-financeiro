import { ChevronDown, ChevronUp } from "lucide-react";
import { type ShowAllToggleProps, useShowAllToggle } from "./hook.ts";
import styles from "./style.module.scss";

// The `Ver todos (N)` / `Mostrar menos` row under CeilingCard's month list.
// Extracted for the reason MeterRow and MeterList were: it was byte-identical
// in the two cards that had one, and the 44px hit target and focus ring should
// not be able to drift apart between call sites. Only this caller is left.
//
// aria-expanded, like every other disclosure button in this app (Aside's rail
// collapse, Header's sidebar): the row shows and hides the months below it,
// and the label alone does not tell assistive tech which state it is in. The
// chevron swaps rather than rotates — same convention as Aside's
// PanelLeftOpen/Close and ThemeToggle's Sun/Moon; this app never animates an
// icon in place.
export function ShowAllToggle(props: ShowAllToggleProps) {
  const { label, expanded, onClick } = useShowAllToggle(props);
  const Chevron = expanded ? ChevronUp : ChevronDown;

  return (
    <button
      type="button"
      className={styles.toggle}
      aria-expanded={expanded}
      onClick={onClick}
    >
      {label}
      <Chevron size={14} aria-hidden />
    </button>
  );
}
