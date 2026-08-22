import { PALETTE } from "@/lib/palette.ts";

const HASH_MULTIPLIER = 31;

export function colorOf(name: string): string {
  let hash = 0;
  for (const ch of name) {
    hash = hash * HASH_MULTIPLIER + ch.charCodeAt(0);
  }
  const key = PALETTE[hash % PALETTE.length] ?? PALETTE[0];
  return `var(--cat-${key})`;
}
