import { FileUp } from "lucide-react";
import { SectionCard } from "@/components/SectionCard";
import { DropZone } from "../DropZone";
import { type UploadCardProps, useUploadCard } from "./hook";
import styles from "./style.module.scss";

// The wrapper owns the card chrome and the error line; the drag behaviour lives
// in DropZone so its handlers stay isolated and testable.
export function UploadCard(props: UploadCardProps) {
  const { error, onFile } = useUploadCard(props);

  return (
    <SectionCard title="Enviar extrato OFX" icon={FileUp}>
      <DropZone onFile={onFile} />
      {error ? (
        <p className={styles.error}>
          <span aria-hidden>▲</span> {error}
        </p>
      ) : null}
    </SectionCard>
  );
}
