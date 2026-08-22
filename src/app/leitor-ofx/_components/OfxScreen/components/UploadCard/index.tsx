import { DropZone } from "@/components/DropZone/index.tsx";
import { SectionCard } from "@/components/SectionCard/index.tsx";
import { ERROR_GLYPH } from "@/lib/glyphs.ts";
import { type UploadCardProps, useUploadCard } from "./hook.ts";
import styles from "./style.module.scss";

// The wrapper owns the card chrome and the error line; the drag behaviour lives
// in DropZone so its handlers stay isolated and testable.
export function UploadCard(props: UploadCardProps) {
  const { error, onFile } = useUploadCard(props);

  return (
    <SectionCard title="Enviar extrato OFX" icon="fileUp">
      {/* Not the default note: this screen can write to the database. The
          file itself still never lands there — only the monthly totals the
          user confirms in the import dialog do. */}
      <DropZone
        onFile={onFile}
        note="O arquivo é lido e some quando você fecha a aba. Só os totais mensais que você confirmar na importação vão para o banco."
      />
      {Boolean(error) && (
        <p className={styles.error}>
          <span aria-hidden={true}>{ERROR_GLYPH}</span> {error}
        </p>
      )}
    </SectionCard>
  );
}
