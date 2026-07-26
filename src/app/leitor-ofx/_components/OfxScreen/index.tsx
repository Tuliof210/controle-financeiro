"use client";

import { ReportView } from "./components/ReportView";
import { UploadCard } from "./components/UploadCard";
import { useOfxScreen } from "./hook";
import styles from "./style.module.scss";

export function OfxScreen() {
  const { loaded, report, error, loading, upload, close } = useOfxScreen();

  return (
    <div className={styles.screen}>
      <h1 className={styles.eyebrow}>Leitor OFX</h1>
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
