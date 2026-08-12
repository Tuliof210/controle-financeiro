import { ListTree } from "lucide-react";
import { Button } from "@/components/Button/index.tsx";
import { FilePicker } from "@/components/FilePicker/index.tsx";
import { SectionCard } from "@/components/SectionCard/index.tsx";
import { TagNode } from "./components/TagNode/index.tsx";
import { type TreeViewProps, useTreeView } from "./hook.ts";
import styles from "./style.module.scss";

const COPY = {
  fechar: "Fechar",
} as const;

export function TreeView(props: TreeViewProps) {
  const { fileName, header, root, onClose, onFile } = useTreeView(props);

  return (
    <SectionCard title="Hierarquia de tags" icon={ListTree}>
      <p className={styles.file}>{fileName}</p>
      {header.length > 0 && (
        <ul className={styles.header}>
          {header.map((entry) => (
            <TagNode key={entry.id} node={entry} />
          ))}
        </ul>
      )}
      <ul className={styles.tree}>
        <TagNode node={root} />
      </ul>
      <div className={styles.actions}>
        <Button variant="ghost" onClick={onClose}>
          {COPY.fechar}
        </Button>
        <FilePicker label="Trocar arquivo" onFile={onFile} />
      </div>
    </SectionCard>
  );
}
