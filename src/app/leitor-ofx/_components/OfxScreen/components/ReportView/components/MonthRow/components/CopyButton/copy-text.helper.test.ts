import { afterEach, describe, expect, it, vi } from "vitest";
import { copyText } from "./copy-text.helper";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("copyText", () => {
  it("reports done and writes the string it was given", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { clipboard: { writeText } });
    expect(await copyText("4312,50")).toBe("done");
    expect(writeText).toHaveBeenCalledWith("4312,50");
  });

  it("reports failed when the write is denied", async () => {
    vi.stubGlobal("navigator", {
      clipboard: { writeText: vi.fn().mockRejectedValue(new Error("denied")) },
    });
    expect(await copyText("4312,50")).toBe("failed");
  });

  // An insecure origin has no navigator.clipboard at all, so the throw is a
  // synchronous TypeError rather than a rejection.
  it("reports failed when there is no clipboard API", async () => {
    vi.stubGlobal("navigator", {});
    expect(await copyText("4312,50")).toBe("failed");
  });

  // This is the case that makes the try's placement load-bearing: with no
  // navigator at all the throw is on the identifier itself, so hoisting the
  // access above the try would escape the catch. Verified by mutation — the
  // clipboard-undefined case above passes either way, this one does not.
  it("reports failed when there is no navigator at all", async () => {
    vi.stubGlobal("navigator", undefined);
    expect(await copyText("4312,50")).toBe("failed");
  });
});
