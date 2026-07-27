"use client";

import { PageHeader } from "@/components/PageHeader";
import { LoadingCard } from "./components/LoadingCard";
import { ReportView } from "./components/ReportView";
import { UploadCard } from "./components/UploadCard";
import { useOfxScreen } from "./hook";
import styles from "./style.module.scss";

export function OfxScreen() {
  const { loaded, report, error, loading, fileName, upload, close } =
    useOfxScreen();

  return (
    <div className={styles.screen}>
      <PageHeader
        eyebrow="IMPORTAÇÃO"
        title="Leitor OFX"
        subtitle="Leia o extrato do banco direto no navegador, sem subir nada."
      />
      {/* `loaded` gates all three: `report` starts null and only the
          sessionStorage effect knows whether one exists, so rendering the
          upload card unconditionally would flash it on every reload of a
          screen whose entire point is surviving reload. */}
      {loaded ? (
        loading ? (
          <LoadingCard fileName={fileName} />
        ) : report ? (
          <ReportView
            report={report}
            error={error}
            loading={loading}
            onClose={close}
            onFile={upload}
          />
        ) : (
          <UploadCard error={error} onFile={upload} />
        )
      ) : null}
    </div>
  );
}
