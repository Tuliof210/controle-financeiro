"use client";

import { PageHeader } from "@/components/PageHeader";
import { ReportView } from "./components/ReportView";
import { UploadCard } from "./components/UploadCard";
import { useOfxScreen } from "./hook";
import styles from "./style.module.scss";

export function OfxScreen() {
  const { loaded, report, error, loading, upload, close } = useOfxScreen();

  return (
    <div className={styles.screen}>
      <PageHeader
        eyebrow="IMPORTAÇÃO"
        title="Leitor OFX"
        subtitle="Leia o extrato do banco direto no navegador, sem subir nada."
      />
      {loaded ? (
        report ? (
          <ReportView
            report={report}
            error={error}
            loading={loading}
            onClose={close}
            onFile={upload}
          />
        ) : (
          <UploadCard error={error} loading={loading} onFile={upload} />
        )
      ) : null}
    </div>
  );
}
