import type { MvIconName } from "@/components/Icon/hook.ts";

const ICON_SM = 12;
const ICON_MD = 14;
const ICON_LG = 16;

function arrowOf(up: boolean, down: boolean): MvIconName | undefined {
  if (up) {
    return "trendingUp";
  }
  if (down) {
    return "trendingDown";
  }
}

function percentLabel(value: number, up: boolean, down: boolean): string {
  const abs = Math.abs(value).toLocaleString("pt-BR", {
    maximumFractionDigits: 1,
  });
  if (up) {
    return `+${abs}%`;
  }
  if (down) {
    return `−${abs}%`;
  }
  return `${abs}%`;
}

function isGood(invert: boolean, up: boolean, down: boolean): boolean {
  if (invert) {
    return down;
  }
  return up;
}

function toneOf(up: boolean, down: boolean, good: boolean): string {
  if (!(up || down)) {
    return "muted";
  }
  if (good) {
    return "positive";
  }
  return "negative";
}

function iconSizeOf(size: "sm" | "md" | "lg"): number {
  if (size === "sm") {
    return ICON_SM;
  }
  if (size === "lg") {
    return ICON_LG;
  }
  return ICON_MD;
}

export { arrowOf, iconSizeOf, isGood, percentLabel, toneOf };
