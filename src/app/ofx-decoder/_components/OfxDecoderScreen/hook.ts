import { useEffect, useState } from "react";
import { decodeOfx } from "@/lib/decode.ts";
import { type OfxNode, parseOfxTags } from "./tag-tree.helper.ts";

interface Parsed {
  header: OfxNode[];
  root: OfxNode;
}

export function useOfxDecoderScreen() {
  const [fileName, setFileName] = useState("");
  const [parsed, setParsed] = useState<Parsed | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Same hazard as leitor-ofx's OfxScreen: the drop panel's own preventDefault
  // only covers the pointer landing ON it. A file dropped a few pixels off
  // hits the browser's default instead, which opens it in the tab and takes
  // the SPA with it — so this has to be window-level, not DropZone's problem.
  useEffect(() => {
    const swallow = (event: Event) => event.preventDefault();
    window.addEventListener("dragover", swallow);
    window.addEventListener("drop", swallow);
    return () => {
      window.removeEventListener("dragover", swallow);
      window.removeEventListener("drop", swallow);
    };
  }, []);

  // No apiUpload here on purpose — decodeOfx + parseOfxTags both run
  // synchronously in the browser, so nothing about this ever leaves it.
  const upload = async (file: File) => {
    setFileName(file.name);
    const bytes = new Uint8Array(await file.arrayBuffer());
    const { header, root } = parseOfxTags(decodeOfx(bytes));
    if (root) {
      setParsed({ header, root });
      setError(null);
    } else {
      setParsed(null);
      setError("Nenhuma tag encontrada nesse arquivo.");
    }
  };

  const close = () => {
    setParsed(null);
    setError(null);
    setFileName("");
  };

  return { fileName, parsed, error, upload, close };
}
