import React from "react";

/* Monevo single-stroke icon system.
   24×24 grid, 1.75 stroke, round caps/joins, currentColor.
   NEVER draw an inline icon outside this set — add it here instead. */

export const MV_ICONS = {
  wallet: "M3 8.5A2.5 2.5 0 0 1 5.5 6H18a2 2 0 0 1 2 2v1M3 8.5V17a2 2 0 0 0 2 2h13a2 2 0 0 0 2-2v-2M3 8.5V8m18 4h-4a2 2 0 0 0 0 4h4",
  card: "M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Zm0 4h18M7 16h4",
  target: "M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0-18 0M12 12m-5 0a5 5 0 1 0 10 0a5 5 0 1 0-10 0M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0-2 0",
  trendingUp: "M3 17l6-6 4 4 8-8M21 7v5m0-5h-5",
  trendingDown: "M3 7l6 6 4-4 8 8M21 17v-5m0 5h-5",
  arrowUpRight: "M7 17 17 7M9 7h8v8",
  arrowDownRight: "M7 7l10 10M17 9v8H9",
  plus: "M12 5v14M5 12h14",
  minus: "M5 12h14",
  repeat: "M17 2l4 4-4 4M3 11V9a4 4 0 0 1 4-4h14M7 22l-4-4 4-4m14 5v2a4 4 0 0 1-4 4H3",
  calendar: "M7 3v3m10-3v3M4 8h16M5 6h14a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1Z",
  alertTriangle: "M12 9v4m0 4h.01M10.3 4.3 2.5 18a2 2 0 0 0 1.7 3h15.6a2 2 0 0 0 1.7-3L13.7 4.3a2 2 0 0 0-3.4 0Z",
  sparkles: "M12 4l1.6 4.4L18 10l-4.4 1.6L12 16l-1.6-4.4L6 10l4.4-1.6L12 4ZM19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15Z",
  eye: "M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0-6 0",
  lock: "M6 10V8a6 6 0 0 1 12 0v2M5 10h14a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1Z",
  check: "M5 12.5 10 17 19 7",
  x: "M6 6l12 12M18 6 6 18",
  chevronDown: "M6 9l6 6 6-6",
  chevronRight: "M9 6l6 6-6 6",
  archive: "M4 7h16M5 7v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V7M4 7l1.5-3h13L20 7M10 12h4",
  search: "M11 11m-7 0a7 7 0 1 0 14 0a7 7 0 1 0-14 0M21 21l-4.3-4.3",
  settings: "M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0-6 0M19.4 13a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V21a2 2 0 0 1-4 0v-.2A1.6 1.6 0 0 0 7 19.3a1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0-1.1-2.7H1a2 2 0 0 1 0-4h.2A1.6 1.6 0 0 0 2.7 7a1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H7a1.6 1.6 0 0 0 1-1.5V1a2 2 0 0 1 4 0v.2A1.6 1.6 0 0 0 13 2.7a1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V7a1.6 1.6 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.2a1.6 1.6 0 0 0-1.4 1Z",
  bell: "M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6M10 20a2 2 0 0 0 4 0",
  user: "M12 12m-4 0a4 4 0 1 0 8 0a4 4 0 1 0-8 0M4 20a8 8 0 0 1 16 0",
  building: "M4 21V5a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v16M15 9h4a1 1 0 0 1 1 1v11M8 8h3M8 12h3M8 16h3M3 21h18",
  pieChart: "M12 3a9 9 0 1 0 9 9h-9V3Z M14 3a7 7 0 0 1 7 7h-7V3Z",
  banknote: "M4 7a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7Zm8 5m-2.5 0a2.5 2.5 0 1 0 5 0a2.5 2.5 0 1 0-5 0M7 9v.01M17 15v.01",
};

export function Icon({ name, size = 20, strokeWidth = 1.75, color = "currentColor", title, style, ...rest }) {
  const d = MV_ICONS[name];
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={title ? "img" : "presentation"}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      style={{ display: "block", flex: "none", ...style }}
      {...rest}
    >
      {title ? <title>{title}</title> : null}
      {d ? <path d={d} /> : null}
    </svg>
  );
}
