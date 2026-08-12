import { FileUp } from "lucide-react";
import { SectionCard } from "@/components/SectionCard/index.tsx";
import { type LoadingCardProps, useLoadingCard } from "./hook.ts";
import styles from "./style.module.scss";

export function LoadingCard(props: LoadingCardProps) {
  const { fileName, widths } = useLoadingCard(props);

  return (
    <SectionCard title="Lendo arquivo" icon={FileUp}>
      <p className={styles.file}>{fileName}</p>
      {/* Indeterminate on purpose: role="progressbar" with no aria-valuenow is
          exactly how that is expressed, and one round trip to /api/ofx reports
          no percentage anyone could put there. */}
      <div
        className={styles.bar}
        role="progressbar"
        aria-label="Lendo o arquivo"
      >
        <div className={styles.pulse} />
      </div>
      {/* aria-hidden on the whole block: the progressbar already announces the
          state, and five decorative bars announce nothing. */}
      <div className={styles.skeleton} aria-hidden>
        {widths.map((width) => (
          <div
            key={width}
            className={styles.line}
            style={{ width: `${width}%` }}
          />
        ))}
      </div>
    </SectionCard>
  );
}
