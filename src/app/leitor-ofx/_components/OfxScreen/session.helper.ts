import type { OfxReport } from "@/app/api/ofx/types.ts";

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
    // fileHash is part of the test, not just the arrays: a report cached by a
    // build that predates it would otherwise flow on with an undefined hash,
    // leaving the import button with nothing to identify the file by.
    return Array.isArray(parsed?.months) &&
      Array.isArray(parsed?.accounts) &&
      typeof parsed?.fileHash === "string"
      ? (parsed as OfxReport)
      : null;
  } catch {
    return null;
  }
}
