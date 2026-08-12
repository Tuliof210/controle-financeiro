import { type ButtonProps, useButton } from "./hook.ts";

export function Button(props: ButtonProps) {
  return <button {...useButton(props)} />;
}
