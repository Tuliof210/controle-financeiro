import { type IconButtonProps, useIconButton } from "./hook";

export function IconButton(props: IconButtonProps) {
  return <button {...useIconButton(props)} />;
}
