"use client";

import { FileUp } from "lucide-react";
import { DropZone } from "@/components/DropZone/index.tsx";
import { PageHeader } from "@/components/PageHeader/index.tsx";
import { SectionCard } from "@/components/SectionCard/index.tsx";
import { ERROR_GLYPH } from "@/lib/glyphs.ts";
import { TreeView } from "./components/TreeView/index.tsx";
import { useOfxDecoderScreen } from "./hook.ts";
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
      {parsed !== null && (
        <TreeView
          fileName={fileName}
          header={parsed.header}
          root={parsed.root}
          onClose={close}
          onFile={upload}
        />
      )}
      {parsed === null && (
        <SectionCard title="Enviar arquivo OFX" icon={FileUp}>
          <DropZone onFile={upload} />
          {Boolean(error) && (
            <p className={styles.error}>
              <span aria-hidden={true}>{ERROR_GLYPH}</span> {error}
            </p>
          )}
        </SectionCard>
      )}
    </div>
  );
}
