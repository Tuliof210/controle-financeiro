// The clipboard write, split out of the hook so the failure path is covered by
// a test rather than only by a browser check. It is the path that matters: a
// failure that looks like success means the owner pastes whatever was on the
// clipboard before. The React shell around it cannot run outside a renderer;
// these four lines can.
export async function copyText(text: string): Promise<"done" | "failed"> {
  try {
    // The property access is inside the try on purpose: navigator.clipboard is
    // undefined on an insecure origin, so this throws a TypeError
    // synchronously — which in an async function still becomes a rejection the
    // catch sees. A bare .catch() on the call would have missed it.
    await navigator.clipboard.writeText(text);
    return "done";
  } catch {
    return "failed";
  }
}
