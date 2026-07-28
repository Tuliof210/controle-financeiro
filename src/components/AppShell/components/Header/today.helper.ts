// "DOM, 26 JUL 2026" — the design's second header line. The design also
// appended "· DADOS ATÉ … · PROJEÇÃO ATÉ …", which needs the settings range the
// header does not fetch; the date alone is the honest half.
//
// `now` is injected (like greeting.helper.ts) so both header lines read one
// clock, taken once in hook.ts.
// Intl supplies both the weekday and the month name — pt-BR abbreviates them
// with a trailing dot ("dom.", "jul."), which the design's all-caps form drops.
export function formatToday(now: Date): string {
  const parts = new Intl.DateTimeFormat("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).formatToParts(now);

  const read = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value.replace(".", "") ?? "";

  return `${read("weekday")}, ${read("day")} ${read("month")} ${read("year")}`.toUpperCase();
}
