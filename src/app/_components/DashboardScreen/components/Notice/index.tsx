import { SectionCard } from "@/components/SectionCard";
import { type NoticeProps, useNotice } from "./hook";
import styles from "./style.module.scss";

// The whole-screen states — loading, a failed fetch, and the two the payload
// itself reports — all render as one card with a sentence in it.
export function Notice(props: NoticeProps) {
  const { title, icon, children } = useNotice(props);

  return (
    <SectionCard title={title} icon={icon}>
      <p className={styles.notice}>{children}</p>
    </SectionCard>
  );
}
