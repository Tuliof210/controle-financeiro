import { Icon } from "@/components/Icon/index.tsx";
import { MoneyDisplay } from "@/components/MoneyDisplay/index.tsx";
import { type DeltaProps, useDelta } from "./hook.ts";

export function Delta(props: DeltaProps) {
  const { deltaProps, arrow, iconSize, money, value, label } = useDelta(props);

  return (
    <span {...deltaProps}>
      {arrow !== undefined && <Icon name={arrow} size={iconSize} />}
      {money ? (
        <MoneyDisplay
          value={value}
          variant="delta"
          showPositiveSign={value > 0}
        />
      ) : (
        label
      )}
    </span>
  );
}
