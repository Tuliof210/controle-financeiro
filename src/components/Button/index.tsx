import { type ButtonProps, useButton } from "./hook";

export function Button(props: ButtonProps) {
  return <button {...useButton(props)} />;
}
