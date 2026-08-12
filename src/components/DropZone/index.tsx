import { Upload } from "lucide-react";
import { FilePicker } from "../FilePicker/index.tsx";
import { type DropZoneProps, useDropZone } from "./hook.ts";
import styles from "./style.module.scss";

export function DropZone(props: DropZoneProps) {
  const { over, note, onFile, ref } = useDropZone(props);

  return (
    // No tabIndex and no click handler on the panel itself: a focusable div
    // that opens a file dialog is worse than the button already inside it,
    // which is what a keyboard or screen-reader user reaches for.
    <div
      ref={ref}
      className={over ? `${styles.zone} ${styles.over}` : styles.zone}
    >
      <span className={styles.glyph}>
        <Upload size={28} aria-hidden={true} />
      </span>
      <p className={styles.eyebrow}>Arraste o extrato .ofx</p>
      <p className={styles.note}>{note}</p>
      <FilePicker label="Escolher arquivo" onFile={onFile} />
      {/* 5 MB, not the design's 10: the route's cap is 5 and is not changing. */}
      <p className={styles.foot}>
        <span>· OFX 1.x e 2.x</span>
        <span>· até 5 MB</span>
        <span>· 100% local</span>
      </p>
    </div>
  );
}
