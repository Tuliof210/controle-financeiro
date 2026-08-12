"use client";

import { PageHeader } from "@/components/PageHeader/index.tsx";
import { LoadingCard } from "./components/LoadingCard/index.tsx";
import { ReportView } from "./components/ReportView/index.tsx";
import { UploadCard } from "./components/UploadCard/index.tsx";
import { useOfxScreen } from "./hook.ts";
import styles from "./style.module.scss";

export function OfxScreen() {
  const { loaded, report, error, loading, fileName, upload, close } =
    useOfxScreen();
  // Exactly the first arm of the ternary this replaced, so the other two keep
  // firing on its negation and nothing new is gated on `loaded`.
  const showLoading = loaded && loading;

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
      {Boolean(showLoading) && <LoadingCard fileName={fileName} />}
      {!showLoading && report !== null && (
        <ReportView
          report={report}
          error={error}
          loading={loading}
          onClose={close}
          onFile={upload}
        />
      )}
      {!showLoading && report === null && (
        <UploadCard error={error} onFile={upload} />
      )}
    </div>
  );
}
