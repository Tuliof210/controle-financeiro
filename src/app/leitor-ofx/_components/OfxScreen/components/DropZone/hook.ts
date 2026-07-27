import { type DragEvent, useState } from "react";

export type DropZoneProps = {
  onFile: (file: File) => void;
};

// Split out of the hook so the handlers are testable: hook.test.ts runs in the
// node environment with no React renderer, so calling useDropZone — which calls
// useState — would throw. These take the setter instead and stay pure.
export function dropHandlers(
  setOver: (over: boolean) => void,
  { onFile }: DropZoneProps,
) {
  return {
    // preventDefault on EVERY dragover, not just the first: without it the
    // browser navigates to the dropped file and the SPA is gone.
    onDragOver: (event: DragEvent<HTMLElement>) => {
      event.preventDefault();
      setOver(true);
    },
    // dragleave bubbles from every child of the panel, so crossing from its
    // padding onto the glyph, the eyebrow or the button fires one while the
    // pointer never left — and the violet border, which does not transition,
    // would visibly snap off and back. Only a relatedTarget outside the panel
    // means the drag really left it.
    onDragLeave: (event: DragEvent<HTMLElement>) => {
      if (!event.currentTarget.contains(event.relatedTarget as Node)) {
        setOver(false);
      }
    },
    onDrop: (event: DragEvent<HTMLElement>) => {
      event.preventDefault();
      setOver(false);
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
