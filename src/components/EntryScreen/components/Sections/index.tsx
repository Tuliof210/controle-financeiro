import { EntrySection } from "@/components/EntrySection/index.tsx";
import type { Entry } from "@/lib/entry-types.ts";
import { type SectionsProps, useSections } from "./hook.ts";
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
