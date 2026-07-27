import { type PageHeaderProps, usePageHeader } from "./hook";
import styles from "./style.module.scss";

// The one page-title block, shared by all five screens. No action button: on
// Movimentações it would duplicate the card's own add button, and on the other
// four it would be behaviour those screens do not have.
export function PageHeader(props: PageHeaderProps) {
  const { eyebrow, title, subtitle } = usePageHeader(props);

  return (
    <header>
      <p className={styles.eyebrow}>{eyebrow}</p>
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.subtitle}>{subtitle}</p>
    </header>
  );
}
