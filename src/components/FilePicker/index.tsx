import { Button } from "@/components/Button";
import { type FilePickerProps, useFilePicker } from "./hook";

export function FilePicker(props: FilePickerProps) {
  const { label, disabled, inputRef, open, change } = useFilePicker(props);

  return (
    <>
      {/* `hidden` rather than display:none in CSS — it takes the input out of
          the tab order and the accessibility tree, leaving the Button as the
          single accessible control, with its own 44px target and focus ring. */}
      <input
        ref={inputRef}
        type="file"
        accept=".ofx,text/plain"
        onChange={change}
        hidden
      />
      <Button onClick={open} disabled={disabled}>
        {label}
      </Button>
    </>
  );
}
