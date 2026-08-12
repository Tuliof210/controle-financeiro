import { type IconButtonProps, useIconButton } from "./hook.ts";

export function IconButton(props: IconButtonProps) {
  return <button {...useIconButton(props)} />;
}
