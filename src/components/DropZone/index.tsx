import { Upload } from "lucide-react";
import { FilePicker } from "../FilePicker";
import { type DropZoneProps, useDropZone } from "./hook";
import styles from "./style.module.scss";

export function DropZone(props: DropZoneProps) {
  const { over, note, onFile, onDragOver, onDragLeave, onDrop } =
    useDropZone(props);

  return (
    // No tabIndex and no click handler on the panel itself: a focusable div
    // that opens a file dialog is worse than the button already inside it,
    // which is what a keyboard or screen-reader user reaches for.
    // biome-ignore lint/a11y/noStaticElementInteractions: drag-and-drop is a pointer-only enhancement over the FilePicker button inside; ARIA has no dropzone role, and inventing one would announce an affordance a keyboard cannot use.
    <div
      className={over ? `${styles.zone} ${styles.over}` : styles.zone}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <span className={styles.glyph}>
        <Upload size={28} aria-hidden />
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
