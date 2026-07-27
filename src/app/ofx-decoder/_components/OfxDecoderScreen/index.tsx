"use client";

import { FileUp } from "lucide-react";
import { DropZone } from "@/components/DropZone";
import { PageHeader } from "@/components/PageHeader";
import { SectionCard } from "@/components/SectionCard";
import { TreeView } from "./components/TreeView";
import { useOfxDecoderScreen } from "./hook";
import styles from "./style.module.scss";

export function OfxDecoderScreen() {
  const { fileName, parsed, error, upload, close } = useOfxDecoderScreen();

  return (
    <div className={styles.screen}>
      <PageHeader
        eyebrow="IMPORTAÇÃO"
        title="OFX Decoder"
        subtitle="Veja a árvore completa de tags do arquivo, sem enviar nada."
      />
      {parsed ? (
        <TreeView
          fileName={fileName}
          header={parsed.header}
          root={parsed.root}
          onClose={close}
          onFile={upload}
        />
      ) : (
        <SectionCard title="Enviar arquivo OFX" icon={FileUp}>
          <DropZone onFile={upload} />
          {error ? (
            <p className={styles.error}>
              <span aria-hidden>▲</span> {error}
            </p>
          ) : null}
        </SectionCard>
      )}
    </div>
  );
}
