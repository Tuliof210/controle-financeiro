import { type HeadlineProps, useHeadline } from "./hook";
import styles from "./style.module.scss";

export function Headline(props: HeadlineProps) {
  const { caption, tone, children } = useHeadline(props);

  // A labelled figure, not a bare number — otherwise the biggest value on the
  // card is the only one a screen reader announces without a name.
  return (
    <dl className={styles.headline}>
      <dt className={styles.caption}>{caption}</dt>
      <dd className={`${styles.total} ${tone ? styles[tone] : ""}`}>
        {children}
      </dd>
    </dl>
  );
}
