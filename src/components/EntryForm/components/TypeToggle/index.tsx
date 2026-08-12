import { Button } from "@/components/Button/index.tsx";
import { type TypeToggleProps, useTypeToggle } from "./hook.ts";
import styles from "./style.module.scss";

export function TypeToggle(props: TypeToggleProps) {
  const { options } = useTypeToggle(props);

  return (
    <div className={styles.toggle}>
      {options.map(({ kind, label, variant, select }) => (
        <Button key={kind} variant={variant} onClick={select}>
          {label}
        </Button>
      ))}
    </div>
  );
}
