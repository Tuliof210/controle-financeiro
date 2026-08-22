import { type AvatarProps, useAvatar } from "./hook.ts";

export function Avatar(props: AvatarProps) {
  const view = useAvatar(props);

  return (
    <span
      className={view.className}
      style={view.style}
      role="img"
      aria-label={view.label}
    >
      {view.src !== undefined && (
        // biome-ignore lint/performance/noImgElement: src is caller-supplied; next/image needs a known host
        <img className={view.imageClass} src={view.src} alt={view.alt} />
      )}
      {view.src === undefined && view.initials}
    </span>
  );
}
