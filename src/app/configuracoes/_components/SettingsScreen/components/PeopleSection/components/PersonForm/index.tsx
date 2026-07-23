import { Button } from "@/components/Button";
import { ColorPicker } from "@/components/ColorPicker";
import { TextField } from "@/components/TextField";
import { type PersonFormProps, usePersonForm } from "./hook";
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
