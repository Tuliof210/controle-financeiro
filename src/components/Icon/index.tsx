import { type IconProps, useIcon } from "./hook.ts";

export type { IconProps, MvIconName } from "./hook.ts";

export function Icon(props: IconProps) {
  const { svg, d, title } = useIcon(props);

  return (
    // biome-ignore lint/a11y/noSvgWithoutTitle: kit only titles when `title` is passed; a fallback would tooltip the glyph id
    <svg {...svg}>
      {Boolean(title) && <title>{title}</title>}
      <path d={d} />
    </svg>
  );
}
