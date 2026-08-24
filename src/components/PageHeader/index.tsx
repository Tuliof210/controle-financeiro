import { type PageHeaderProps, usePageHeader } from "./hook.ts";
import styles from "./style.module.scss";

// The one page-title block, shared by every screen that titles itself: the four
// NAV destinations under the Dashboard, plus /ofx-decoder, which the nav no
// longer lists. The Dashboard is the exception — HeroBand carries its own <h1>,
// because there the title, the lede and the ceiling are one editorial band.
// No action button: on Movimentações it would duplicate the card's own add
// button, and on the rest it would be behaviour those screens do not have.
// No brand kicker: that lives once, on the Aside wordmark.
export function PageHeader(props: PageHeaderProps) {
  const { title, subtitle } = usePageHeader(props);

  return (
    <header>
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.subtitle}>{subtitle}</p>
    </header>
  );
}
