import { type CapSelectorProps, useCapSelector } from "./hook.ts";
import styles from "./style.module.scss";

// How much of each month's headroom the ceiling hands out. Native radios inside
// a <fieldset>, not buttons carrying `role="radio"`: ColorPicker needs that
// escape hatch because a real radio cannot paint a colour swatch, and Biome's
// `useSemanticElements` is right to ask for one here, where a segment is text.
// Arrow-key navigation and the single tab stop then come from the platform
// rather than from a keydown handler.
//
// The <input> is clipped rather than hidden so it keeps its focus, and the paint
// hangs off `:checked` on the sibling span — the state and its appearance are
// one declaration, so they cannot drift.
export function CapSelector(props: CapSelectorProps) {
  const { segments, onChange } = useCapSelector(props);

  return (
    <fieldset className={styles.group}>
      <legend className={styles.legend}>Quanto do saldo é liberado</legend>
      {segments.map(({ cap, label, checked }) => (
        <label key={cap} className={styles.segment}>
          <input
            className={styles.input}
            type="radio"
            name="ceiling-cap"
            value={cap}
            checked={checked}
            onChange={() => onChange(cap)}
          />
          <span className={styles.text}>{label}</span>
        </label>
      ))}
    </fieldset>
  );
}
