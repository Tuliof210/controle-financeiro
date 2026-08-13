import { SectionCard } from "@/components/SectionCard/index.tsx";
import { type NoticeProps, useNotice } from "./hook.ts";
import styles from "./style.module.scss";

// The whole-screen states — loading, a failed fetch, and the two the payload
// itself reports — all render as one card with a sentence in it.
//
// The role rides the <p>, not the card: `role="alert"` on a container announces
// everything inside it, and the title is already in the card's own heading.
export function Notice(props: NoticeProps) {
  const { title, icon, children, role, action } = useNotice(props);

  return (
    <SectionCard title={title} icon={icon}>
      <p className={styles.notice} role={role}>
        {children}
      </p>
      {action !== undefined && <div className={styles.action}>{action}</div>}
    </SectionCard>
  );
}
