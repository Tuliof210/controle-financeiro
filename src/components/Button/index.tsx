import { Icon } from "@/components/Icon/index.tsx";
import { type ButtonProps, useButton } from "./hook.ts";

export function Button(props: ButtonProps) {
  const { buttonProps, iconLeft, iconRight, children } = useButton(props);

  return (
    <button {...buttonProps}>
      {iconLeft !== undefined && <Icon name={iconLeft} />}
      {children}
      {iconRight !== undefined && <Icon name={iconRight} />}
    </button>
  );
}
