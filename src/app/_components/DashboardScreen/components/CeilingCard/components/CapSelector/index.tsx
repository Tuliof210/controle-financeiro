import { Tooltip } from "@/components/Tooltip/index.tsx";
import { type CapSelectorProps, useCapSelector } from "./hook.ts";
import styles from "./style.module.scss";

const COPY = {
  liberarDoSaldo: "Liberar do saldo:",
} as const;

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
//
// The <legend> is VISIBLE, and the pill moved into a <div> inside the fieldset to
// make room for it. Clipped, it still named the group for assistive tech but left
// sighted readers four bare percentages of a quantity nothing on screen named —
// the only explanation was a 687-character hover bubble.
export function CapSelector(props: CapSelectorProps) {
  const { segments, hint } = useCapSelector(props);

  return (
    <fieldset className={styles.field}>
      <legend className={styles.legend}>{COPY.liberarDoSaldo}</legend>
      {/* The trade-off the cap makes, on the control that makes it — it used to
          be one clause inside the card's 687-character hint. */}
      <Tooltip text={hint} label="O que o seletor de teto muda" />
      <div className={styles.group}>
        {segments.map(({ cap, label, checked, select }) => (
          <label key={cap} className={styles.segment}>
            <input
              className={styles.input}
              type="radio"
              name="ceiling-cap"
              value={cap}
              checked={checked}
              onChange={select}
            />
            <span className={styles.text}>{label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
