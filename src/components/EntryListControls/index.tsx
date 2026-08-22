import { Field } from "@/components/Field/index.tsx";
import { Select } from "@/components/Select/index.tsx";
import { type EntryListControlsProps, useEntryListControls } from "./hook.ts";
import styles from "./style.module.scss";

export function EntryListControls(props: EntryListControlsProps) {
  const { name, kind, sort, dir } = useEntryListControls(props);

  return (
    <div className={styles.bar}>
      <Field {...name} />
      {kind !== undefined && <Select {...kind} />}
      <Select {...sort} />
      <Select {...dir} />
    </div>
  );
}
