import { type DragEvent, useState } from "react";

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

  return { ...props, over, ...dropHandlers(setOver, props) };
}
