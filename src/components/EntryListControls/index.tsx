import { SelectField } from "@/components/SelectField/index.tsx";
import { TextField } from "@/components/TextField/index.tsx";
import { type EntryListControlsProps, useEntryListControls } from "./hook.ts";
import styles from "./style.module.scss";

export function EntryListControls(props: EntryListControlsProps) {
  const { name, kind, sort, dir } = useEntryListControls(props);

  return (
    <div className={styles.bar}>
      <TextField {...name} />
      {kind !== undefined && <SelectField {...kind} />}
      <SelectField {...sort} />
      <SelectField {...dir} />
    </div>
  );
}
