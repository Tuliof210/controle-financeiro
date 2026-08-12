import { type TagNodeProps, useTagNode } from "./hook.ts";
import styles from "./style.module.scss";

// Recurses on itself: an aggregate's <ul> is one of these per child, however
// deep the file nests them — open by default, so the whole tree is visible
// on drop and a reader collapses only what they don't care about.
export function TagNode(props: TagNodeProps) {
  const node = useTagNode(props);

  if ("value" in node) {
    return (
      <li className={styles.leaf}>
        <span className={styles.tag}>{node.tag}</span>
        <span className={styles.value}>{node.value}</span>
      </li>
    );
  }
  return (
    <li>
      <details open={true}>
        <summary className={styles.tag}>{node.tag}</summary>
        <ul className={styles.children}>
          {node.children.map((child) => (
            <TagNode key={child.id} node={child} />
          ))}
        </ul>
      </details>
    </li>
  );
}
