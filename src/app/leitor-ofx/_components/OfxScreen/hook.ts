import { useEffect, useState } from "react";
import type { OfxReport } from "@/app/api/ofx/types.ts";
import { apiUpload } from "@/lib/api.ts";
import { parseSession, SESSION_KEY } from "./session.helper.ts";

// Every storage call is wrapped and swallowed, matching ThemeToggle and
// ProfileProvider: a browser with storage disabled loses the cache across a
// reload, which is a degraded screen rather than a broken one.
const readStored = (): OfxReport | null => {
  try {
    return parseSession(sessionStorage.getItem(SESSION_KEY));
  } catch {
    return null;
  }
};

const writeStored = (report: OfxReport) => {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(report));
  } catch {}
};

const clearStored = () => {
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch {}
};

export function useOfxScreen() {
  const [report, setReport] = useState<OfxReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  // Display-only, for the loading card's own heading. Deliberately not
  // persisted: the stored report already carries its fileName.
  const [fileName, setFileName] = useState("");

  // Read in an effect, never during render: that is what keeps the first paint
  // identical on server and client, and `loaded` is what stops the upload card
  // flashing before the stored report arrives.
  useEffect(() => {
    setReport(readStored());
    setLoaded(true);
  }, []);

  // The drop panel's own preventDefault only covers events that land ON it. A
  // file dropped a few pixels outside still hits the browser's default, which
  // is to open the file in the tab — the SPA, and the report with it, gone.
  // Only a window-level preventDefault stops that, and it has to cover dragover
  // as well as drop. It lives on the screen, not on DropZone: DropZone is only
  // mounted in the idle state, while the report state invites a drag with
  // "Trocar arquivo" and has the most to lose from one landing off-target.
  useEffect(() => {
    const swallow = (event: Event) => event.preventDefault();
    window.addEventListener("dragover", swallow);
    window.addEventListener("drop", swallow);
    return () => {
      window.removeEventListener("dragover", swallow);
      window.removeEventListener("drop", swallow);
    };
  }, []);

  const upload = async (file: File) => {
    setFileName(file.name);
    setLoading(true);
    setError(null);
    const result = await apiUpload<OfxReport>("/api/ofx", file);
    // api.ts never rejects, and a 2xx without a `data` key resolves to neither
    // branch — so both have to be checked before this counts as a success.
    if (result.error || !result.data) {
      setError(result.error ?? "Erro inesperado");
    } else {
      setReport(result.data);
      writeStored(result.data);
    }
    setLoading(false);
  };

  const close = () => {
    setReport(null);
    setError(null);
    setFileName("");
    clearStored();
  };

  return { loaded, report, error, loading, fileName, upload, close };
}
