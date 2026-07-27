import { type DragEvent, useEffect, useState } from "react";

export type DropZoneProps = {
  disabled?: boolean;
  onFile: (file: File) => void;
};

// Split out of the hook so the handlers are testable: hook.test.ts runs in the
// node environment with no React renderer, so calling useDropZone — which calls
// useState — would throw. These take the setter instead and stay pure.
export function dropHandlers(
  setOver: (over: boolean) => void,
  { disabled, onFile }: DropZoneProps,
) {
  return {
    // preventDefault on EVERY dragover, not just the first: without it the
    // browser navigates to the dropped file and the SPA is gone.
    onDragOver: (event: DragEvent<HTMLElement>) => {
      event.preventDefault();
      if (!disabled) {
        setOver(true);
      }
    },
    onDragLeave: () => setOver(false),
    onDrop: (event: DragEvent<HTMLElement>) => {
      event.preventDefault();
      setOver(false);
      if (disabled) {
        return;
      }
      // Only the first file: the endpoint accepts one `file` field, and
      // silently parsing the first of five beats an error the user cannot act
      // on. No extension check either — the route already refuses a non-OFX
      // file by name, and a looser second check would reject files it accepts.
      const file = event.dataTransfer.files?.[0];
      if (file) {
        onFile(file);
      }
    },
  };
}

export function useDropZone(props: DropZoneProps) {
  const [over, setOver] = useState(false);

  // The panel's own preventDefault only covers events that land ON it. A file
  // dropped a few pixels outside still hits the browser's default, which is to
  // open the file in the tab — the SPA, and the report with it, gone. Only a
  // window-level preventDefault stops that, and it has to cover dragover as
  // well as drop. Scoped to the panel's lifetime on purpose: this is the one
  // place that invites a drag, and the report state has no target to miss.
  useEffect(() => {
    const swallow = (event: Event) => event.preventDefault();
    window.addEventListener("dragover", swallow);
    window.addEventListener("drop", swallow);
    return () => {
      window.removeEventListener("dragover", swallow);
      window.removeEventListener("drop", swallow);
    };
  }, []);

  return { ...props, over, ...dropHandlers(setOver, props) };
}
