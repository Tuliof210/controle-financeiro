const NOON = 12;
const EVENING = 18;

export function getGreeting(date: Date): string {
  const h = date.getHours();
  if (h < NOON) {
    return "Bom dia";
  }
  if (h < EVENING) {
    return "Boa tarde";
  }
  return "Boa noite";
}
