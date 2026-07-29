import { EntrySection } from "@/components/EntrySection";
import type { Entry } from "@/lib/entry-types";
import { type SectionsProps, useSections } from "./hook";
import styles from "./style.module.scss";

export function Sections<T extends Entry>(props: SectionsProps<T>) {
  const { sections } = useSections(props);

  return (
    <div className={styles.grid}>
      {sections.map(({ key, ...section }) => (
        <EntrySection key={key} {...section} />
      ))}
    </div>
  );
}
