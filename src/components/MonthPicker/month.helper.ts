export const MONTH_LABELS = [
  "Jan",
  "Fev",
  "Mar",
  "Abr",
  "Mai",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Out",
  "Nov",
  "Dez",
] as const;

export function splitYYYYMM(value: number) {
  return { year: Math.trunc(value / 100), month: value % 100 };
}

export function composeYYYYMM(year: number, month: number) {
  return year * 100 + month;
}

export function currentYYYYMM(now = new Date()) {
  return composeYYYYMM(now.getFullYear(), now.getMonth() + 1);
}

export function yearOptions(currentYear = new Date().getFullYear()) {
  const start = currentYear - 3;
  const end = currentYear + 8;
  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}
