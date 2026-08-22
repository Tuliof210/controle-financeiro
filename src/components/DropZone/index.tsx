import { Icon } from "@/components/Icon/index.tsx";
import { cx } from "@/lib/cx.ts";
import { FilePicker } from "../FilePicker/index.tsx";
import { type DropZoneProps, useDropZone } from "./hook.ts";
import styles from "./style.module.scss";

const COPY = {
  prompt: "Arraste o extrato .ofx",
  versions: "· OFX 1.x e 2.x",
  sizeLimit: "· até 5 MB",
  local: "· 100% local",
} as const;

export function DropZone(props: DropZoneProps) {
  const { over, note, onFile, ref } = useDropZone(props);

  return (
    // No tabIndex and no click handler on the panel itself: a focusable div
    // that opens a file dialog is worse than the button already inside it,
    // which is what a keyboard or screen-reader user reaches for.
    <div ref={ref} className={cx(styles.zone, over && styles.over)}>
      <span className={styles.glyph}>
        <Icon name="upload" size={28} />
      </span>
      <p className={styles.eyebrow}>{COPY.prompt}</p>
      <p className={styles.note}>{note}</p>
      <FilePicker label="Escolher arquivo" onFile={onFile} />
      {/* 5 MB, not the design's 10: the route's cap is 5 and is not changing. */}
      <p className={styles.foot}>
        <span>{COPY.versions}</span>
        <span>{COPY.sizeLimit}</span>
        <span>{COPY.local}</span>
      </p>
    </div>
  );
}
