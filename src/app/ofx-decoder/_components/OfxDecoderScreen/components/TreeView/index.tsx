import { ListTree } from "lucide-react";
import { Button } from "@/components/Button";
import { FilePicker } from "@/components/FilePicker";
import { SectionCard } from "@/components/SectionCard";
import { TagNode } from "./components/TagNode";
import { type TreeViewProps, useTreeView } from "./hook";
import styles from "./style.module.scss";

export function TreeView(props: TreeViewProps) {
  const { fileName, header, root, onClose, onFile } = useTreeView(props);

  return (
    <SectionCard title="Hierarquia de tags" icon={ListTree}>
      <p className={styles.file}>{fileName}</p>
      {header.length > 0 ? (
        <ul className={styles.header}>
          {header.map((entry) => (
            <TagNode key={entry.id} node={entry} />
          ))}
        </ul>
      ) : null}
      <ul className={styles.tree}>
        <TagNode node={root} />
      </ul>
      <div className={styles.actions}>
        <Button variant="ghost" onClick={onClose}>
          Fechar
        </Button>
        <FilePicker label="Trocar arquivo" onFile={onFile} />
      </div>
    </SectionCard>
  );
}
