import { FileUp } from "lucide-react";
import { SectionCard } from "@/components/SectionCard";
import { FilePicker } from "../FilePicker";
import { type UploadCardProps, useUploadCard } from "./hook";
import styles from "./style.module.scss";

export function UploadCard(props: UploadCardProps) {
  const { error, loading, onFile, note } = useUploadCard(props);

  return (
    <SectionCard title="Enviar extrato OFX" icon={FileUp}>
      <p className={styles.note}>{note}</p>
      <div>
        <FilePicker
          label="Escolher arquivo"
          disabled={loading}
          onFile={onFile}
        />
      </div>
      {error ? (
        <p className={styles.error}>
          <span aria-hidden>▲</span> {error}
        </p>
      ) : null}
    </SectionCard>
  );
}
