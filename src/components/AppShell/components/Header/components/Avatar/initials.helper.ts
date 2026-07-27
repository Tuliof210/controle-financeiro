// "Ana Silva" -> "AS", "Família" -> "F". First letter of the first two words,
// uppercased; anything shorter simply yields fewer letters.
export function getInitials(label: string): string {
  return label
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}
