import { type ReactNode, useEffect, useRef, useState } from "react";

// What becomes of the file after it is read — the one line that differs
// between the two screens using this panel. This default is true of the
// decoder; /leitor-ofx overrides it, because importing writes to the database.
const DEFAULT_NOTE =
  "O arquivo é lido no seu navegador e some quando você fecha a aba. Nada é salvo no banco.";

export interface DropZoneProps {
  onFile: (file: File) => void;
  note?: ReactNode;
}

export function useDropZone({ onFile, note = DEFAULT_NOTE }: DropZoneProps) {
  const [over, setOver] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Bound through the ref, not as JSX props: drag-and-drop is a pointer-only
  // enhancement over the FilePicker button inside, and handler props on a
  // non-interactive <div> are what a11y linting flags. The DOM behaviour is
  // identical — same node, same events, same order.
  useEffect(() => {
    const zone = ref.current;
    if (!zone) {
      return;
    }
    // preventDefault on EVERY dragover, not just the first: without it the
    // browser navigates to the dropped file and the SPA is gone.
    const onDragOver = (event: DragEvent) => {
      event.preventDefault();
      setOver(true);
    };
    // dragleave bubbles from every child of the panel, so crossing from its
    // padding onto the glyph, the eyebrow or the button fires one while the
    // pointer never left — and the violet border, which does not transition,
    // would visibly snap off and back. Only a relatedTarget outside the panel
    // means the drag really left it.
    const onDragLeave = (event: DragEvent) => {
      if (!zone.contains(event.relatedTarget as Node)) {
        setOver(false);
      }
    };
    const onDrop = (event: DragEvent) => {
      event.preventDefault();
      setOver(false);
      // Only the first file: the endpoint accepts one `file` field, and
      // silently parsing the first of five beats an error the user cannot act
      // on. No extension check either — the route already refuses a non-OFX
      // file by name, and a looser second check would reject files it accepts.
      const file = event.dataTransfer?.files[0];
      if (file) {
        onFile(file);
      }
    };
    zone.addEventListener("dragover", onDragOver);
    zone.addEventListener("dragleave", onDragLeave);
    zone.addEventListener("drop", onDrop);
    return () => {
      zone.removeEventListener("dragover", onDragOver);
      zone.removeEventListener("dragleave", onDragLeave);
      zone.removeEventListener("drop", onDrop);
    };
  }, [onFile]);

  return { onFile, note, over, ref };
}
