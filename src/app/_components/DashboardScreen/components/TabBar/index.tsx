import { type TabBarProps, useTabBar } from "./hook";
import styles from "./style.module.scss";

// Deliberately NOT the ARIA tabs pattern: role="tab" promises a roving tabindex
// and arrow-key navigation, and claiming the role without implementing it is
// worse than not claiming it. aria-pressed buttons are announced correctly and
// keyboard-operable with no extra code.
//
// <fieldset>, not <div role="group">: Biome's a11y/useSemanticElements rejects
// the explicit role in favour of the element that already implies it, and
// fieldset's implicit ARIA role IS group. aria-label names it without a legend.
export function TabBar(props: TabBarProps) {
  const { tabs, onSelect } = useTabBar(props);

  return (
    <fieldset className={styles.bar} aria-label="Seções do painel">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          aria-pressed={tab.active}
          className={styles.tab}
          onClick={() => onSelect(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </fieldset>
  );
}
