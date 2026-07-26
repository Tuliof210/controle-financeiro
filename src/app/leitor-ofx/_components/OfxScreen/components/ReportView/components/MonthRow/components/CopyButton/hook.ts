import { useEffect, useState } from "react";

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
    try {
      // The try must wrap the property access too, not just the promise:
      // navigator.clipboard is undefined on an insecure origin, so this throws
      // a TypeError synchronously — which inside an async function still
      // becomes a rejection the catch sees. A bare .catch() on the call would
      // not have caught it.
      await navigator.clipboard.writeText(text);
      setStatus("done");
    } catch {
      setStatus("failed");
    }
  };

  return { label, status, copy, announcement: ANNOUNCEMENTS[status] };
}
