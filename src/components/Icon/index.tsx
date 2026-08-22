import { type IconProps, useIcon } from "./hook.ts";

export type { IconProps, MvIconName } from "./hook.ts";

export function Icon(props: IconProps) {
  const { svg, d, caption } = useIcon(props);

  return (
    <svg {...svg}>
      <title>{caption}</title>
      <path d={d} />
    </svg>
  );
}
