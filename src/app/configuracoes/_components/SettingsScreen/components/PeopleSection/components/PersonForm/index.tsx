import { Button } from "@/components/Button/index.tsx";
import { ColorPicker } from "@/components/ColorPicker/index.tsx";
import { TextField } from "@/components/TextField/index.tsx";
import { type PersonFormProps, usePersonForm } from "./hook.ts";
import styles from "./style.module.scss";

export function PersonForm({
  initial,
  error,
  onSubmit,
  submitLabel,
}: PersonFormProps) {
  const { name, setName, color, setColor, submit } = usePersonForm({
    initial,
    onSubmit,
  });

  return (
    <div className={styles.form}>
      <TextField
        id="person-name"
        label="Nome"
        value={name}
        onChange={setName}
        error={error}
      />
      <ColorPicker value={color} onChange={setColor} />
      <Button onClick={submit} disabled={!name.trim()}>
        {submitLabel}
      </Button>
    </div>
  );
}
