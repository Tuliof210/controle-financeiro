import { useEffect, useState } from "react";
import { copyText } from "./copy-text.helper";

type Status = "idle" | "done" | "failed";

export type CopyButtonProps = {
  text: string;
  label: string;
};

const ANNOUNCEMENTS: Record<Status, string> = {
  idle: "",
  done: "Copiado",
  failed: "Falha ao copiar",
};

export function useCopyButton({ text, label }: CopyButtonProps) {
  const [status, setStatus] = useState<Status>("idle");

  useEffect(() => {
    if (status === "idle") {
      return;
    }
    const id = setTimeout(() => setStatus("idle"), 1500);
    // Without the cleanup, a row unmounted by "Trocar arquivo" mid-timeout
    // sets state after unmount.
    return () => clearTimeout(id);
  }, [status]);

  const copy = async () => {
    // Back to idle FIRST. Copying the same cell twice would otherwise set an
    // Object.is-equal status, which React bails out of — the effect would not
    // re-run, the first click's countdown would keep running, and the second
    // copy would get no acknowledgement at all. The commit before the await
    // gives the repeat click a visible blink and restarts the countdown.
    setStatus("idle");
    setStatus(await copyText(text));
  };

  return { label, status, copy, announcement: ANNOUNCEMENTS[status] };
}
