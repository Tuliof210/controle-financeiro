import { Delta } from "@/components/Delta/index.tsx";
import { MoneyDisplay } from "@/components/MoneyDisplay/index.tsx";
import { type AnswerBarProps, useAnswerBar } from "./hook.ts";
import styles from "./style.module.scss";

// The band, condensed to its conclusion, pinned under the header once the band
// itself has scrolled away. "Answer before evidence" as behaviour rather than
// as source order: the figure the reader came for stays on screen while they
// work through the cards, charts and month table that justify it.
//
// aria-hidden, and deliberately: every string here is already in the document
// above, in a landmark a screen reader has already read. A second announcement
// of the same number is noise, and the bar has no affordance of its own — it is
// a visual echo, which is also why it never takes a hit test.
export function AnswerBar(props: AnswerBarProps) {
  const { label, value, delta } = useAnswerBar(props);

  return (
    <div className={styles.bar} aria-hidden={true}>
      <div className={styles.inner}>
        <span className={styles.mark} />
        <span className={styles.label}>{label}</span>
        <span className={styles.value}>
          <MoneyDisplay value={value} variant="large" />
        </span>
        <span className={styles.delta}>
          <Delta value={delta} money={true} />
        </span>
      </div>
    </div>
  );
}
