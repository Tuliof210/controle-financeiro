const UNKNOWN = "?";
const FIRST_TWO = 2;
const WHITESPACE = /\s+/;

export function initialsOf(name: string): string {
  const parts = name.trim().split(WHITESPACE).filter(Boolean);
  if (parts.length === 0) {
    return UNKNOWN;
  }
  const [first, ...rest] = parts;
  if (rest.length === 0) {
    return first.slice(0, FIRST_TWO).toUpperCase();
  }
  const last = rest.at(-1) ?? first;
  return `${first[0]}${last[0]}`.toUpperCase();
}
