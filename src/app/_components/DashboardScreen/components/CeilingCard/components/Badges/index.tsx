import { type BadgesProps, useBadges } from "./hook.ts";
import styles from "./style.module.scss";

// The card's two status badges. Its own component now: CeilingCard's `index.tsx`
// was over the 100-line cap and this is the block that had a name of its own.
//
// Neither badge carries a `title`. On `.limit` it was dead weight — `flex: none`
// plus `nowrap` means it never truncates. On `.now` it was the ONLY thing
// explaining a bare month, and `title` is hover-only, so touch never saw it; the
// clipped prefix below reaches everyone, where an aria-label on a <span> would
// reach nobody (it is ignored on a generic element).
export function Badges(props: BadgesProps) {
  const { limitedBy, currentLabel, currentPrefix } = useBadges(props);

  return (
    <div className={styles.badges}>
      {limitedBy !== null && <span className={styles.limit}>{limitedBy}</span>}
      <span className={styles.now}>
        <span className={styles.srOnly}>{currentPrefix}</span>
        {currentLabel}
      </span>
    </div>
  );
}
