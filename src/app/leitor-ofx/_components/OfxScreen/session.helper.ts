import type { OfxReport } from "@/app/api/ofx/types";

export const SESSION_KEY = "ofx-report";

// sessionStorage can hold anything a previous version of this screen — or a
// user with devtools — left behind, so parse defensively: any shape that is
// not a report reads as absent rather than letting the table map over
// undefined. The storage calls themselves stay in hook.ts, where ThemeToggle
// and ProfileProvider keep theirs; this half is pure parsing.
export function parseSession(raw: string | null): OfxReport | null {
  if (!raw) {
    return null;
  }
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed?.months) && Array.isArray(parsed?.accounts)
      ? (parsed as OfxReport)
      : null;
  } catch {
    return null;
  }
}
